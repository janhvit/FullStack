from app import app, db
from models import User,Enrollment,Division,Class, Course,AssignmentSubmission, Assignment, Attendance # Adjust the import based on where your User model is located

# Create an application context
with app.app_context():
    # Delete all entries in the User table
    # Enrollment.query.delete()
    # Assignment.query.delete()
    # Division.query.delete()
    # Class.query.delete()
    # Course.query.delete()
    # Attendance.query.delete()
    # User.query.delete()
    
    
    
    # Commit the changes to the database
    db.session.commit()
    print("All entries in the User table have been deleted.")
