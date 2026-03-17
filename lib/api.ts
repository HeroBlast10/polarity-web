import { ChatRequest, ChatResponse, Settings, ChatMessage, Persona } from './types';

const DEFAULT_API_BASE = 'https://polarity-web-two.vercel.app';

export function getApiBase(): string {
  if (typeof window === 'undefined') return DEFAULT_API_BASE;
  return localStorage.getItem('polarity_api_base') || DEFAULT_API_BASE;
}

export function setApiBase(base: string): void {
  localStorage.setItem('polarity_api_base', base);
}

interface RequestOptions {
  useBackendDefaults?: boolean;
  onReady?: () => void;
}

function buildChatRequest(
  settings: Settings,
  message: string,
  history: { role: string; content: string }[],
  pack: Persona,
  options?: RequestOptions
): ChatRequest {
  const request: ChatRequest = {
    message,
    history,
    pack,
  };

  if (options?.useBackendDefaults) {
    return request;
  }

  return {
    ...request,
    provider: settings.provider,
    model: settings.model,
    base_url: settings.baseUrl || null,
    api_key: settings.apiKey || null,
  };
}

export async function sendChat(
  settings: Settings,
  message: string,
  history: ChatMessage[],
  pack: Persona,
  options?: RequestOptions
): Promise<ChatResponse> {
  const apiBase = getApiBase();
  const response = await fetch(`${apiBase}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      buildChatRequest(
        settings,
        message,
        history.map((m) => ({ role: m.role, content: m.content })),
        pack,
        options
      )
    ),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  options?.onReady?.();
  return response.json();
}

export async function* streamChat(
  settings: Settings,
  message: string,
  history: ChatMessage[],
  pack: Persona,
  options?: RequestOptions
): AsyncGenerator<string> {
  const apiBase = getApiBase();
  const response = await fetch(`${apiBase}/api/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      buildChatRequest(
        settings,
        message,
        history.map((m) => ({ role: m.role, content: m.content })),
        pack,
        options
      )
    ),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  options?.onReady?.();
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.content) {
          yield parsed.content;
        }
        if (parsed.error) {
          throw new Error(parsed.error);
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }
}

export async function* streamDuelChat(
  settings: Settings,
  message: string,
  pack: Persona,
  history: { role: string; content: string }[] = [],
  options?: RequestOptions
): AsyncGenerator<string> {
  const apiBase = getApiBase();
  const response = await fetch(`${apiBase}/api/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildChatRequest(settings, message, history, pack, options)),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  options?.onReady?.();
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.content) {
          yield parsed.content;
        }
        if (parsed.error) {
          throw new Error(parsed.error);
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }
}
