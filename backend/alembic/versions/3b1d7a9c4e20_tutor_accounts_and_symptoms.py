"""Tutor accounts and queue symptoms.

Revision ID: 3b1d7a9c4e20
Revises: f2a4c91d8e31
Create Date: 2026-11-16
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '3b1d7a9c4e20'
down_revision: Union[str, Sequence[str], None] = 'f2a4c91d8e31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # batch_alter_table recria a tabela quando necessário, pois SQLite não
    # suporta adicionar uma chave estrangeira com ALTER TABLE.
    # As verificações também recuperam uma execução anterior interrompida.
    inspector = sa.inspect(op.get_bind())
    tutor_columns = {column['name'] for column in inspector.get_columns('tutors')}
    tutor_foreign_keys = {fk.get('name') for fk in inspector.get_foreign_keys('tutors')}
    tutor_indexes = {index['name'] for index in inspector.get_indexes('tutors')}

    with op.batch_alter_table('tutors') as batch_op:
        if 'user_id' not in tutor_columns:
            batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        if 'fk_tutors_user_id_users' not in tutor_foreign_keys:
            batch_op.create_foreign_key('fk_tutors_user_id_users', 'users', ['user_id'], ['id'])
        if op.f('ix_tutors_user_id') not in tutor_indexes:
            batch_op.create_index(op.f('ix_tutors_user_id'), ['user_id'], unique=True)

    inspector = sa.inspect(op.get_bind())
    queue_columns = {column['name'] for column in inspector.get_columns('queue_entries')}
    with op.batch_alter_table('queue_entries') as batch_op:
        if 'symptoms' not in queue_columns:
            batch_op.add_column(sa.Column('symptoms', sa.Text(), nullable=True))


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    queue_columns = {column['name'] for column in inspector.get_columns('queue_entries')}
    if 'symptoms' in queue_columns:
        with op.batch_alter_table('queue_entries') as batch_op:
            batch_op.drop_column('symptoms')

    inspector = sa.inspect(op.get_bind())
    tutor_columns = {column['name'] for column in inspector.get_columns('tutors')}
    tutor_foreign_keys = {fk.get('name') for fk in inspector.get_foreign_keys('tutors')}
    tutor_indexes = {index['name'] for index in inspector.get_indexes('tutors')}
    with op.batch_alter_table('tutors') as batch_op:
        if op.f('ix_tutors_user_id') in tutor_indexes:
            batch_op.drop_index(op.f('ix_tutors_user_id'))
        if 'fk_tutors_user_id_users' in tutor_foreign_keys:
            batch_op.drop_constraint('fk_tutors_user_id_users', type_='foreignkey')
        if 'user_id' in tutor_columns:
            batch_op.drop_column('user_id')
