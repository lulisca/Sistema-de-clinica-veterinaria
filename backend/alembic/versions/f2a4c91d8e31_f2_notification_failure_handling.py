"""F2 notification failure handling

Revision ID: f2a4c91d8e31
Revises: 8e7c1f1b2a44
Create Date: 2026-11-02
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'f2a4c91d8e31'
down_revision: Union[str, Sequence[str], None] = '8e7c1f1b2a44'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('notifications', sa.Column('reception_action_required', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('notifications', sa.Column('reception_action_resolved_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('notifications', sa.Column('reception_action_note', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('notifications', 'reception_action_note')
    op.drop_column('notifications', 'reception_action_resolved_at')
    op.drop_column('notifications', 'reception_action_required')
