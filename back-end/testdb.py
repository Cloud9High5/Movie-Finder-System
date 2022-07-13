from calendar import month
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from dateutil.relativedelta import relativedelta
from datetime import datetime
from Models.helper import u_id_generator

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Database/doubi_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

from Models.model import User, Film, Review, Review_Like

a = db.session.query(User).first()
print(a.following_list)