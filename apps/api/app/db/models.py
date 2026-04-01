from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def generate_id() -> str:
    return str(uuid4())


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "User"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column("passwordHash", String, nullable=False)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        "createdAt",
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt",
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    conversations: Mapped[list["Conversation"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class RefreshToken(Base):
    __tablename__ = "RefreshToken"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    token: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    user_id: Mapped[str] = mapped_column(
        "userId",
        ForeignKey("User.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column("expiresAt", DateTime(timezone=False), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        "createdAt",
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    user: Mapped[User] = relationship(back_populates="refresh_tokens")


class Conversation(Base):
    __tablename__ = "Conversation"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    user_id: Mapped[str] = mapped_column(
        "userId",
        ForeignKey("User.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    language: Mapped[str] = mapped_column(String, nullable=False, server_default="hinglish")
    created_at: Mapped[datetime] = mapped_column(
        "createdAt",
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt",
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user: Mapped[User] = relationship(back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )


class Message(Base):
    __tablename__ = "Message"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    conversation_id: Mapped[str] = mapped_column(
        "conversationId",
        ForeignKey("Conversation.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    shloka_refs: Mapped[list[dict[str, Any]] | None] = mapped_column("shlokaRefs", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        "createdAt",
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
    )

    conversation: Mapped[Conversation] = relationship(back_populates="messages")
