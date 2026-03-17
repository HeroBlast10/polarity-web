# Polarity.ai Web

[English README](./README.md)

立即体验: [https://polarity-web-two.vercel.app](https://polarity-web-two.vercel.app)

进入首页后，点击 `Live Demo` 即可直接进入 Single Chat 试用。

<p align="center">
  <img src="public/logo.png" alt="Polarity Logo" width="180" />
</p>

Polarity 是一个拒绝中立的 AI。它要么替你捍卫最离谱的观点，要么直接拆穿你最自信的结论。

这个仓库是 Polarity.ai 的 Next.js 前端项目。

## 功能亮点

- **Live Demo**：首页一键试用。
- **Single Chat**：与 Advocatus（支持者）或 Inquisitor（质疑者）单独对话。
- **Duel Mode**：观看两个 AI 角色以不同模式互相交锋。
- **自带 Key**：可自行配置 provider、model 和 backend。

## 模型建议

Polarity 在 **未审查模型** 或 **本地模型** 上的效果通常更好。

- 本地 Ollama 模型通常能给出更尖锐、更少过滤的对话风格。
- 未审查或轻度对齐的模型更容易保持角色一致性。
- 安全限制较重的云端模型虽然也能运行，但输出往往不够狠、不够好笑，也不够“入戏”。

如果你想体验更完整的 Polarity 风格，优先推荐本地模型或过滤较少的模型。

## 后端

这个前端依赖 [Polarity Agent](https://github.com/HeroBlast10/polarity-agent) 后端。

### 后端快速启动

```bash
git clone https://github.com/HeroBlast10/polarity-agent.git
cd polarity-agent

# 安装并启用 Ollama 支持
pip install -e ".[ollama]"

# 启动 API 服务
polarity serve
```

### 后端能力

- 支持 OpenAI 兼容 provider
- 支持 LiteLLM
- 支持 Ollama 本地推理
- 支持流式聊天和 Duel 响应
- 提供 CLI 和 Web 工具

## 前端启动

### 前置条件

- Node.js 18+
- 一个正在运行的 Polarity backend
- 你的 provider API key，或者本地 Ollama 模型

### 安装

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

然后：

1. 打开 `Settings`
2. 配置 provider、model、API key 和 backend URL
3. 点击保存
4. 开始聊天

## 在线体验

在线地址: [https://polarity-web-two.vercel.app](https://polarity-web-two.vercel.app)

- 首页提供 `Live Demo` 入口，适合快速试用。
- Demo 模式适合立即体验产品。
- 如果想获得更好的效果，建议在 `Settings` 中配置你自己的本地模型或未审查模型。

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## License

MIT
