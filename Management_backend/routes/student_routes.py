from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import Assignment, db, Student, Class, Division
from utils import admin_required

student_bp = Blueprint('student_bp', __name__)

@student_bp.route('/students', methods=['POST'])
@admin_required
def add_student():
    data = request.get_json()
    first_name = data['first_name']
    last_name = data['last_name']
    class_id = data['class_id']
    division_id = data['division_id']
    
    class_ = Class.query.get(class_id)
    division = Division.query.get(division_id)
    
    if not class_ or not division:
        return jsonify({"msg": "Invalid class or division ID"}), 400
    
    new_student = Student(first_name=first_name, last_name=last_name, class_id=class_id, division_id=division_id)
    db.session.add(new_student)
    db.session.commit()
    return jsonify(new_student.serialize()), 201

@student_bp.route('/students/dashboard', methods=['GET'])
@jwt_required()
def student_dashboard():
    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()

    if student:
        class_info = Class.query.get(student.class_id)
        division_info = Division.query.get(student.division_id)
        assignments = Assignment.query.filter_by(class_id=student.class_id).all()

        return jsonify({
            'name': f"{student.first_name} {student.last_name}",
            'class': class_info.serialize() if class_info else None,
            'division': division_info.serialize() if division_info else None,
            'assignments': [assignment.serialize() for assignment in assignments]
        }), 200
    return jsonify({'message': 'Student not found'}), 404

@student_bp.route('/students/<int:student_id>', methods=['PUT'])
@admin_required
def update_student(student_id):
    data = request.get_json()
    student = Student.query.get_or_404(student_id)
    student.first_name = data.get('first_name', student.first_name)
    student.last_name = data.get('last_name', student.last_name)
    db.session.commit()
    return jsonify(student.serialize())

@student_bp.route('/students/<int:student_id>', methods=['DELETE'])
@admin_required
def delete_student(student_id):
    student = Student.query.get_or_404(student_id)
    db.session.delete(student)
    db.session.commit()
    return jsonify({"msg": "Student deleted"})
