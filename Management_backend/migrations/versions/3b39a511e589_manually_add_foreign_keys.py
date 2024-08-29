"""Manually add foreign keys

Revision ID: 3b39a511e589
Revises: 45b92cf26cab
Create Date: 2024-08-02 16:51:21.057502

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3b39a511e589'
down_revision = '45b92cf26cab'
branch_labels = None
depends_on = None


def upgrade():
    op.create_foreign_key('fk_user_enrollments', 'enrollment', 'user', ['student_id'], ['id'])
    op.create_foreign_key('fk_course_enrollments', 'enrollment', 'course', ['course_id'], ['id'])

def downgrade():
    op.drop_constraint('fk_user_enrollments', 'enrollment', type_='foreignkey')
    op.drop_constraint('fk_course_enrollments', 'enrollment', type_='foreignkey')

