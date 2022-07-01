import json
from unittest import result

from flask import Flask, request
from flask import send_file
from flask_restx import Resource, Api
from flask_restx import fields, reqparse
import json

from numpy import require
# from flask_login import LoginManager, login_required, UserMixin

import authorization as auth
import review
from flask_cors import CORS, cross_origin  # CORS support, DO NOT DELETE

app = Flask(__name__)
api = Api(app)
# cors = CORS(app)  # CORS support, DO NOT DELETE
CORS(app)  # CORS support, DO NOT DELETE



###############################################################################
#                                  Signup                                     #
###############################################################################

users_model = api.model('users', {
    "email": fields.String,
    "username": fields.String,
    "password": fields.String,
})

@api.route('/auth/signup', methods=['POST'])
@api.response(201, 'Success, user created')
@api.response(409, 'Fail, User already exists')
class signup(Resource):
    @api.expect(users_model)
    def post(self):
        '''
        Sign up a new user, send user info to db

        login required: False

        Args:
            None

        Request body:
        {
            'email': str, the email of the user,
            'username': str, the username of the user,
            'password': str, the password of the user,
        }
        
        Returns:
            message and status code 
        '''
        payload = json.loads(str(request.data, 'utf-8'))  # turn request body into python dictionary
        if len(payload) != 3:
            return {'message': 'Invalid request body'}, 400
        if auth.check_user_exist(payload['email']):
            return {'message': 'user already exist'}, 409
        else:
            auth.insert_user(payload)
            return {'message': 'user created'}, 201


###############################################################################
#                                  Login                                      #
###############################################################################

login_model = api.model('login', {
    "email": fields.String,
    "password": fields.String,
})

@api.route('/auth/login', methods=['POST'])
@api.response(200, 'Success, user logged in')
@api.response(401, 'Fail, user not found')
@api.response(403, 'Fail, wrong password')
class login(Resource):
    @api.expect(login_model)
    def post(self):
        '''
        login

        login required: False

        Args:
            None

        Request body:
        {
            'email': str, the email of the user,
            'password': str, the password of the user,
        }

        Returns:
            Success
            200
            {
                'message': 'login success',
                'login_flag': True,
                'uid': uid,
            }
            Fail
            401 or 403
            {
                'message': 'user not exist'/'wrong password',
                'login_flag': False,
            }        
        '''
        payload = json.loads(str(request.data, 'utf-8'))

        if len(payload) != 2:
            return {'message': 'Invalid request body'}, 400

        if auth.check_user_exist(payload['email']):
            if auth.check_user_pwd(payload['email'], payload['password']):
                uid = auth.get_uid(payload['email'])
                return {
                    'message': 'login success', 
                    'login_flag': 'True',
                    'uid': uid
                    }, 200
            else:
                return {'message': 'wrong password', 'login_flag': 'False'}, 403
        else:
            return {'message': 'user not exist', 'login_flag': 'False'}, 401


###############################################################################
#                               get user info                                 #
###############################################################################


@api.route('/auth/user/<int:uid>', methods=['GET'])
@api.response(200, 'Success, user info returned')
@api.response(401, 'Fail, user not found')
class user_info(Resource):
    def get(self, uid):
        '''
        get user info

        login required: True

        Args:
            uid: int, the id of the user

        Request body:
            None

        Returns:
            Success
            200
            {
                'message': 'user info returned',
                'user_info': user_info,
            }
            Fail
            401
            {
                'message': 'user not found',
            }        
        '''
        if auth.check_uid_exist(uid):
            user_info = auth.get_user_info(uid)
            return user_info, 200
        else:
            return {'message': 'user not found'}, 401


###############################################################################
#                                get movieDetail                                   #
###############################################################################

review_arguments = reqparse.RequestParser()
review_arguments.add_argument('method', type=str, default='uid', required=True)
review_arguments.add_argument('movie_id', type=int)
review_arguments.add_argument('uid', type=int)
review_arguments.add_argument('top', type=int)
review_arguments.add_argument('recent', type=int)

review_model = api.model('movieDetail', {
    "movie_id": fields.Integer,
    "uid": fields.Integer,
    "rating": fields.Float,
    "movieDetail": fields.String,
})

