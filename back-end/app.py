from flask import Flask
from flask_cors import CORS, cross_origin  # CORS support, DO NOT DELETE

app = Flask(__name__)
CORS(app)  # CORS support, DO NOT DELETE

from APIs import api_bp
app.register_blueprint(api_bp)

if __name__ == "__main__":
    app.run(debug=True)
