from calendar import month
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from dateutil.relativedelta import relativedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Database/doubi_database.db'

db = SQLAlchemy(app)

from Models.model import User, Film, Review, Review_Like

count = func.count(Review_Like.r_id).label('count')
test = db.session.query(
    Review_Like.r_id,
    count
).group_by(Review_Like.r_id).order_by(count.desc()).having(count > 1).all()

# temp = [i.r_id for i in test]
# print(temp)

# test = db.session.query(Review).filter(Review.r_id.in_(temp)).all()

# print(test)

# def count_review_like():
#     count = func.count(Review_Like.r_id).label('count')
#     return db.session.query(
#         Review,
#         count
#     ).filter(Review_Like.is_liked == 1).filter(Review.r_id == Review_Like.r_id).group_by(Review_Like.r_id).order_by(count.desc()).all()

# print(count_review_like())

count = db.session.query(Review_Like.r_id, func.count(Review_Like.r_id).label('like_count')).group_by(Review_Like.r_id).subquery()

r = db.session.query(Review, count.c.like_count).join(count, Review.r_id == count.c.r_id).order_by(count.c.like_count.desc()).all()

print(r)