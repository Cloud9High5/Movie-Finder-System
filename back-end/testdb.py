from calendar import month
from re import U
from time import strptime
from turtle import back
from venv import create
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Table, func
from dateutil.relativedelta import relativedelta
from datetime import datetime
from flask_mail import Mail, Message
from Models.helper import u_id_generator, f_id_generator, r_id_generator
from Models.model import User, Film, Review, Review_Like, Review_Dislike
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

from sqlite3 import connect
conn = connect(app.root_path + '/Database/doubi_database_old.db')
c = conn.cursor()

c.execute('SELECT * FROM review__like')
review_likes = c.fetchall()



# db.session.commit()

# conn.close()

# print(review_like[0])

