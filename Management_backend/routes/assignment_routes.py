from flask import Blueprint, app, request, jsonify
from models import AssignmentSubmission, Student, User, db, Assignment, Class
from utils import admin_required
from datetime import date, datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging

logging.basicConfig(level=logging.DEBUG)

assignment_bp = Blueprint('assignment_bp', __name__)


@assignment_bp.route('/assignments', methods=['POST'])
@jwt_required()
@admin_required
def create_assignment():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_teacher:
        return jsonify({"msg": "Unauthorized. You must be a teacher to create assignments."}), 403

    data = request.get_json()
    print("Received data:", data)  
    if not isinstance(data, list):
        return jsonify({"msg": "Invalid input format. Expected a list of assignments."}), 400

    assignments = []
    for item in data:
        try:
            title = item['title']
            description = item['description']
            due_date_str = item['due_date']
            class_id = item['class_id']

            try:
                due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"msg": f"Invalid date format for assignment {title}. Please use YYYY-MM-DD."}), 400
            
           
            if due_date < date.today():
                return jsonify({"msg": f"Due date for assignment {title} cannot be earlier than today's date."}), 400
            
            
            class_ = Class.query.get(class_id)
            if not class_:
                return jsonify({"msg": f"Invalid class ID for assignment {title}"}), 400

            new_assignment = Assignment(title=title, description=description, due_date=due_date, class_id=class_id)
            db.session.add(new_assignment)
            db.session.commit()

            assignments.append(new_assignment.serialize())
        
        except KeyError as e:
            return jsonify({"msg": f"Missing key in assignment data: {e}"}), 400

    return jsonify(assignments), 201

@assignment_bp.route('/assignments', methods=['GET'])
@jwt_required()
def get_assignments():
    current_user_id = get_jwt_identity()
    try:
        current_user_id = int(current_user_id)
    except ValueError:
        return jsonify({"msg": "Invalid user ID format"}), 400

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if user.is_teacher:
        
        assignments = Assignment.query.all()
    else:
       
        student = Student.query.filter_by(user_id=current_user_id).first()
        if student:
            assignments = Assignment.query.filter_by(class_id=student.class_id).all()
        else:
           
            assignments = Assignment.query.all() 
    return jsonify([assignment.serialize() for assignment in assignments])


@assignment_bp.route('/assignments/<int:assignment_id>', methods=['PUT'])
@admin_required
def update_assignment(assignment_id):
    data = request.get_json()

    # Check if the data is a dictionary
    if not isinstance(data, dict):
        return jsonify({"msg": "Invalid input format. Expected a dictionary."}), 400

    assignment = Assignment.query.get_or_404(assignment_id)

    # Use .get() method to safely access keys in the dictionary
    assignment.title = data.get('title', assignment.title)
    assignment.description = data.get('description', assignment.description)
    due_date_str = data.get('due_date', None)

    if due_date_str:
        try:
            assignment.due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Please use YYYY-MM-DD."}), 400

    db.session.commit()
    return jsonify(assignment.serialize())


@assignment_bp.route('/assignments/<int:assignment_id>', methods=['DELETE'])
@admin_required
def delete_assignment(assignment_id):
    logging.debug(f'Request to delete assignment with ID: {assignment_id}')
    assignment = Assignment.query.get_or_404(assignment_id)
    
    # Delete all related assignment submissions first
    AssignmentSubmission.query.filter_by(assignment_id=assignment.id).delete()
    
    db.session.delete(assignment)
    db.session.commit()
    
    logging.debug(f'Assignment with ID {assignment_id} deleted successfully')
    return jsonify({'message': 'Assignment deleted successfully'}), 200




# @assignment_bp.route('/assignments/<int:assignment_id>/submit', methods=['POST'])
# @jwt_required()
# def submit_assignment(assignment_id):
#     data = request.get_json()
#     student_id = data.get('student_id')
#     status = data.get('status')

