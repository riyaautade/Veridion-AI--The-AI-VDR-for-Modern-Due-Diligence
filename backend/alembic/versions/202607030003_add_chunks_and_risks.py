"""add document chunks and risk flags

Revision ID: 202607030003
Revises: 202607030002
Create Date: 2026-07-03
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202607030003"
down_revision: str | None = "202607030002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "document_chunks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("deal_id", sa.Integer(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_document_chunks_document_id"), "document_chunks", ["document_id"], unique=False)
    op.create_index(op.f("ix_document_chunks_deal_id"), "document_chunks", ["deal_id"], unique=False)

    op.create_table(
        "risk_flags",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("deal_id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("rule_key", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_risk_flags_deal_id"), "risk_flags", ["deal_id"], unique=False)
    op.create_index(op.f("ix_risk_flags_document_id"), "risk_flags", ["document_id"], unique=False)
    op.create_index(op.f("ix_risk_flags_severity"), "risk_flags", ["severity"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_risk_flags_severity"), table_name="risk_flags")
    op.drop_index(op.f("ix_risk_flags_document_id"), table_name="risk_flags")
    op.drop_index(op.f("ix_risk_flags_deal_id"), table_name="risk_flags")
    op.drop_table("risk_flags")
    op.drop_index(op.f("ix_document_chunks_deal_id"), table_name="document_chunks")
    op.drop_index(op.f("ix_document_chunks_document_id"), table_name="document_chunks")
    op.drop_table("document_chunks")
