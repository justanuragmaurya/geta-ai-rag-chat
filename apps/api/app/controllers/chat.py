import json
import logging
from collections.abc import AsyncIterator
from datetime import datetime

from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Conversation, Message
from app.db.session import AsyncSessionLocal
from app.middleware.auth import AuthUser
from app.schemas.chat import (
    ChatMessageResponse,
    ConversationResponse,
    ConversationSummaryResponse,
    DeleteResponse,
    SendMessageRequest,
    ShlokaRef,
)
from app.services.llm import stream_krishna_response
from app.services.qdrant import retrieve_shlokas


logger = logging.getLogger(__name__)


def format_sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


def serialize_message(message: Message) -> ChatMessageResponse:
    raw_refs = message.shloka_refs or []
    return ChatMessageResponse(
        id=message.id,
        role=message.role,  # type: ignore[arg-type]
        content=message.content,
        shlokaRefs=[ShlokaRef.model_validate(ref) for ref in raw_refs] if raw_refs else None,
        createdAt=message.created_at,
    )


def serialize_conversation(conversation: Conversation, messages: list[Message]) -> ConversationResponse:
    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        createdAt=conversation.created_at,
        updatedAt=conversation.updated_at,
        messages=[serialize_message(message) for message in messages],
    )


async def send_message(
    payload: SendMessageRequest,
    current_user: AuthUser,
    session: AsyncSession,
) -> StreamingResponse:
    conversation = None
    if payload.conversationId:
        conversation = await session.scalar(
            select(Conversation).where(
                Conversation.id == payload.conversationId,
                Conversation.user_id == current_user.user_id,
            )
        )

    if conversation is None:
        conversation = Conversation(
            user_id=current_user.user_id,
            title=payload.message[:60] + ("..." if len(payload.message) > 60 else ""),
        )
        session.add(conversation)
        await session.flush()

    history_query = (
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(desc(Message.created_at))
        .limit(10)
    )
    history_rows = list((await session.scalars(history_query)).all())
    history_rows.reverse()

    shlokas = await retrieve_shlokas(payload.message)
    conversation.updated_at = datetime.utcnow()
    session.add(
        Message(
            conversation_id=conversation.id,
            role="user",
            content=payload.message,
        )
    )
    await session.commit()

    async def event_stream() -> AsyncIterator[str]:
        yield format_sse(
            {
                "conversationId": conversation.id,
                "shlokaRefs": [shloka.model_dump() for shloka in shlokas],
            }
        )

        full_response = ""
        try:
            history_payload = [{"role": item.role, "content": item.content} for item in history_rows]
            async for delta in stream_krishna_response(payload.message, shlokas, history_payload):
                full_response += delta
                yield format_sse({"delta": delta})

            async with AsyncSessionLocal() as stream_session:
                persisted_conversation = await stream_session.scalar(
                    select(Conversation).where(
                        Conversation.id == conversation.id,
                        Conversation.user_id == current_user.user_id,
                    )
                )
                if persisted_conversation is not None:
                    persisted_conversation.updated_at = datetime.utcnow()
                    stream_session.add(
                        Message(
                            conversation_id=conversation.id,
                            role="assistant",
                            content=full_response,
                            shloka_refs=[shloka.model_dump() for shloka in shlokas],
                        )
                    )
                    await stream_session.commit()

            yield format_sse({"done": True})
        except Exception:
            logger.exception("Chat error while streaming response")
            yield format_sse({"done": True})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


async def get_history(
    conversation_id: str,
    current_user: AuthUser,
    session: AsyncSession,
) -> ConversationResponse:
    conversation = await session.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.user_id,
        )
    )
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    messages = list(
        (
            await session.scalars(
                select(Message)
                .where(Message.conversation_id == conversation.id)
                .order_by(Message.created_at.asc())
            )
        ).all()
    )
    return serialize_conversation(conversation, messages)


async def get_conversations(
    current_user: AuthUser,
    session: AsyncSession,
) -> list[ConversationSummaryResponse]:
    conversations = list(
        (
            await session.scalars(
                select(Conversation)
                .where(Conversation.user_id == current_user.user_id)
                .order_by(Conversation.updated_at.desc())
            )
        ).all()
    )
    return [
        ConversationSummaryResponse(
            id=conversation.id,
            title=conversation.title,
            createdAt=conversation.created_at,
            updatedAt=conversation.updated_at,
        )
        for conversation in conversations
    ]


async def delete_conversation(
    conversation_id: str,
    current_user: AuthUser,
    session: AsyncSession,
) -> DeleteResponse:
    await session.execute(
        delete(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.user_id,
        )
    )
    await session.commit()
    return DeleteResponse(message="Deleted")
