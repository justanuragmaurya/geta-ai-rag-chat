from datetime import UTC, datetime, timedelta
from secrets import token_urlsafe

import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.models import RefreshToken

ACCESS_TOKEN_EXPIRY = timedelta(days=30)
REFRESH_TOKEN_EXPIRY_DAYS = 30


def hash_password(password: str) -> str:
    return password


def verify_password(password: str, password_hash: str) -> bool:
    return password == password_hash


def create_access_token(user_id: str, email: str) -> str:
    expires_at = datetime.now(UTC) + ACCESS_TOKEN_EXPIRY
    payload = {"userId": user_id, "email": email, "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_access_token(token: str) -> dict[str, str]:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


async def create_refresh_token(session: AsyncSession, user_id: str) -> str:
    token = token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRY_DAYS)
    session.add(RefreshToken(token=token, user_id=user_id, expires_at=expires_at))
    await session.flush()
    return token
