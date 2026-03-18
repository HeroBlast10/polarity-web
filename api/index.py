"""Vercel Python API for Polarity Agent.

This module provides a serverless FastAPI backend for the Polarity Agent,
deployable via Vercel Serverless Functions.

Environment Variables:
- DEFAULT_PROVIDER: "openai", "ollama", or "litellm" (default: "openai")
- DEFAULT_MODEL: model name (default: "gpt-4o-mini")
- DEFAULT_BASE_URL: API base URL (optional)
- DEFAULT_API_KEY: API key for OpenAI/etc (required for cloud providers)
- DEEPSEEK_API_KEY: DeepSeek API key for Live Demo (never exposed to frontend)
"""

from __future__ import annotations

import json
import os
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import sys
from pathlib import Path

_api_dir = Path(__file__).resolve().parent
if str(_api_dir) not in sys.path:
    sys.path.insert(0, str(_api_dir))

from polarity_agent.packs import PackLoader
from polarity_agent.providers import Message, ProviderConfig, create_provider
from polarity_agent.providers.base import BaseProvider


# ── Default config from environment ───────────────────────────────────────

DEFAULT_PROVIDER = os.environ.get("DEFAULT_PROVIDER", "openai")
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "gpt-4o-mini")
DEFAULT_BASE_URL = os.environ.get("DEFAULT_BASE_URL", None)
DEFAULT_API_KEY = os.environ.get("DEFAULT_API_KEY", None)

# Live Demo 专用 — 仅在服务端读取，绝不下发给前端
_DEMO_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
_DEMO_MODEL = "deepseek-chat"
_DEMO_BASE_URL = "https://api.deepseek.com"
_DEMO_PROVIDER = "openai"  # DeepSeek 兼容 OpenAI 协议

# ── Demo 速率限制（内存，Vercel Serverless 实例级别） ─────────────────────
# 每个 IP 在 WINDOW_SECONDS 内最多 DEMO_LIMIT 次请求
_DEMO_LIMIT = 5
_WINDOW_SECONDS = 24 * 3600  # 24 小时窗口

# { ip: [timestamp, ...] }
_ip_log: dict[str, list[float]] = defaultdict(list)

# 允许访问 /api/demo 的 Origin 白名单
_ALLOWED_ORIGINS = {
    "https://polarity-web-two.vercel.app",
    "https://polarity.ai",
    # 本地开发
    "http://localhost:3000",
    "http://127.0.0.1:3000",
}


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_demo_rate_limit(ip: str) -> None:
    """超限则抛出 429。清理过期记录后计数。"""
    now = time.time()
    cutoff = now - _WINDOW_SECONDS
    log = _ip_log[ip]
    # 移除窗口外的旧记录
    _ip_log[ip] = [t for t in log if t > cutoff]
    if len(_ip_log[ip]) >= _DEMO_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Live Demo limit reached ({_DEMO_LIMIT} messages per 24 h). Configure your own API key to continue.",
        )
    _ip_log[ip].append(now)


def _check_demo_origin(request: Request) -> None:
    """非白名单 Origin/Referer 一律拒绝。"""
    origin = request.headers.get("origin", "")
    referer = request.headers.get("referer", "")
    allowed = any(
        origin.startswith(o) or referer.startswith(o)
        for o in _ALLOWED_ORIGINS
    )
    if not allowed:
        raise HTTPException(status_code=403, detail="Forbidden: origin not allowed.")


# ── Shared state ─────────────────────────────────────────────────────────

_providers: dict[tuple[str, ...], BaseProvider] = {}
_loader = PackLoader()


def _get_provider(name: str, config: ProviderConfig) -> BaseProvider:
    key = (name, config.model, config.base_url or "", config.api_key or "")
    if key not in _providers:
        _providers[key] = create_provider(name, config)
    return _providers[key]


@asynccontextmanager
async def _lifespan(_app: FastAPI):
    yield
    for p in _providers.values():
        await p.close()
    _providers.clear()


# ── Pydantic models ─────────────────────────────────────────────────────