#     if not student_id or not status:
#         return jsonify({'error': 'Student ID and status are required'}), 400

#     student = Student.query.get(student_id)
#     assignment = Assignment.query.get(assignment_id)

#     if not student or not assignment:
#         return jsonify({'error': 'Invalid student or assignment ID'}), 404

#     # Check if the submission already exists
#     existing_submission = AssignmentSubmission.query.filter_by(student_id=student_id, assignment_id=assignment_id).first()

#     if existing_submission:
#         # Prevent modification if status is 'Completed'
#         if existing_submission.status == 'Completed':
#             return jsonify({'error': 'Assignment cannot be modified after completion'}), 403
        
#         # Update existing submission
#         existing_submission.status = status
#         db.session.commit()
#         return jsonify({'message': 'Assignment updated successfully', 'submission': existing_submission.serialize()}), 200
#     else:
#         # Create new submission
#         submission = AssignmentSubmission(
#             student_id=student_id,
#             assignment_id=assignment_id,
#             status=status
#         )
#         db.session.add(submission)
#         db.session.commit()
#         return jsonify({'message': 'Assignment submitted successfully', 'submission': submission.serialize()}), 201


@assignment_bp.route('/assignments/submissions/<int:submission_id>', methods=['PUT'])
@jwt_required()
def update_submission(submission_id):
    data = request.get_json()
    status = data.get('status')

    # Fetch the submission
    submission = AssignmentSubmission.query.get(submission_id)
    if not submission:
        return jsonify({'error': 'Submission not found'}), 404

    # Update the submission
    if status:
        submission.status = status
        db.session.commit()
        return jsonify({
            'message': 'Submission updated successfully',
            'submission': submission.serialize()
        }), 200
    else:
        return jsonify({'error': 'Status is required'}), 400
    

@assignment_bp.route('/assignments/<int:assignment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assignment(assignment_id):
    data = request.get_json()
    status = data.get('status')

    user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=user_id).first()

    if not student:
        return jsonify({'error': 'Student not found'}), 404

    student_id = student.id
    assignment = Assignment.query.get(assignment_id)

    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404


    if assignment.due_date < date.today():
        return jsonify({'error': 'Assignment submission is closed as the due date has passed'}), 403

    submission = AssignmentSubmission.query.filter_by(student_id=student_id, assignment_id=assignment_id).first()

    if submission:
        if submission.status == 'Completed':
            return jsonify({'error': 'Assignment cannot be modified after completion'}), 403
        
        submission.status = status
        db.session.commit()
        return jsonify({"message": "Assignment status updated successfully", "submission": submission.serialize()}), 200
    else:
        new_submission = AssignmentSubmission(student_id=student_id, assignment_id=assignment_id, status=status)
        db.session.add(new_submission)
        db.session.commit()
        return jsonify({"message": "Assignment submitted successfully", "submission": new_submission.serialize()}), 201

    
@assignment_bp.route('/assignments/<int:assignment_id>/submissions', methods=['GET'])
@admin_required
def get_submissions(assignment_id):
    submissions = AssignmentSubmission.query.filter_by(assignment_id=assignment_id).all()
    submission_info = [
        {
            "id": submission.id,
            "student_name": f"{submission.student.first_name} {submission.student.last_name}",  
            "class_name": submission.student.class_.name if submission.student.class_ else "N/A",  
            "status": submission.status
        }
        for submission in submissions
    ]
    return jsonify(submission_info)


@assignment_bp.route('/assignment/submission', methods=['GET'])
@jwt_required()
def get_submission():
    user_id = get_jwt_identity()  
    student = Student.query.filter_by(user_id=user_id).first()

    if not student:
        return jsonify({'error': 'Student not found'}), 404

    student_id = student.id
    submissions = AssignmentSubmission.query.filter_by(student_id=student_id).all()

    return jsonify([submission.serialize() for submission in submissions])



