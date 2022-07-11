from flask import Flask
from flask_cors import CORS, cross_origin  # CORS support, DO NOT DELETE
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)  # CORS support, DO NOT DELETE

from APIs import api_bp
app.register_blueprint(api_bp)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Database/doubi_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

if __name__ == "__main__":
    app.run(debug=True)