class MessagePayload(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[MessagePayload] = []
    pack: str = "advocatus"
    provider: str = DEFAULT_PROVIDER
    model: str = DEFAULT_MODEL
    base_url: str | None = DEFAULT_BASE_URL
    api_key: str | None = DEFAULT_API_KEY


class DemoRequest(BaseModel):
    """Live Demo 专用请求体 — 不接受 provider/model/key，全由服务端决定。"""
    message: str
    history: list[MessagePayload] = []
    pack: str = "advocatus"


class ChatResponseModel(BaseModel):
    content: str
    pack: str
    stance: str
    model: str


class PackInfo(BaseModel):
    name: str
    display_name: str
    stance: str
    description: str
    version: str


# ── App ──────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Polarity Agent API",
    description="Where objectivity comes to die. Programmatically.",
    version="0.1.0",
    lifespan=_lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(_ALLOWED_ORIGINS),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


# ── Routes ───────────────────────────────────────────────────────────────


@app.get("/api/config")
async def get_config() -> dict:
    return {
        "provider": DEFAULT_PROVIDER,
        "model": DEFAULT_MODEL,
        "base_url": DEFAULT_BASE_URL if DEFAULT_BASE_URL else "https://api.openai.com/v1",
        "has_api_key": bool(DEFAULT_API_KEY),
    }


@app.get("/api/packs", response_model=list[PackInfo])
async def list_packs() -> list[PackInfo]:
    packs = _loader.discover()
    return [
        PackInfo(
            name=p.name,
            display_name=p.display_name,
            stance=p.stance.value,
            description=p.description,
            version=p.version,
        )
        for p in packs.values()
    ]


@app.post("/api/chat", response_model=ChatResponseModel)
async def chat(req: ChatRequest) -> ChatResponseModel:
    pack, provider = _resolve(req)
    messages = _build_messages(pack.system_prompt, req)
    try:
        resp = await provider.chat(messages, **pack.model_hints)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return ChatResponseModel(
        content=resp.content,
        pack=pack.name,
        stance=pack.stance.value,
        model=resp.model,
    )


@app.post("/api/stream")
async def stream(req: ChatRequest) -> StreamingResponse:
    pack, provider = _resolve(req)
    messages = _build_messages(pack.system_prompt, req)

    async def _generate():
        try:
            async for chunk in provider.stream(messages, **pack.model_hints):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(_generate(), media_type="text/event-stream")


@app.post("/api/demo")
async def demo_stream(req: DemoRequest, request: Request) -> StreamingResponse:
    """Live Demo 专用流式端点。
    - Origin 白名单校验，非允许来源直接 403
    - 每 IP 24h 内最多 5 次，超限 429
    - API Key 只存在服务端环境变量，前端不可见
    """
    _check_demo_origin(request)

    ip = _get_client_ip(request)
    _check_demo_rate_limit(ip)

    if not _DEMO_API_KEY:
        raise HTTPException(status_code=503, detail="Demo service not configured.")

    try:
        pack = _loader.load(req.pack)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    config = ProviderConfig(
        model=_DEMO_MODEL,
        base_url=_DEMO_BASE_URL,
        api_key=_DEMO_API_KEY,
    )
    try:
        provider = _get_provider(_DEMO_PROVIDER, config)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # 构造消息列表
    msgs = [Message(role="system", content=pack.system_prompt)]
    for m in req.history:
        msgs.append(Message(role=m.role, content=m.content))
    msgs.append(Message(role="user", content=req.message))

    async def _generate():
        try:
            async for chunk in provider.stream(msgs, **pack.model_hints):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(_generate(), media_type="text/event-stream")


# ── Internals ───────────────────────────────────────────────────────────


def _resolve(req: ChatRequest) -> tuple[Any, BaseProvider]:
    try:
        pack = _loader.load(req.pack)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    config = ProviderConfig(
        model=req.model,
        base_url=req.base_url,
        api_key=req.api_key,
    )
    try:
        provider = _get_provider(req.provider, config)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return pack, provider


def _build_messages(system_prompt: str, req: ChatRequest) -> list[Message]:
    msgs = [Message(role="system", content=system_prompt)]
    for m in req.history:
        msgs.append(Message(role=m.role, content=m.content))
    msgs.append(Message(role="user", content=req.message))
    return msgs


# ── Vercel handler ───────────────────────────────────────────────────────

app = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
