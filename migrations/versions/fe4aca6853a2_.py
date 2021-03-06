"""Change subscriptions storage from facebook_id to (provider, internal_id)

Revision ID: fe4aca6853a2
Revises: a223b578f7b0
Create Date: 2019-10-13 22:37:16.548775

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'fe4aca6853a2'
down_revision = 'a223b578f7b0'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint('Subscription_facebook_id_key', 'Subscription', type_='unique')
    op.add_column('Subscription', sa.Column('provider', sa.String(length=32), server_default='facebook'))
    op.alter_column('Subscription', 'provider', server_default=None, nullable=False)  # Define default then remove it
    op.alter_column('Subscription', 'facebook_id', new_column_name='internal_id')
    op.create_unique_constraint('Subscription_provider_internal_id_key', 'Subscription', ['provider', 'internal_id'])


def downgrade():
    op.drop_constraint('Subscription_provider_internal_id_key', 'Subscription', type_='unique')
    op.drop_column('Subscription', 'provider')
    op.alter_column('Subscription', 'internal_id', new_column_name='facebook_id')
    op.create_unique_constraint('Subscription_facebook_id_key', 'Subscription', ['facebook_id'])
