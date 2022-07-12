from flask import Flask
from flask_cors import CORS

def create_app():
    print("Creating app...")
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Database/doubi_database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    register_extensions(app)
    register_blueprints(app)

    return app


def register_blueprints(app):
    print("Registering blueprints...")
    from APIs import api_bp
    app.register_blueprint(api_bp)


def register_extensions(app):
    print("Registering extensions...")
    from extensions import db
    db.init_app(app)
