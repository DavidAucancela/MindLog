"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-29

"""
from typing import Sequence, Union
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id UUID NOT NULL,
            email VARCHAR NOT NULL,
            hashed_password VARCHAR NOT NULL,
            name VARCHAR,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            PRIMARY KEY (id)
        )
    """)
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id UUID NOT NULL,
            user_id UUID NOT NULL REFERENCES users(id),
            content TEXT NOT NULL,
            mood VARCHAR,
            embedding FLOAT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            PRIMARY KEY (id)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_entries_user_id ON entries (user_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_entries_user_id")
    op.execute("DROP TABLE IF EXISTS entries")
    op.execute("DROP INDEX IF EXISTS ix_users_email")
    op.execute("DROP TABLE IF EXISTS users")
