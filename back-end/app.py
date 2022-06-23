import json

from flask import Flask, request
from flask import send_file
from flask_restx import Resource, Api
from flask_restx import fields, reqparse
# from flask_login import LoginManager, login_required, UserMixin

import authorization as auth
from flask_cors import CORS, cross_origin  # CORS support, DO NOT DELETE

app = Flask(__name__)
api = Api(app)
CORS(app)  # CORS support, DO NOT DELETE


# login_manager = LoginManager()
# login_manager.init_app(app)

# # user class
# class User(UserMixin):
#     def __init__(self, )

# @login_manager.user_loader
# def load_user(user_id):
#     auth


###############################################################################
#                                  Signup                                     #
###############################################################################


# sign_up_arguments = reqparse.RequestParser()
# sign_up_arguments.add_argument('email')
# sign_up_arguments.add_argument('password')
# sign_up_arguments.add_argument('username')

# @api.route('/auth/signup', methods=['POST'])
# class signup(Resource):
#     @api.expect(sign_up_arguments)
#     def post(self):
#         args = sign_up_arguments.parse_args()
#
#         if auth.check_user_exist(args['email']):
#             return {'message': 'user already exist'}, 400
#         else:
#             auth.insert_user(args)
#             return {'message': 'user created'}, 201

users_model = api.model('users', {
    "email": fields.String,
    "username": fields.String,
    "password": fields.String,
})
@api.route('/auth/signup', methods=['POST'])
class signup(Resource):
    @api.expect(users_model)
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))  # turn request body into python dictionary
        if auth.check_user_exist(payload['email']):
            return {'message': 'user already exist'}, 400
        else:
            auth.insert_user(payload)
            return {'message': 'user created'}, 200


###############################################################################
#                                  Login                                      #
###############################################################################

# @api.route('/auth/login', methods=['POST'])
# class login(Resource):


###############################################################################
#                                  Logout                                    #
###############################################################################

# @api.route('/auth/logout', methods=['POST'])
# @login_required
# class logout(Resource):


###############################################################################
#                                  Film                                       #
###############################################################################

import Filmdb as Fdb

film_arguments = reqparse.RequestParser()
film_arguments.add_argument('id')

@api.route('/films', methods=['GET'])
class film(Resource):
    @api.expect(film_arguments)
    def get(self):
        args = film_arguments.parse_args()
        if Fdb.check_film_exist(args['id']):
            film1 = Fdb.find_film(args['id'])
            response = {
                'FILM_ID': film1[0],
                'TITLE': film1[1],
                'YEAR': film1[2],
                'RUN_TIME': film1[3],
                'RATING': film1[4],
                'OVERVIEW': film1[5],
                'DIRECTOR': film1[6],
                'POSTER': film1[7]
            }
            return response, 200
        else:
            return {'message': 'Film not found'}, 404

# movie_arguments = reqparse.RequestParser()
# movie_arguments.add_argument('title')

# @api.route('/movies', methods=['GET'])
# class movies(Resource):
#     @api.expect(movie_arguments)
#     def get(self):
#         args = movie_arguments.parse_args()
#         returnedMsg = {'message': 'hola'}
#         return returnedMsg, 200


if __name__ == "__main__":
    app.run(debug=True)
