"""initial schema

Revision ID: 20260408_000001
Revises:
Create Date: 2026-04-08 00:00:01
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "20260408_000001"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "User",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("passwordHash", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("createdAt", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updatedAt", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id", name="User_pkey"),
    )
    op.create_index("User_email_key", "User", ["email"], unique=True)

    op.create_table(
        "RefreshToken",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("token", sa.String(), nullable=False),
        sa.Column("userId", sa.String(), nullable=False),
        sa.Column("expiresAt", sa.DateTime(), nullable=False),
        sa.Column("createdAt", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(
            ["userId"],
            ["User.id"],
            name="RefreshToken_userId_fkey",
            ondelete="CASCADE",
            onupdate="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="RefreshToken_pkey"),
    )
    op.create_index("RefreshToken_token_key", "RefreshToken", ["token"], unique=True)

    op.create_table(
        "Conversation",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("userId", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("language", sa.String(), server_default="hinglish", nullable=False),
        sa.Column("createdAt", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updatedAt", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(
            ["userId"],
            ["User.id"],
            name="Conversation_userId_fkey",
            ondelete="CASCADE",
            onupdate="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="Conversation_pkey"),
    )

    op.create_table(
        "Message",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("conversationId", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("shlokaRefs", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("createdAt", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(
            ["conversationId"],
            ["Conversation.id"],
            name="Message_conversationId_fkey",
            ondelete="CASCADE",
            onupdate="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="Message_pkey"),
    )


def downgrade() -> None:
    op.drop_table("Message")
    op.drop_table("Conversation")
    op.drop_index("RefreshToken_token_key", table_name="RefreshToken")
    op.drop_table("RefreshToken")
    op.drop_index("User_email_key", table_name="User")
    op.drop_table("User")
