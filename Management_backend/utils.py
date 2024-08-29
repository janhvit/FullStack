from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from functools import wraps
from models import User  
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity() 
        user = User.query.get(user_id)  

        if user is None or not user.is_teacher:
            return jsonify({"msg": "Admins only!"}), 403

        return fn(*args, **kwargs)
    return wrapper