@api.route('/review', methods=['GET', 'POST'])
class reviews(Resource):

    @api.param('method', 'the method to get movieDetail, one of the following: \nuid, \nmovie_id, \nuid_movie_id, \nreview_id, \ntop, \nrecent, \nrecent_top')
    @api.expect(review_arguments)
    @api.response(200, 'Success, movieDetail found')
    @api.response(400, 'Fail, invalid method')
    @api.response(404, 'Fail, movieDetail not found')
    def get(self):
        '''
        fetch reviews from db according to the method

        login required: False

        Args:
            method {
                'uid' return all reviews of a user with uid, 
                'movie_id' return all reviews of a mostPopularComments with movie_id,,
                'uid_movie_id' return all reviews of a user with uid to the mostPopularComments with movie_id,
                'review_id' return a movieDetail with review_id,
                'top' return top N reviews with the most likes, 
                'recent' return all reviews in past N months, 
                'recent_top return top N reviews in past N months,'
            }
            uid: int, the uid of the user, for method 'uid' and 'uid_movie_id'
            movie_id: int, the movie_id of the mostPopularComments, for method 'movie_id' and 'uid_movie_id'
            top: int, the number of reviews to return, for method 'top' and 'recent_top'
            recent: int, the number of months to return, for method 'recent' and 'recent_top'
        
        Request body:
            None

        Returns:
            Success
            
            Fail
            400
            {
                'message': fail reason
            }
        '''
        result = []
        args = review_arguments.parse_args()
        if args['method'] == 'uid':
            if args['uid'] is None:
                return {'message': 'uid is required'}, 400
            else:
                result = review.get_review(method='uid', value=args['uid'])
        elif args['method'] == 'movie_id':
            if args['movie_id'] is None:
                return {'message': 'movie_id is required'}, 400
            else:
                result = review.get_review(method='movie_id', value=args['movie_id'])
        elif args['method'] == 'uid_movie_id':
            if args['uid'] is None or args['movie_id'] is None:
                return {'message': 'uid and movie_id are both required'}, 400
            else:
                result = review.get_review(method='uid_movie_id', value=(args['uid'], args['movie_id']))
        elif args['method'] == 'top':
            if args['top'] is None:
                return {'message': 'top is required'}, 400
            else:
                result = review.get_review(method='top', value=args['top'])
        elif args['method'] == 'recent':
            if args['recent'] is None:
                return {'message': 'recent is required'}, 400
            else:
                result = review.get_review(method='recent', value=args['recent'])
        elif args['method'] == 'recent_top':
            if args['recent'] is None or args['top'] is None:
                return {'message': 'recent and top are both required'}, 400
            else:
                result = review.get_review(method='recent_top', value=(args['recent'], args['top']))
        
        if len(result) == 0:
            return {'message': 'movieDetail not found'}, 404
        else:
            return result, 200
    
    @api.expect(review_model)
    @api.response(200, 'Success, movieDetail added')
    @api.response(400, 'Fail, invalid movieDetail')
    @api.response(404, 'Fail, user not found')
    def post(self):
        '''
        post movieDetail to certain mostPopularComments

        login required: True

        Args:
            None
        
        Request body:
        {
            'movie_id': int, the movie_id of the mostPopularComments,
            'uid': int, the uid of the user,
            'rating': float, the rating of the mostPopularComments,
            'movieDetail': str, the movieDetail of the mostPopularComments, can be empty,
        }
        
        
        '''

        payload = json.loads(str(request.data, 'utf-8'))

        if len(payload) != 4:
            return {'message': 'Invalid request body'}, 400

        if payload['uid'] is None or payload['movie_id'] is None or payload['rating'] is None:
            return {'message': 'uid, movie_id and rating are all required'}, 400

        if auth.check_uid_exist(payload['uid']):
            review.insert_review(payload)
            return {'message': 'movieDetail added'}, 200
        else:
            return {'message': 'user not exist'}, 404


@api.route('/review/<int:review_id>', methods=['GET'])
@api.param('review_id', 'id of the movieDetail')
class get_review(Resource):

    @api.response(200, 'Success, movieDetail found')
    @api.response(404, 'Fail, movieDetail not found')
    def get(self, review_id):
        '''
        get movieDetail with review_id

        login required: False

        Args:
            review_id: int, the id of the movieDetail
        
        Request body:
            None

        Returns:
            Success
            
            Fail
            400
            {
                'message': fail reason
            }
        '''
        result = review.get_review(method='review_id', value=review_id)
        if len(result) == 0:
            return {'message': 'movieDetail not found'}, 404
        else:
            return result, 200


###############################################################################
#                               rating movieDetail                                 #
###############################################################################

review_rating_model = api.model('review_rating_model', {
    'method': fields.Integer,
    'uid': fields.Integer,
    'review_id': fields.Integer,
})

@api.route('/review/rating', methods=['POST'])
class rating_review(Resource):

    @api.response(400, 'Fail, invalid method')
    @api.response(200, 'Success')

    @api.expect(review_rating_model)
    def post(self):
        '''
        rate a movieDetail with like or dislike

        login required: True

        Args:
            None
        
        Request body:
            {
                'method': 1 for like, 0 for dislike,
                'uid': int, the uid of the user,
                'review_id': int, the id of the movieDetail,
            }

        Returns:
            Message and status code
        '''
        payload = json.loads(str(request.data, 'utf-8'))

        if len(payload) != 3:
            return {'message': 'Invalid request body'}, 400

        if payload['uid'] is None or payload['review_id'] is None:
            return {'message': 'uid and review_id are both required'}, 400
        elif payload['method'] not in [0,1] or payload['method'] is None:
            return {'message': 'method is required and must be 1, for like or 0, for dislike'}, 400
        else:
            if auth.check_uid_exist(payload['uid']):
                review.rating_review(payload['review_id'], 'like' if payload['method'] else 'dislike')
            else:
                return {'message': 'user not exist'}, 404

        return {'message': 'Rating received.'}, 200



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
