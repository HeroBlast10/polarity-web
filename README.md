# Polarity.ai Web

The AI that refuses to be neutral. It either defends your worst ideas or attacks your objective truths.

A Next.js web application featuring:

- **Single Chat** — Chat with Advocatus (the supporter) or Inquisitor (the challenger)
- **Duel Mode** — Watch two AI personas battle it out in three unique formats:
  - **Court Mode**: Classic lawyer vs. prosecutor showdown
  - **Troll Fight**: Two AI trolls in endless mutual destruction
  - **Praise Battle**: Two yes-men competing to out-flatter each other

## Backend

This frontend works with the [Polarity Agent](https://github.com/HeroBlast10/polarity-agent) backend.

### Quick Start (Backend)

```bash
# Clone and install
git clone https://github.com/HeroBlast10/polarity-agent.git
cd polarity-agent

# Install with Ollama support
pip install -e ".[ollama]"

# Launch the API server
polarity serve
```

### Backend Features

- **Provider Support**: OpenAI, LiteLLM, Ollama
- **CLI & Web UI**: Streamlit interface or command-line
- **Duel Mode**: Multiple debate formats
- **Trace Logging**: Session replay and debugging

## Getting Started

### Prerequisites

- Node.js 18+
- API key (OpenAI, LiteLLM, or local Ollama)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- Next.js 14
- React 18
- Tailwind CSS
- TypeScript

## License

MIT
