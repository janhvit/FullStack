from flask import Blueprint, request, jsonify
from models import db, Course, Enrollment, User, Student, Class, Division
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils import admin_required

course_bp = Blueprint('course_bp', __name__)

@course_bp.route('/courses', methods=['POST'])
@admin_required
def create_course():
    data = request.get_json()
    course_name = data.get('course_name')
    teacher_id = data.get('teacher_id')

    existing_course = Course.query.filter_by(course_name=course_name).first()
    if existing_course:
        return jsonify({'error': 'Course with this name already exists'}), 400

    new_course = Course(course_name=course_name, teacher_id=teacher_id)
    db.session.add(new_course)
    db.session.commit()

    return jsonify(new_course.serialize()), 201

@course_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_courses():
    courses = Course.query.all()
    return jsonify([course.serialize() for course in courses])

@course_bp.route('/courses/<int:course_id>/enroll', methods=['POST'])
@jwt_required()
def enroll_course(course_id):
    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()  

    if not student:
        return jsonify({"msg": "Student not found"}), 404
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"msg": "Course not found"}), 404

    existing_enrollment = Enrollment.query.filter_by(student_id=student.id, course_id=course_id).first()
    if existing_enrollment:
        return jsonify({"msg": "Already enrolled in this course"}), 400

    new_enrollment = Enrollment(student_id=student.id, course_id=course_id)  
    db.session.add(new_enrollment)
    db.session.commit()

    return jsonify(new_enrollment.serialize()), 201

@course_bp.route('/courses/enrolled', methods=['GET'])
@jwt_required()
def get_student_courses():
    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()  
    if not student:
        return jsonify({"msg": "Student not found"}), 404

    enrollments = Enrollment.query.filter_by(student_id=student.id).all()  
    courses = [Course.query.get(enrollment.course_id) for enrollment in enrollments]

    return jsonify([course.serialize() for course in courses if course])


@course_bp.route('/courses/<int:course_id>/enrollments', methods=['GET'])
@jwt_required()
def get_course_enrollments(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"msg": "Course not found"}), 404

    enrollments = Enrollment.query.filter_by(course_id=course_id).all()
    if not enrollments:
        return jsonify({"msg": "No enrollments found for this course"}), 404

    enrollment_details = []

    for enrollment in enrollments:
        student = Student.query.get(enrollment.student_id)
        if student:
            class_info = Class.query.get(student.class_id)
            division_info = Division.query.get(student.division_id)

            enrollment_info = {
                "id": enrollment.id,
                "student_id": student.id,
                "student_name": f"{student.first_name} {student.last_name}",
                "class": class_info.name if class_info else "N/A",
                "division": division_info.name if division_info else "N/A",
                "course_name": course.course_name
            }

            enrollment_details.append(enrollment_info)
        else:
            print(f"No student found for enrollment id: {enrollment.id}")

    return jsonify(enrollment_details), 200


@course_bp.route('/teachers/me', methods=['GET'])
@jwt_required()
def get_current_teacher():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or not user.is_teacher:
        return jsonify({"msg": "Unauthorized"}), 403

    return jsonify({"id": user.id})
