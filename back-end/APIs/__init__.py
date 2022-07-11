from sys import prefix
from flask import Blueprint
from flask_restx import Api

api_bp = Blueprint('api', __name__)

api = Api(api_bp)

from .auth import api as auth_api
from .review import api as review_api
from .film import api as film_api

api.add_namespace(auth_api)
api.add_namespace(review_api)
api.add_namespace(film_api)
