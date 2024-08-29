from flask import Blueprint

# Import the blueprints from their respective modules
from .auth_routes import auth_bp
from .class_routes import class_bp

# List of blueprints to be registered in the main app
__all__ = ['auth_bp', 'class_bp']
