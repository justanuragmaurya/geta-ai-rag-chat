from app.lib.openrouter import openai_client
from app.lib.qdrant import COLLECTION, get_qdrant_client
from app.schemas.chat import ShlokaRef


async def retrieve_shlokas(query: str, top_k: int = 5) -> list[ShlokaRef]:
    embedding_response = await openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=query,
    )
    vector = embedding_response.data[0].embedding

    qdrant_client = get_qdrant_client()

    results = await qdrant_client.query_points(
        collection_name=COLLECTION,
        query=vector,
        limit=top_k,
        with_payload=True,
    )

    shlokas: list[ShlokaRef] = []
    for result in results.points:
        payload = result.payload or {}
        shlokas.append(
            ShlokaRef(
                chapter=int(payload.get("chapter", 0)),
                verse=int(payload.get("verse", 0)),
                sanskrit=str(payload.get("sanskrit", "")),
                transliteration=str(payload.get("transliteration", "")),
                hindi=str(payload.get("hindi", "")),
                english=str(payload.get("english", "")),
            )
        )

    return shlokas
