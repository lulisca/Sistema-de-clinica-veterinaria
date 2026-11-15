"""F1 estimate revision metadata

Revision ID: 8e7c1f1b2a44
Revises: c5ff2cf177c3
Create Date: 2026-10-29
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '8e7c1f1b2a44'
down_revision: Union[str, Sequence[str], None] = 'c5ff2cf177c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('wait_estimates', sa.Column('revision_number', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('wait_estimates', sa.Column('trigger_event', sa.String(length=80), nullable=False, server_default='MANUAL'))


def downgrade() -> None:
    op.drop_column('wait_estimates', 'trigger_event')
    op.drop_column('wait_estimates', 'revision_number')
