from datetime import datetime
from extensions import db, jwt
from .helper import u_id_generator, f_id_generator, r_id_generator
from sqlalchemy import Table, select, func
from sqlalchemy.ext.hybrid import hybrid_property
import bcrypt

@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.u_id


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(u_id=identity).one_or_none()

followers = Table('followers', db.metadata,
    db.Column('followed_id', db.String(32), db.ForeignKey('user.u_id')),
    db.Column('follower_id', db.String(32), db.ForeignKey('user.u_id'))
)

blocked_users = Table('blocked_users', db.metadata,
    db.Column('blocked_id', db.String(32), db.ForeignKey('user.u_id')),
    db.Column('blocker_id', db.String(32), db.ForeignKey('user.u_id')),
)

users_wish_film = Table('users_wish_film', db.metadata,
    db.Column('user_id', db.String(32), db.ForeignKey('user.u_id')),
    db.Column('film_id', db.String(32), db.ForeignKey('film.f_id'))
)

bad_word = db.Table('bad_word', db.metadata,
    db.Column('w_id', db.Integer, primary_key=True, autoincrement=True),
    db.Column('word', db.String(32), nullable=False))

class User(db.Model):
    __tablename__ = 'user'
    
    u_id = db.Column(db.String(32), primary_key=True, nullable=False, unique=True, default=u_id_generator)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password_hash = db.Column(db.Text, nullable=False)
    email = db.Column(db.String(80), nullable=False, unique=True)
    url_photo = db.Column(db.Text, nullable=True)
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
    
    wish = db.relationship('Film', secondary=users_wish_film, backref='user', lazy='dynamic')
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    def verify_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash)
    
    def __repr__(self):
        return '<User %r>' % self.username


    

class Film(db.Model):
    __tablename__ = 'film'

    f_id = db.Column(db.String(32), primary_key=True, nullable=False, unique=True, default=f_id_generator)
    title = db.Column(db.String(80), nullable=False)
    genre = db.Column(db.String(80), nullable=False)
    year = db.Column(db.Integer, nullable=True)
    run_time = db.Column(db.String(16), nullable=True)
    rating_imdb = db.Column(db.Float, nullable=True)
    overview = db.Column(db.String(500), nullable=True)
    director = db.Column(db.String(80), nullable=True)
    actor = db.Column(db.String(200), nullable=True)
    url_poster = db.Column(db.Text, nullable=True)
    rating_doubi = db.Column(db.Float, nullable=True)

    created_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    reviews = db.relationship('Review', backref='film', lazy='dynamic')
    
    @hybrid_property
    def rating(self):
        reviews = self.reviews.all()
        if len(reviews) == 0:
            return 0
        else:
            return round(sum(review.rating for review in reviews) / len(reviews), 1)
        
    @rating.expression
    def rating(cls):
        return select(func.avg(Review.rating)).where(Review.f_id == cls.f_id)
    
    @property
    def rating_distribution(self):
        reviews = self.reviews.all()
        rating_distribution = {x: 0 for x in range(0, 5)}
        for review in reviews:
            rating_distribution[review.rating] = rating_distribution.get(review.rating, 0) + 1
        return rating_distribution

    @property
    def genres(self):
        return [genre.strip() for genre in self.genre.split(',')]
    
    @property
    def actors(self):
        return [actor.strip() for actor in self.actor.split(',')]
    
    
    def rating_customized(self, current_user):
        reviews = self.reviews.all()
        blocked_id = [x.u_id for x in current_user.blocked.all()]
        reviews = [x for x in reviews if x.u_id not in blocked_id]
        if len(reviews) == 0:
            return 0
        else:
            return round(sum(review.rating for review in reviews) / len(reviews), 1)
        
    def rating_distribution_customized(self, current_user):
        reviews = self.reviews.all()
        blocked_id = [x.u_id for x in current_user.blocked.all()]
        reviews = [x for x in reviews if x.u_id not in blocked_id]
        rating_distribution = {x: 0 for x in range(0, 5)}
        for review in reviews:
            rating_distribution[review.rating] = rating_distribution.get(review.rating, 0) + 1
        return rating_distribution
    
    def __repr__(self):
        return '<Film %r>' % self.title
    


class Review(db.Model):
    __tablename__ = 'review'

    r_id = db.Column(db.String(32), primary_key=True, nullable=False, unique=True, default=r_id_generator)
    u_id = db.Column(db.String(32), db.ForeignKey('user.u_id'), nullable=False)
    f_id = db.Column(db.String(32), db.ForeignKey('film.f_id'), nullable=False)
    content = db.Column(db.String(500), nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    bad_word = db.Column(db.Boolean, nullable=False, default=False)

    created_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    likes = db.relationship('Review_Like', backref='review', lazy='dynamic')
    dislikes = db.relationship('Review_Dislike', backref='review', lazy='dynamic')
    
    @property
    def like(self):
        return self.likes.count()
    
    @property
    def dislike(self):
        return self.dislikes.count()


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
    