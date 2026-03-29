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
| Backend | Express.js, Zod, JWT auth, SSE streaming |
| LLM | GPT-4o-mini via OpenRouter |
| Embeddings | text-embedding-3-small (OpenAI) |
| Vector DB | Qdrant |
| Database | PostgreSQL + Prisma 7 |
| Ingestion | Python script for shloka embedding & upsert |
| Monorepo | Turborepo + pnpm workspaces |

## Project Structure

```
geta-ai-rag-app/
├── apps/
│   ├── api/          # Express backend — auth, chat, RAG orchestration
│   └── web/          # Next.js frontend — chat UI, auth pages
├── packages/
│   ├── db/           # Prisma schema, migrations, client
│   ├── types/        # Shared TypeScript interfaces
│   └── config/       # Shared tsconfig presets
├── ingest/           # Python script to embed Gita shlokas into Qdrant
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 20+, pnpm, Python 3.10+
- Docker (for Postgres & Qdrant)

### Setup

```bash
# Start local databases
docker compose up -d

# Install dependencies
pnpm install

# Generate Prisma client & push schema
pnpm db:generate
pnpm db:push

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
pnpm dev
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
