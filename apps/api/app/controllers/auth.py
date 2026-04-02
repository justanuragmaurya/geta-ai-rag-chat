from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import RefreshToken, User
from app.schemas.auth import (
    AuthTokensResponse,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshRequest,
    RefreshTokensResponse,
    RegisterRequest,
    UserResponse,
)
from app.services.auth import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)


async def register(payload: RegisterRequest, session: AsyncSession) -> AuthTokensResponse:
    existing_user = await session.scalar(select(User).where(User.email == payload.email))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
    )
    session.add(user)
    await session.flush()

    refresh_token = await create_refresh_token(session, user.id)
    access_token = create_access_token(user.id, user.email)
    await session.commit()

    return AuthTokensResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        user=UserResponse(id=user.id, email=user.email, name=user.name),
    )


async def login(payload: LoginRequest, session: AsyncSession) -> AuthTokensResponse:
    user = await session.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    refresh_token = await create_refresh_token(session, user.id)
    access_token = create_access_token(user.id, user.email)
    await session.commit()

    return AuthTokensResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        user=UserResponse(id=user.id, email=user.email, name=user.name),
    )


async def refresh(payload: RefreshRequest, session: AsyncSession) -> RefreshTokensResponse:
    stored = await session.scalar(
        select(RefreshToken)
        .options(selectinload(RefreshToken.user))
        .where(RefreshToken.token == payload.refreshToken)
    )
    if stored is None or stored.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    await session.delete(stored)
    new_refresh_token = await create_refresh_token(session, stored.user_id)
    access_token = create_access_token(stored.user.id, stored.user.email)
    await session.commit()

    return RefreshTokensResponse(accessToken=access_token, refreshToken=new_refresh_token)


async def logout(payload: LogoutRequest, session: AsyncSession) -> MessageResponse:
    if payload.refreshToken:
        await session.execute(delete(RefreshToken).where(RefreshToken.token == payload.refreshToken))
        await session.commit()

    return MessageResponse(message="Logged out")
