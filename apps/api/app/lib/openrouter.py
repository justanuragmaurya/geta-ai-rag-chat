from openai import AsyncOpenAI

from app.config import settings


openai_client = AsyncOpenAI(
    api_key=settings.openrouter_api_key,
    base_url=settings.openrouter_base_url,
    default_headers={
        "HTTP-Referer": settings.frontend_url,
        "X-Title": "Geta-AI",
    },
)
