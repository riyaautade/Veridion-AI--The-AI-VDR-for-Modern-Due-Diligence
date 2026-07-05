"""create deals and documents

Revision ID: 202607030002
Revises: 202607030001
Create Date: 2026-07-03
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202607030002"
down_revision: str | None = "202607030001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE dealstatus AS ENUM ('active', 'archived');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END
        $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE documentstatus AS ENUM ('processing', 'ready', 'failed');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END
        $$;
        """
    )

    deal_status = postgresql.ENUM("active", "archived", name="dealstatus", create_type=False)
    document_status = postgresql.ENUM(
        "processing",
        "ready",
        "failed",
        name="documentstatus",
        create_type=False,
    )
    user_role = postgresql.ENUM(
        "seller_admin",
        "buyer_lawyer",
        "buyer_finance",
        "buyer_executive",
        "admin",
        name="userrole",
        create_type=False,
    )

    op.create_table(
        "deals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("seller_company", sa.String(length=255), nullable=False),
        sa.Column("buyer_company", sa.String(length=255), nullable=False),
        sa.Column("status", deal_status, nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_deals_id"), "deals", ["id"], unique=False)
    op.create_index(op.f("ix_deals_status"), "deals", ["status"], unique=False)

    op.create_table(
        "deal_users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("deal_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("deal_id", "user_id", name="uq_deal_users_deal_user"),
    )
    op.create_index(op.f("ix_deal_users_deal_id"), "deal_users", ["deal_id"], unique=False)
    op.create_index(op.f("ix_deal_users_role"), "deal_users", ["role"], unique=False)
    op.create_index(op.f("ix_deal_users_user_id"), "deal_users", ["user_id"], unique=False)

    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("deal_id", sa.Integer(), nullable=False),
        sa.Column("uploaded_by", sa.Integer(), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("file_path", sa.String(length=1024), nullable=False),
        sa.Column("file_type", sa.String(length=20), nullable=False),
        sa.Column("document_type", sa.String(length=100), nullable=False),
        sa.Column("status", document_status, nullable=False),
        sa.Column("page_count", sa.Integer(), nullable=True),
        sa.Column("allowed_roles", sa.JSON(), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=True),
        sa.Column("processing_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["deal_id"], ["deals.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["uploaded_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_documents_deal_id"), "documents", ["deal_id"], unique=False)
    op.create_index(op.f("ix_documents_id"), "documents", ["id"], unique=False)
    op.create_index(op.f("ix_documents_status"), "documents", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_documents_status"), table_name="documents")
    op.drop_index(op.f("ix_documents_id"), table_name="documents")
    op.drop_index(op.f("ix_documents_deal_id"), table_name="documents")
    op.drop_table("documents")
    op.drop_index(op.f("ix_deal_users_user_id"), table_name="deal_users")
    op.drop_index(op.f("ix_deal_users_role"), table_name="deal_users")
    op.drop_index(op.f("ix_deal_users_deal_id"), table_name="deal_users")
    op.drop_table("deal_users")
    op.drop_index(op.f("ix_deals_status"), table_name="deals")
    op.drop_index(op.f("ix_deals_id"), table_name="deals")
    op.drop_table("deals")
    sa.Enum(name="documentstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="dealstatus").drop(op.get_bind(), checkfirst=True)
