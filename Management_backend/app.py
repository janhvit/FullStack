# app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from models import db

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
migrate = Migrate(app, db)
CORS(app, resources={r"/*": {"origins": "*"}})

db.init_app(app)

# Initialize extensions

bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

# Import blueprints and register them
from routes.auth_routes import auth_bp
from routes.class_routes import class_bp
from routes.division_routes import division_bp
from routes.student_routes import student_bp
from routes.assignment_routes import assignment_bp
from routes.attendance_routes import attendance_bp
from routes.course_routes import course_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(class_bp, url_prefix='/classes')
app.register_blueprint(division_bp, url_prefix='/division')
app.register_blueprint(student_bp, url_prefix='/student')
app.register_blueprint(assignment_bp, url_prefix='/assignment')
app.register_blueprint(attendance_bp, url_prefix='/attendance')
app.register_blueprint(course_bp, url_prefix='/course')

if __name__ == "__main__":
    app.run(debug=True)
