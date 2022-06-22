from flask import Flask, request
from flask import send_file
from flask_restx import Resource, Api
from flask_restx import fields, reqparse
# from flask_login import LoginManager, login_required, UserMixin

import authorization as auth

app = Flask(__name__)
api = Api(app)


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


sign_up_arguments = reqparse.RequestParser()
sign_up_arguments.add_argument('email')
sign_up_arguments.add_argument('password')
sign_up_arguments.add_argument('username')

@api.route('/auth/signup', methods=['POST'])
class signup(Resource):
    @api.expect(sign_up_arguments)
    def post(self):
        args = sign_up_arguments.parse_args()

        if auth.check_user_exist(args['email']):
            return {'message': 'user already exist'}, 400
        else:
            auth.insert_user(args)
            return {'message': 'user created'}, 201


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
