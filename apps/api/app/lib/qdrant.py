from qdrant_client import AsyncQdrantClient

from app.config import settings


COLLECTION = settings.qdrant_collection


def get_qdrant_client() -> AsyncQdrantClient:
    return AsyncQdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        check_compatibility=False,
    )
