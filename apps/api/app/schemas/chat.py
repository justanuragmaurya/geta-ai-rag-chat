from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ShlokaRef(BaseModel):
    chapter: int
    verse: int
    sanskrit: str
    transliteration: str
    hindi: str
    english: str


class SendMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    conversationId: str | None = None


class ChatMessageResponse(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    shlokaRefs: list[ShlokaRef] | None = None
    createdAt: datetime


class ConversationResponse(BaseModel):
    id: str
    title: str | None = None
    createdAt: datetime
    updatedAt: datetime
    messages: list[ChatMessageResponse] = Field(default_factory=list)


class ConversationSummaryResponse(BaseModel):
    id: str
    title: str | None = None
    createdAt: datetime
    updatedAt: datetime


class DeleteResponse(BaseModel):
    message: str
