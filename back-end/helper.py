from flask import Flask
from flask_cors import CORS

def create_app():
    print("Creating app...")
    app = Flask(__name__)
    CORS(app)

    register_extensions(app)
    register_blueprints(app)

    return app


def register_blueprints(app):
    from APIs import api_bp
    app.register_blueprint(api_bp)


def register_extensions(app):
    from extensions import db, mail

    db_config = {
        'SQLALCHEMY_DATABASE_URI' : 'sqlite:///Database/doubi_database.db',
        'SQLALCHEMY_TRACK_MODIFICATIONS' : False
    }
    app.config.update(db_config)
    db.init_app(app)

    mail_settings = {
        "MAIL_SERVER": 'smtp.163.com',
        "MAIL_PORT": 465,
        "MAIL_USE_TLS": False,
        "MAIL_USE_SSL": True,
        "MAIL_USERNAME": 'doubimovie@163.com',
        "MAIL_PASSWORD": 'GQFCQBTRXCSXNMVY'
    }
    app.config.update(mail_settings)
    mail.init_app(app)

    from extensions import jwt
    app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'
    jwt.init_app(app)

