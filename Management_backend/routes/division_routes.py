from flask import Blueprint, request, jsonify
from models import db, Division, Class
from flask_jwt_extended import jwt_required
from utils import admin_required

division_bp = Blueprint('division_bp', __name__)

@division_bp.route('/divisions', methods=['POST'])
@admin_required
def create_division():
    data = request.get_json()
    name = data.get('name')
    class_id = data.get('class_id')

    if not name or not class_id:
        return jsonify({"msg": "Name and class ID are required"}), 400
    
    existing_division = Division.query.filter_by(name=name, class_id=class_id).first()
    if existing_division:
        return jsonify({'error': 'Division with this name already exists for the specified class'}), 400

    class_ = Class.query.get(class_id)
    if not class_:
        return jsonify({"msg": "Invalid class ID"}), 400

    new_division = Division(name=name, class_id=class_id)
    db.session.add(new_division)
    db.session.commit()
    return jsonify(new_division.serialize()), 201

@division_bp.route('/divisions', methods=['GET'])
def get_divisions():
    try:
        divisions = Division.query.all()
        divisions_list = [division.serialize() for division in divisions]
        return jsonify(divisions_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@division_bp.route('/divisions/<int:class_id>', methods=['GET'])
@jwt_required()
def get_divisions_by_class(class_id):
    try:
        divisions = Division.query.filter_by(class_id=class_id).all()
        divisions_list = [division.serialize() for division in divisions]
        return jsonify(divisions_list), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500



@division_bp.route('/divisions/<int:division_id>', methods=['PUT'])
@admin_required
def update_division(division_id):
    data = request.get_json()
    division = Division.query.get_or_404(division_id)
    division.name = data.get('name', division.name)
    db.session.commit()
    return jsonify(division.serialize())

@division_bp.route('/divisions/<int:division_id>', methods=['DELETE'])
@admin_required
def delete_division(division_id):
    division = Division.query.get_or_404(division_id)
    db.session.delete(division)
    db.session.commit()
    return jsonify({"msg": "Division deleted"})
