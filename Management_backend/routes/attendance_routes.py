from flask import Blueprint, request, jsonify
from models import db, Attendance, Student, User, Class, Division
from utils import admin_required
from datetime import timedelta, datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

attendance_bp = Blueprint('attendance_bp', __name__)

VALID_STATUSES = {"present", "absent"}

def validate_status(status):
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status. Allowed values are: {', '.join(VALID_STATUSES)}")

@attendance_bp.route('/attendances', methods=['POST'])
@jwt_required()
def mark_attendance():
    data = request.get_json()
    date_string = data.get('date')
    status = data.get('status')

    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()
    
    if not student:
        return jsonify({"msg": "Invalid student ID"}), 400

    if not date_string or not status:
        return jsonify({"msg": "Missing required fields."}), 400

    try:
        date = datetime.strptime(date_string, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD."}), 400

    today = datetime.now().date()
    if date > today:
        return jsonify({"msg": "Cannot mark attendance for a future date."}), 400
    
    if date.month != today.month or date.year != today.year:
        return jsonify({"msg": "Cannot mark attendance for a date outside of the current month."}), 400

    if date.weekday() in [5, 6]:  # 5 is Saturday, 6 is Sunday
        return jsonify({"msg": "Attendance cannot be marked on weekends."}), 400

    try:
        validate_status(status)
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400

    existing_attendance = Attendance.query.filter_by(date=date, student_id=student.id).first()
    if existing_attendance:
        return jsonify({"msg": "Attendance already marked for this date."}), 400

    new_attendance = Attendance(date=date, status=status, student_id=student.id, teacher_id=None)
    db.session.add(new_attendance)
    db.session.commit()
    return jsonify(new_attendance.serialize()), 201

@attendance_bp.route('/attendances/me', methods=['GET'])
@jwt_required()
def get_my_attendance():
    current_user_id = get_jwt_identity()
    student = Student.query.filter_by(user_id=current_user_id).first()

    if not student:
        return jsonify({"msg": "Invalid student ID"}), 400

    attendances = Attendance.query.filter_by(student_id=student.id).all()
    return jsonify([attendance.serialize() for attendance in attendances])


@attendance_bp.route('/attendances', methods=['GET'])
@admin_required
def get_attendances():
    attendance_summary = {}
    today = datetime.now().date()
    start_date = today.replace(day=1)  # Start of the current month
    end_date = today  # End date is the current date

    # Fetch all classes and divisions to organize students properly
    classes = Class.query.all()
    divisions = Division.query.all()

    for class_ in classes:
        for division in divisions:
            # Find students in this class and division
            students = Student.query.filter_by(class_id=class_.id, division_id=division.id).all()
            class_div_key = f"{class_.name} - {division.name}"

            # Initialize date and class-division structure
            for student in students:
                if class_div_key not in attendance_summary:
                    attendance_summary[class_div_key] = {}

                # Add attendance records within the date range excluding weekends
                for single_date in (start_date + timedelta(n) for n in range((end_date - start_date).days + 1)):
                    if single_date.weekday() not in [5, 6]:  # Exclude Saturday (5) and Sunday (6)
                        date_str = single_date.strftime('%Y-%m-%d')
                        attendances = Attendance.query.filter_by(date=single_date, student_id=student.id).all()
                        if date_str not in attendance_summary[class_div_key]:
                            attendance_summary[class_div_key][date_str] = []

                        if attendances:
                            for attendance in attendances:
                                student_info = {
                                    "attendance_id": attendance.id,
                                    "student_name": student.user.username,
                                    "status": attendance.status,
                                    "verified": attendance.verified,
                                    "class_name": class_.name,
                                    "division_name": division.name
                                }
                                attendance_summary[class_div_key][date_str].append(student_info)
                        else:
                            student_info = {
                                "attendance_id": None,
                                "student_name": student.user.username,
                                "status": "Not Marked",
                                "verified": False,
                                "class_name": class_.name,
                                "division_name": division.name
                            }
                            attendance_summary[class_div_key][date_str].append(student_info)

    return jsonify(attendance_summary), 200



@attendance_bp.route('/attendances/<int:attendance_id>', methods=['PUT'])
@admin_required
def update_attendance(attendance_id):
    data = request.get_json()
    teacher_id = get_jwt_identity()
    verified = data.get('verified')

    attendance = Attendance.query.get_or_404(attendance_id)
    if verified is not None:
        attendance.verified = verified
    attendance.teacher_id = teacher_id
    db.session.commit()

    return jsonify(attendance.serialize()), 200
