from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, date

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(128), nullable=False)
    is_teacher = db.Column(db.Boolean, default=False)
    classes = db.relationship('Class', backref='teacher', lazy=True)
    attendances = db.relationship('Attendance', backref='teacher', lazy=True)
    student = db.relationship('Student', back_populates='user', uselist=False)  # One-to-One relationship

    def __repr__(self):
        return f'<User {self.username}>'

class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    divisions = db.relationship('Division', backref='class', lazy=True, cascade="all, delete-orphan")
    assignments = db.relationship('Assignment', backref='class', lazy=True)
    students = db.relationship('Student', back_populates='class_', lazy=True)

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'teacher_id': self.teacher_id,
            'divisions': [division.id for division in self.divisions],
            'assignments': [assignment.id for assignment in self.assignments],
            'students': [student.id for student in self.students]
        }

    def __repr__(self):
        return f'<Class {self.name}>'

class Division(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    students = db.relationship('Student', back_populates='division', lazy=True, cascade="all, delete-orphan")

    def serialize(self):
        class_ = Class.query.get(self.class_id)
        return {
            'id': self.id,
            'name': self.name,
            'class_id': self.class_id,
            'class_name': class_.name if class_ else None
        }

    def __repr__(self):
        return f'<Division {self.name}>'

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=True)
    division_id = db.Column(db.Integer, db.ForeignKey('division.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    user = db.relationship('User', back_populates='student')
    class_ = db.relationship('Class', back_populates='students')  # Link with Class.students
    division = db.relationship('Division', back_populates='students')  # Link with Division.students
    
    assignment_submissions = db.relationship('AssignmentSubmission', backref='student', cascade="all, delete-orphan")
    attendance_records = db.relationship('Attendance', backref='student', cascade="all, delete-orphan")
    enrollments = db.relationship('Enrollment', backref='student', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Student {self.first_name} {self.last_name}>'

    def serialize(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'class_id': self.class_id,
            'division_id': self.division_id,
            'user_id': self.user_id,
        }

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    submissions = db.relationship("AssignmentSubmission", backref="assignment", cascade="all, delete-orphan")

    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if isinstance(self.due_date, date) else self.due_date,
            'class_id': self.class_id
        }

class AssignmentSubmission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # e.g., "Completed", "Incomplete"
    submission_date = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'assignment_id': self.assignment_id,
            'status': self.status,
            'submission_date': self.submission_date.strftime('%Y-%m-%d %H:%M:%S')
        }

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    verified = db.Column(db.Boolean, default=False)

    def serialize(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d'),
            'status': self.status,
            'student_id': self.student_id,
            'teacher_id': self.teacher_id,
            'verified': self.verified
        }

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(128), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    enrollments = db.relationship('Enrollment', backref='course', lazy=True)

    def serialize(self):
        return {
            'id': self.id,
            'course_name': self.course_name,
            'teacher_id': self.teacher_id
        }

class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id
        }
