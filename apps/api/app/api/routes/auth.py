from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers import auth as auth_controller
from app.db.session import get_db_session
from app.middleware.auth import get_current_user
from app.rate_limiter import limiter
from app.schemas.auth import (
    AuthTokensResponse,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshRequest,
    RefreshTokensResponse,
    RegisterRequest,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthTokensResponse)
@limiter.limit("20/minute")
async def register(
    request: Request,
    payload: RegisterRequest,
    session: AsyncSession = Depends(get_db_session),
) -> AuthTokensResponse:
    return await auth_controller.register(payload, session)


@router.post("/login", response_model=AuthTokensResponse)
@limiter.limit("20/minute")
async def login(
    request: Request,
    payload: LoginRequest,
    session: AsyncSession = Depends(get_db_session),
) -> AuthTokensResponse:
    return await auth_controller.login(payload, session)


@router.post("/refresh", response_model=RefreshTokensResponse)
@limiter.limit("20/minute")
async def refresh(
    request: Request,
    payload: RefreshRequest,
    session: AsyncSession = Depends(get_db_session),
) -> RefreshTokensResponse:
    return await auth_controller.refresh(payload, session)


@router.post("/logout", response_model=MessageResponse)
@limiter.limit("20/minute")
async def logout(
    request: Request,
    payload: LogoutRequest,
    _current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> MessageResponse:
    return await auth_controller.logout(payload, session)
