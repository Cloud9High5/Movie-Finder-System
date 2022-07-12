from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Database/doubi_database.db'

db = SQLAlchemy(app)

# show all the tables
db.create_all()

# show all the tables
db.session.query("SELECT * FROM users").all()