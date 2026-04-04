# Geta-AI — Ask Krishna 🙏

A RAG-powered spiritual AI assistant that answers your life questions — career, relationships, fear, purpose — with wisdom from the Bhagavad Gita.

Ask in any language. Krishna responds in yours.

## How It Works

1. **You ask a question** — in Hindi, English, Hinglish, or anything
2. **Relevant shlokas are retrieved** from a vector database (Qdrant) using semantic search
3. **Krishna responds** with empathy, shloka citations, practical advice, and encouragement — streamed in real-time via SSE

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Zustand |
| Backend | FastAPI, Pydantic, JWT auth, SSE streaming |
| LLM | GPT-4o-mini via OpenRouter |
| Embeddings | text-embedding-3-small (OpenAI) |
| Vector DB | Qdrant |
| Database | PostgreSQL + SQLAlchemy 2 + Alembic |
| Ingestion | Python script for shloka embedding & upsert |
| Monorepo | Turborepo + Bun workspaces |

## Project Structure

```
geta-ai-rag-app/
├── apps/
│   ├── api/          # FastAPI backend — auth, chat, RAG orchestration
│   └── web/          # Next.js frontend — chat UI, auth pages
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   └── config/       # Shared tsconfig presets
└── ingest/           # Python script to embed Gita shlokas into Qdrant
```

## Getting Started

### Prerequisites

- Bun, Node.js 20+, Python 3.12+, and `uv`
- A running PostgreSQL instance
- A running Qdrant instance

### Setup

```bash
# Install frontend/workspace dependencies
bun install

# Install backend dependencies
cd apps/api
uv sync

# Run database migrations
uv run alembic upgrade head

# Return to repo root
cd ../..

# Set up environment variables
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
# Edit both files with your API keys

# Run the ingestion (one-time)
cd ingest
pip install -r requirements.txt
python ingest.py

# Start dev servers
cd ..
bun run dev
bun run api:dev
```

The frontend runs on `http://localhost:3000` and the API on `http://localhost:4000`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `QDRANT_URL` | Qdrant server URL |
| `OPENROUTER_API_KEY` | API key from openrouter.ai |
| `OPENAI_API_KEY` | OpenAI key (for embeddings in ingestion) |
| `JWT_SECRET` | Secret for signing auth tokens |

## License

MIT
