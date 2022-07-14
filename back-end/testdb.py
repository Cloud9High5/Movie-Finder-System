from calendar import month
from re import U
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from dateutil.relativedelta import relativedelta
from datetime import datetime
from flask_mail import Mail, Message
from Models.helper import u_id_generator, f_id_generator, r_id_generator
from Models.model import User, Film, Review, Review_Like

app = Flask(__name__)

mail_settings = {
    "MAIL_SERVER": 'smtp.163.com',
    "MAIL_PORT": 465,
    "MAIL_USE_TLS": False,
    "MAIL_USE_SSL": True,
    "MAIL_USERNAME": 'doubimovie@163.com',
    "MAIL_PASSWORD": 'GQFCQBTRXCSXNMVY'
}

db_config = {
    'SQLALCHEMY_DATABASE_URI' : 'sqlite:///Database/doubi_database.db',
    'SQLALCHEMY_TRACK_MODIFICATIONS' : False
}

app.config.update(db_config)
db = SQLAlchemy(app)

# app.config.update(mail_settings)
# mail = Mail(app)

class test(db.Model):
    __tablename__ = 'test'
    f_id = db.Column(db.String(32), primary_key=True, nullable=False, unique=True, default=f_id_generator)
    title = db.Column(db.String(80), nullable=False)
    year = db.Column(db.Integer, nullable=True)
    run_time = db.Column(db.String(16), nullable=True)
    rating_imdb = db.Column(db.Float, nullable=True)
    overview = db.Column(db.String(500), nullable=True)
    director = db.Column(db.String(80), nullable=True)
    url_poster = db.Column(db.Text, nullable=True)
    created_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

# db.create_all()

# a = db.session.query(Film).all()

# for i in a:
#     db.session.add(test(
#         f_id = i.f_id,
#         title = i.title,
#         year = i.year,
#         run_time = i.run_time,
#         rating_imdb = i.rating_imdb,
#         overview = i.overview,
#         director = i.director,
#         url_poster = i.url_poster,
#         created_time = i.created_time,
#         updated_time = i.updated_time
#     ))

# db.session.commit()