import json

from flask import Flask, request
from flask import send_file
from flask_restx import Resource, Api
from flask_restx import fields, reqparse
import json
# from flask_login import LoginManager, login_required, UserMixin

import authorization as auth
import review
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
                'movie_id': film1[0],
                'title': film1[1],
                'year': film1[2],
                'run_time': film1[3],
                'rating': film1[4],
                'overview': film1[5],
                'director': film1[6],
                'poster': film1[7]
            }
            return response, 200
        else:
            return {'message': 'Film not found'}, 404


# return the highest rated N movies
top_rating_arguments = reqparse.RequestParser()
top_rating_arguments.add_argument('number')

@api.route('/films/top/<int:number>', methods=['GET'])
class top_rating(Resource):
    # @api.expect(top_rating_arguments)
    def get(self, number):
        args = top_rating_arguments.parse_args()
        # film1 = Fdb.show_top_rating_film(int(args['number']))
        film1 = Fdb.show_top_rating_film(int(number))
        result = []
        for row in film1:
            response = {
                    'movie_id': row[0],
                    'title': row[1],
                    'year': row[2],
                    'run_time': row[3],
                    'rating': row[4],
                    'overview': row[5],
                    'director': row[6],
                    'poster': row[7]
                    }
            result.append(response)
        return result, 200

# return the latest released N movies
top_recent_arguments = reqparse.RequestParser()
top_recent_arguments.add_argument('number')

@api.route('/films/recent/<int:number>', methods=['GET'])
class top_recent(Resource):
    # @api.expect(top_recent_arguments)
    def get(self, number):
        args = top_recent_arguments.parse_args()
        # film1 = Fdb.show_top_recent_film(int(args['number']))
        film1 = Fdb.show_top_recent_film(int(number))
        result = []
        for row in film1:
            response = {
                    'movie_id': row[0],
                    'title': row[1],
                    'year': row[2],
                    'run_time': row[3],
                    'rating': row[4],
                    'overview': row[5],
                    'director': row[6],
                    'poster': row[7]
                    }
            result.append(response)
        return result, 200


if __name__ == "__main__":
    app.run(debug=True)
