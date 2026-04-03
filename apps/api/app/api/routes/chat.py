from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.controllers import chat as chat_controller
from app.db.session import get_db_session
from app.middleware.auth import AuthUser, get_current_user
from app.rate_limiter import limiter
from app.schemas.chat import (
    ConversationResponse,
    ConversationSummaryResponse,
    DeleteResponse,
    SendMessageRequest,
)


router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/message")
@limiter.limit("30/minute")
async def send_message(
    request: Request,
    payload: SendMessageRequest,
    current_user: AuthUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    return await chat_controller.send_message(payload, current_user, session)


@router.get("/conversations", response_model=list[ConversationSummaryResponse])
@limiter.limit("30/minute")
async def get_conversations(
    request: Request,
    current_user: AuthUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> list[ConversationSummaryResponse]:
    return await chat_controller.get_conversations(current_user, session)


@router.get("/conversation/{conversation_id}", response_model=ConversationResponse)
@limiter.limit("30/minute")
async def get_history(
    request: Request,
    conversation_id: str,
    current_user: AuthUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ConversationResponse:
    return await chat_controller.get_history(conversation_id, current_user, session)


@router.delete("/conversation/{conversation_id}", response_model=DeleteResponse)
@limiter.limit("30/minute")
async def delete_conversation(
    request: Request,
    conversation_id: str,
    current_user: AuthUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> DeleteResponse:
    return await chat_controller.delete_conversation(conversation_id, current_user, session)
