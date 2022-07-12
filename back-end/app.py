from flask import Flask
from flask_cors import CORS, cross_origin  # CORS support, DO NOT DELETE

from helper import create_app
app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
