"""Tutor account self-service and queue symptoms.

Revision ID: b2c3d4e5f607
Revises: f2a4c91d8e31
"""
from alembic import op
import sqlalchemy as sa

revision = 'b2c3d4e5f607'
down_revision = 'f2a4c91d8e31'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('tutors') as batch:
        batch.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch.create_index('ix_tutors_user_id', ['user_id'], unique=True)
        batch.create_foreign_key('fk_tutors_user_id', 'users', ['user_id'], ['id'])
    op.add_column('queue_entries', sa.Column('symptoms', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('queue_entries', 'symptoms')
    with op.batch_alter_table('tutors') as batch:
        batch.drop_constraint('fk_tutors_user_id', type_='foreignkey')
        batch.drop_index('ix_tutors_user_id')
        batch.drop_column('user_id')
