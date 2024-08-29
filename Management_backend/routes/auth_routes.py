from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from models import db, User, Student, Class, Division
from flask_bcrypt import Bcrypt


auth_bp = Blueprint('auth_bp', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']
    is_teacher = data.get('is_teacher', False)

    user = User(username=username, email=email, is_teacher=is_teacher)
    user.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    db.session.add(user)
    db.session.commit()

    if not is_teacher:
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        class_id = data.get('class_id')
        division_id = data.get('division_id')
 
        if class_id:
            class_ = Class.query.get(class_id)
            if not class_:
                return jsonify({'error': 'Invalid class ID'}), 400

        if division_id:
            division = Division.query.get(division_id)
            if not division:
                return jsonify({'error': 'Invalid division ID'}), 400

        student = Student(
            first_name=first_name,
            last_name=last_name,
            class_id=class_id,
            division_id=division_id,
            user_id=user.id
        )
        db.session.add(student)
        db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.id)
        
        if user.is_teacher:
            return jsonify({
                'token': access_token,
                'user_id': user.id,  
                'is_admin': True
            }), 200
        else:
            student = Student.query.filter_by(user_id=user.id).first()  
            if student:
                return jsonify({
                    'token': access_token,
                    'student_id': student.id,  
                    'is_admin': False
                }), 200
            else:
                return jsonify({'error': 'Student record not found'}), 404
    else:
        return jsonify({'error': 'Invalid email or password'}), 401


@auth_bp.route('/update_profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    student = Student.query.filter_by(user_id=user.id).first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    
    
    student.first_name = data.get('first_name', student.first_name)
    student.last_name = data.get('last_name', student.last_name)

    db.session.commit()

    return jsonify({'message': 'Profile updated successfully'}), 200

@auth_bp.route('/dashboard', methods=['GET'])
@jwt_required()  
def get_teacher_details():
    user_id = get_jwt_identity()  
    user = User.query.filter_by(id=user_id, is_teacher=True).first()  
    
    if not user:
        return jsonify({'error': 'Teacher not found or not authorized'}), 404

    
    teacher_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        
    }
    return jsonify(teacher_data), 200


