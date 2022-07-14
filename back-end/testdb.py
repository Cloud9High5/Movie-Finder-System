from calendar import month
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from dateutil.relativedelta import relativedelta
from datetime import datetime
from flask_mail import Mail, Message

app = Flask(__name__)

mail_settings = {
    "MAIL_SERVER": 'smtp.163.com',
    "MAIL_PORT": 465,
    "MAIL_USE_TLS": False,
    "MAIL_USE_SSL": True,
    "MAIL_USERNAME": 'doubimovie@163.com',
    "MAIL_PASSWORD": 'GQFCQBTRXCSXNMVY'
}

app.config.update(mail_settings)

mail = Mail(app)

@app.route('/')
def hello_world():
    msg = Message(subject='Hello World', 
                    sender=app.config.get('MAIL_USERNAME'),
                    recipients=['zzy801997@gmail.com'],
                    body='This is the test email body')
    mail.send(msg)
    return 'Hello World!'

app.run(debug=True)
