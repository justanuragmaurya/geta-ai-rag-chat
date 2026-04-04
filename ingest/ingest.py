"""
Geta-AI Ingestion Script
Downloads Bhagavad Gita JSON from GitHub and upserts 700 shloka embeddings into Qdrant.

Usage:
  1. Clone the Gita data:
     git clone https://github.com/vedicscriptures/bhagavad-gita.git ingest/data/bhagavad-gita

  2. Run:
     cd ingest && pip install -r requirements.txt && python ingest.py
"""

import os, json, glob, time
from pathlib import Path
from dotenv import load_dotenv
from tqdm import tqdm
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

load_dotenv()

OPENROUTER_API_KEY = os.environ["OPENROUTER_API_KEY"]
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION = os.getenv("QDRANT_COLLECTION", "gita_shlokas")
DATA_DIR = os.getenv("GITA_DATA_DIR", "./data/bhagavad-gita")
EMBED_MODEL = "text-embedding-3-small"
EMBED_DIM = 1536
BATCH_SIZE = 50

openai_client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url=OPENROUTER_BASE_URL,
    default_headers={"HTTP-Referer": "https://geta-ai.app", "X-Title": "Geta-AI Ingest"},
)

qdrant = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    check_compatibility=False,
    prefer_grpc=False,
    https=True,
)


def load_shlokas():
    """Load per-shloka JSON files from the slok/ directory."""
    verses = []
    slok_dir = os.path.join(DATA_DIR, "slok")
    slok_files = sorted(glob.glob(f"{slok_dir}/*.json"))

    if not slok_files:
        raise FileNotFoundError(
            f"No JSON files found in {slok_dir}.\n"
            "Run: git clone https://github.com/vedicscriptures/bhagavad-gita.git ingest/data/bhagavad-gita"
        )

    for slok_file in slok_files:
        with open(slok_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        chapter_num = data.get("chapter")
        verse_num = data.get("verse")
        if chapter_num is None or verse_num is None:
            continue

        sanskrit = data.get("slok", "")
        transliteration = data.get("transliteration", "")
        hindi = data.get("tej", {}).get("ht", "") or data.get("rams", {}).get("ht", "")
        english = (
            data.get("purohit", {}).get("et", "")
            or data.get("siva", {}).get("et", "")
            or data.get("gambir", {}).get("et", "")
        )

        verses.append({
            "chapter": chapter_num,
            "verse": verse_num,
            "sanskrit": sanskrit,
            "transliteration": transliteration,
            "hindi": hindi,
            "english": english,
            "embed_text": f"{transliteration} {hindi} {english}".strip(),
        })

    return verses


def get_embedding(text: str) -> list[float]:
    """Get embedding from OpenRouter with retry."""
    for attempt in range(3):
        try:
            res = openai_client.embeddings.create(model=EMBED_MODEL, input=text)
            return res.data[0].embedding
        except Exception as e:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)
    return []


def setup_collection():
    """Create or recreate the Qdrant collection."""
    existing = [c.name for c in qdrant.get_collections().collections]
    if COLLECTION in existing:
        print(f"Collection '{COLLECTION}' exists — recreating...")
        qdrant.delete_collection(COLLECTION)

    qdrant.create_collection(
        collection_name=COLLECTION,
        vectors_config=VectorParams(size=EMBED_DIM, distance=Distance.COSINE),
    )
    print(f"Created collection '{COLLECTION}' (dim={EMBED_DIM}, cosine)")


def main():
    print("🪷  Geta-AI Ingestion Starting...\n")

    verses = load_shlokas()
    print(f"Loaded {len(verses)} shlokas from {DATA_DIR}\n")

    setup_collection()

    points = []
    failed = []

    for verse in tqdm(verses, desc="Embedding shlokas"):
        try:
            vector = get_embedding(verse["embed_text"])
            point_id = int(verse["chapter"]) * 1000 + int(verse["verse"])

            points.append(PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "chapter": verse["chapter"],
                    "verse": verse["verse"],
                    "sanskrit": verse["sanskrit"],
                    "transliteration": verse["transliteration"],
                    "hindi": verse["hindi"],
                    "english": verse["english"],
                }
            ))

            if len(points) >= BATCH_SIZE:
                qdrant.upsert(collection_name=COLLECTION, points=points)
                points = []

        except Exception as e:
            failed.append({"verse": verse, "error": str(e)})

    if points:
        qdrant.upsert(collection_name=COLLECTION, points=points)

    total = qdrant.count(COLLECTION).count
    print(f"\n✅ Ingestion complete. {total} shlokas in Qdrant.")

    if failed:
        print(f"⚠️  {len(failed)} verses failed — check failed.json")
        with open("failed.json", "w") as f:
            json.dump(failed, f, indent=2)


if __name__ == "__main__":
    main()
