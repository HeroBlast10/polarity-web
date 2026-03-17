# Polarity.ai Web

[中文说明](./README.zh-CN.md)

Try it now: [https://polarity-web-two.vercel.app](https://polarity-web-two.vercel.app)

Click `Live Demo` on the homepage to jump into Single Chat immediately.

<p align="center">
  <img src="public/logo.png" alt="Polarity Logo" width="180" />
</p>

Polarity is the AI that refuses to be neutral. It either defends your worst ideas or attacks your most confident conclusions.

This repository contains the Next.js frontend for Polarity.ai.

## Highlights

- **Live Demo**: one-click trial from the homepage.
- **Single Chat**: talk to Advocatus (supporter) or Inquisitor (challenger).
- **Duel Mode**: watch two personas clash in multiple formats.
- **Bring Your Own Key**: plug in your own provider, model, and backend settings.

## Model Recommendation

Polarity works best with **uncensored models** or **local models**.

- Local Ollama models usually produce the sharpest, least filtered debates.
- Uncensored or lightly aligned models are better at staying in character.
- Heavily safety-tuned hosted models still work, but the outputs are often less aggressive, less funny, and less committed to the role.

If you want the full Polarity experience, start with a local or minimally filtered model.

## Backend

This frontend works with the [Polarity Agent](https://github.com/HeroBlast10/polarity-agent) backend.

### Quick Start (Backend)

```bash
git clone https://github.com/HeroBlast10/polarity-agent.git
cd polarity-agent

# Install with Ollama support
pip install -e ".[ollama]"

# Launch the API server
polarity serve
```

### Backend Features

- OpenAI-compatible providers
- LiteLLM support
- Ollama local inference
- Streaming chat and duel responses
- CLI and web tooling

## Frontend Setup

### Prerequisites

- Node.js 18+
- A running Polarity backend
- An API key for your provider, or a local model via Ollama

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Then:

1. Open `Settings`
2. Configure your provider, model, API key, and backend URL
3. Save settings
4. Start chatting

## Live Demo

Online app: [https://polarity-web-two.vercel.app](https://polarity-web-two.vercel.app)

- The homepage includes a `Live Demo` entry for quick testing.
- Demo mode is intended for immediate trial use.
- For the best experience, configure your own local or uncensored model in `Settings`.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## License

MIT
