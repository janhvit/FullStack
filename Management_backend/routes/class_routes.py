from flask import Blueprint, request, jsonify
from models import Assignment, Attendance, Division, Enrollment, Student, db, Class, User, AssignmentSubmission
from flask_jwt_extended import jwt_required
from utils import admin_required

class_bp = Blueprint('class_bp', __name__)

@class_bp.route('/classes', methods=['POST'])
@admin_required
def create_class():
    data = request.get_json()
    name = data.get('name')
    teacher_id = data.get('teacher_id')

    if not name or not teacher_id:
        return jsonify({'error': 'name and teacher_id are required'}), 400
    
    existing_class = Class.query.filter_by(name=name).first()
    if existing_class:
        return jsonify({'error': 'Class with this name already exists'}), 400

    new_class = Class(name=name, teacher_id=teacher_id)
    db.session.add(new_class)
    db.session.commit()
    
    return jsonify({'message': 'Class created successfully', 'class': new_class.serialize()}), 201

@class_bp.route('/classes', methods=['GET'])
def get_classes():
    try:
        classes = Class.query.all()
        return jsonify([{'id': cls.id, 'name': cls.name, 'teacher_id': cls.teacher_id} for cls in classes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@class_bp.route('/classes/teachers', methods=['GET'])
@jwt_required()
def get_teachers():
    try:
        teachers = User.query.filter_by(is_teacher=True).all()
        return jsonify([{'id': teacher.id, 'name': teacher.username} for teacher in teachers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@class_bp.route('/classes/<int:class_id>', methods=['PUT'])
@admin_required
def update_class(class_id):
    data = request.get_json()
    class_ = Class.query.get_or_404(class_id)
    class_.name = data.get('name', class_.name)
    db.session.commit()
    return jsonify(class_.serialize())

@class_bp.route('/classes/<int:class_id>', methods=['DELETE'])
@admin_required
def delete_class(class_id):
    class_ = Class.query.get_or_404(class_id)
    db.session.delete(class_)
    db.session.commit()
    return jsonify({"msg": "Class and related divisions deleted"}), 200


# @class_bp.route('/classes/<int:class_id>', methods=['DELETE'])
# @admin_required
# def delete_class(class_id):
#     class_ = Class.query.get_or_404(class_id)
#     db.session.delete(class_)
#     # Class.query.filter(Class.id == 5).delete()
#     db.session.commit()
#     return jsonify({"msg": "Class deleted"})


@class_bp.route('/classes/<int:class_id>/divisions/<int:division_id>/students', methods=['GET'])
@admin_required
def get_students_in_class_and_division(class_id, division_id):
    class_obj = Class.query.get_or_404(class_id)
    division_obj = Division.query.get_or_404(division_id)

    if division_obj.class_id != class_id:
        return jsonify({"msg": "Division does not belong to the specified class."}), 400

    students = Student.query.filter_by(class_id=class_id, division_id=division_id).all()
    students_info = [
        {
            "student_id": student.id,
            "username": student.user.username,
            "email": student.user.email
        }
        for student in students
    ]

    return jsonify(students_info), 200


@class_bp.route('/students/<int:student_id>', methods=['GET'])
@admin_required
def get_student_details(student_id):
    student = Student.query.get_or_404(student_id)

   
    submissions = AssignmentSubmission.query.filter_by(student_id=student_id).all()
    assignment_ids = {submission.assignment_id for submission in submissions}

    assignments = Assignment.query.filter(Assignment.id.in_(assignment_ids)).all()
    assignments_info = [
        {
            "assignment_id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "status": next((sub.status for sub in submissions if sub.assignment_id == assignment.id), "Not Submitted")
        }
        for assignment in assignments
    ]

    attendance = Attendance.query.filter_by(student_id=student_id, verified=True).all()
    attendance_info = [
        {
            "date": record.date,
            "status": record.status
        }
        for record in attendance
    ]

    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    courses_info = [
        {
            "course_id": enrollment.course.id,
            "course_name": enrollment.course.course_name
        }
        for enrollment in enrollments
    ]

    student_details = {
        "student_id": student.id,
        "username": student.user.username,
        "email": student.user.email,
        "assignments": assignments_info,
        "attendance": attendance_info,
        "courses": courses_info
    }

    return jsonify(student_details), 200


@class_bp.route('/students/<int:student_id>', methods=['DELETE'])
@admin_required
def delete_student(student_id):
    student = Student.query.get_or_404(student_id)
    db.session.delete(student)

    try:
        db.session.commit()
        return jsonify({"msg": "Student and related records deleted successfully"}), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

