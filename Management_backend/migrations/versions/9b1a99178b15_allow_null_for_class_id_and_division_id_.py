"""Allow NULL for class_id and division_id in Student model

Revision ID: 9b1a99178b15
Revises: 
Create Date: 2024-08-01 18:36:55.367138

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9b1a99178b15'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('student', schema=None) as batch_op:
        batch_op.alter_column('class_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('division_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('student', schema=None) as batch_op:
        batch_op.alter_column('division_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('class_id',
               existing_type=sa.INTEGER(),
               nullable=False)

    # ### end Alembic commands ###
