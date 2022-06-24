from flask import Flask, request
from flask import send_file
from flask_restx import Resource, Api
from flask_restx import fields, reqparse
import json
# from flask_login import LoginManager, login_required, UserMixin

import authorization as auth
import review

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

###############################################################################
#                                get review                                   #
###############################################################################

review_arguments = reqparse.RequestParser()
review_arguments.add_argument('method', type=str, default='uid')
review_arguments.add_argument('movie_id', type=int)
review_arguments.add_argument('uid', type=int)
review_arguments.add_argument('top', type=int)

review_model = api.model('review', {
    "movie_id": fields.Integer,
    "uid": fields.Integer,
    "rating": fields.Float,
    "review": fields.String,
})

@api.route('/review', methods=['GET', 'POST'])
class reviews(Resource):

    @api.param('method', 'the method to get review')
    @api.param('movie_id', 'id of the movie')
    @api.param('uid', 'id of the user')
    @api.expect(review_arguments)
    def get(self):
        args = review_arguments.parse_args()
        if args['method'] == 'uid':
            if args['uid'] is None:
                return {'message': 'uid is required'}, 400
            else:
                return review.get_review(method='uid', value=args['uid'])
        elif args['method'] == 'movie_id':
            if args['movie_id'] is None:
                return {'message': 'movie_id is required'}, 400
            else:
                return review.get_review(method='movie_id', value=args['movie_id'])
        elif args['method'] == 'both':
            if args['uid'] is None or args['movie_id'] is None:
                return {'message': 'uid and movie_id are both required'}, 400
            else:
                return review.get_review(method='both', value=(args['uid'], args['movie_id']))
        elif args['method'] == 'popular':
            if args['top'] is None:
                return {'message': 'top is required'}, 400
            else:
                return review.get_review(method='popular', value=args['top'])
    
    @api.expect(review_model)
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))
        review.insert_review(payload)
        return {'message': 'review created'}, 201


@api.route('/review/<int:review_id>', methods=['GET'])
@api.param('review_id', 'id of the review')
class get_review(Resource):
    def get(self, review_id):
        return review.get_review(method='review_id', value = review_id)


###############################################################################
#                                post review                                  #
###############################################################################







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
