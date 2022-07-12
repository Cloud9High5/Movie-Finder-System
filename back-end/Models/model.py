import datetime 
from extensions import db
from .helper import u_id_generator, f_id_generator, r_id_generator

class User(db.Model):
    __tablename__ = 'user'
    u_id = db.Column(db.String(128), primary_key=True, nullable=False, unique=True, default=u_id_generator)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(80), nullable=False, unique=True)
    photo_url = db.Column(db.String(80), nullable=True)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    is_blocked = db.Column(db.Boolean, nullable=False, default=False)
    created_time = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    updated_time = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    

class Film(db.Model):
    f_id = db.Column(db.String(128), primary_key=True, nullable=False, unique=True, default=f_id_generator)
    title = db.Column(db.String(80), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    run_time = db.Column(db.String(16), nullable=False)
    rating_imdb = db.Column(db.Float, nullable=False)
    overview = db.Column(db.String(500), nullable=False)
    director = db.Column(db.String(80), nullable=False)
    url_poster = db.Column(db.String(500), nullable=False)
    created_time = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    updated_time = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Review(db.Model):
    r_id = db.Column(db.String(128), primary_key=True, nullable=False, unique=True, default=r_id_generator)
    u_id = db.Column(db.String(128), db.ForeignKey('user.u_id'), nullable=False)
    f_id = db.Column(db.String(128), db.ForeignKey('film.f_id'), nullable=False)
    content = db.Column(db.String(500), nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    created_time = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)


class Review_Like(db.Model):
    r_id = db.Column(db.String(128), db.ForeignKey('review.r_id'), primary_key=True, nullable=False)
    u_id = db.Column(db.String(128), db.ForeignKey('user.u_id'), primary_key=True, nullable=False)
    is_liked = db.Column(db.Boolean, nullable=False, default=True)
    created_time = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
