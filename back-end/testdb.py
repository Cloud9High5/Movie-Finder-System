from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Table, func
from dateutil.relativedelta import relativedelta
from datetime import datetime
from flask_mail import Mail, Message
from Models.helper import u_id_generator, f_id_generator, r_id_generator
# from Models.model import User, Film, Review, Review_Like, Review_Dislike
from datetime import datetime

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

# from sqlite3 import connect
# conn = connect(app.root_path + '/Database/doubi_database_old.db')
# c = conn.cursor()

# c.execute('SELECT * FROM review__like')
# review_likes = c.fetchall()

followers = Table('followers', db.metadata,
    db.Column('followed_id', db.String(32), db.ForeignKey('user.u_id')),
    db.Column('follower_id', db.String(32), db.ForeignKey('user.u_id'))
)

blocked_users = Table('blocked_users', db.metadata,
    db.Column('blocked_id', db.String(32), db.ForeignKey('user.u_id')),
    db.Column('blocker_id', db.String(32), db.ForeignKey('user.u_id')),
)


class User(db.Model):
    __tablename__ = 'user'
    
    u_id = db.Column(db.String(32), primary_key=True, nullable=False, unique=True, default=u_id_generator)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(80), nullable=False, unique=True)
    photo_url = db.Column(db.Text, nullable=True)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    is_blocked = db.Column(db.Boolean, nullable=False, default=False)

    created_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    followed = db.relationship('User', 
                                secondary=followers,
                                primaryjoin=(followers.c.follower_id == u_id),
                                secondaryjoin=(followers.c.followed_id == u_id),
                                backref=db.backref('followers', lazy='dynamic'),
                                lazy='dynamic')

    blocked = db.relationship('User',
                                secondary=blocked_users,
                                primaryjoin=(blocked_users.c.blocker_id == u_id),
                                secondaryjoin=(blocked_users.c.blocked_id == u_id),
                                backref=db.backref('blockers', lazy='dynamic'),
                                lazy='dynamic')
    
    reviews = db.relationship('Review', backref='user', lazy='dynamic')

    review_likes = db.relationship('Review_Like', backref='user', lazy='dynamic')
    review_dislikes = db.relationship('Review_Dislike', backref='user', lazy='dynamic')


    

class Film(db.Model):
    __tablename__ = 'film'

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

    reviews = db.relationship('Review', backref='film', lazy='dynamic')


class Review(db.Model):
    __tablename__ = 'review'

    r_id = db.Column(db.String(32), primary_key=True, nullable=False, unique=True, default=r_id_generator)
    u_id = db.Column(db.String(32), db.ForeignKey('user.u_id'), nullable=False)
    f_id = db.Column(db.String(32), db.ForeignKey('film.f_id'), nullable=False)
    content = db.Column(db.String(500), nullable=True)
    rating = db.Column(db.Integer, nullable=False)

    created_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    likes = db.relationship('Review_Like', backref='review', lazy='dynamic')
    dislikes = db.relationship('Review_Dislike', backref='review', lazy='dynamic')


class Review_Like(db.Model):
    __tablename__ = 'review_like'

    r_id = db.Column(db.String(32), db.ForeignKey('review.r_id'), primary_key=True, nullable=False)
    u_id = db.Column(db.String(32), db.ForeignKey('user.u_id'), primary_key=True, nullable=False)

    created_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class Review_Dislike(db.Model):
    __tablename__ = 'review_dislike'

    r_id = db.Column(db.String(32), db.ForeignKey('review.r_id'), primary_key=True, nullable=False)
    u_id = db.Column(db.String(32), db.ForeignKey('user.u_id'), primary_key=True, nullable=False)

    created_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

db.create_all()