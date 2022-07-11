import json
from flask import request
from flask_restx import Resource, Namespace, fields, reqparse

from . import auth

api = Namespace("reviews", description="Authentication related operations")


###############################################################################
#                                get review                                   #
###############################################################################

review_arguments = reqparse.RequestParser()
review_arguments.add_argument('method', type=str, default='uid', required=True)
review_arguments.add_argument('movie_id', type=int)
review_arguments.add_argument('uid', type=int)
review_arguments.add_argument('top', type=int)
review_arguments.add_argument('recent', type=int)

review_model = api.model('review', {
    "movie_id": fields.Integer,
    "uid": fields.Integer,
    "rating": fields.Float,
    "review": fields.String,
})

@api.route('/review', methods=['GET', 'POST'])
class reviews(Resource):

    @api.param('method', 'the method to get review, one of the following: \nuid, \nmovie_id, \nuid_movie_id, \nreview_id, \ntop, \nrecent, \nrecent_top')
    @api.expect(review_arguments)
    @api.response(200, 'Success, review found')
    @api.response(400, 'Fail, invalid method')
    @api.response(404, 'Fail, review not found')
    def get(self):
        '''
        fetch reviews from db according to the method

        login required: False

        Args:
            method {
                'uid' return all reviews of a user with uid, 
                'movie_id' return all reviews of a movie with movie_id,, 
                'uid_movie_id' return all reviews of a user with uid to the movie with movie_id, 
                'review_id' return a review with review_id, 
                'top' return top N reviews with the most likes, 
                'recent' return all reviews in past N months, 
                'recent_top return top N reviews in past N months,'
            }
            uid: int, the uid of the user, for method 'uid' and 'uid_movie_id'
            movie_id: int, the movie_id of the movie, for method 'movie_id' and 'uid_movie_id'
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
                result = get_review(method='uid', value=args['uid'])
        elif args['method'] == 'movie_id':
            if args['movie_id'] is None:
                return {'message': 'movie_id is required'}, 400
            else:
                result = get_review(method='movie_id', value=args['movie_id'])
        elif args['method'] == 'uid_movie_id':
            if args['uid'] is None or args['movie_id'] is None:
                return {'message': 'uid and movie_id are both required'}, 400
            else:
                result = get_review(method='uid_movie_id', value=(args['uid'], args['movie_id']))
        elif args['method'] == 'top':
            if args['top'] is None:
                return {'message': 'top is required'}, 400
            else:
                result = get_review(method='top', value=args['top'])
        elif args['method'] == 'recent':
            if args['recent'] is None:
                return {'message': 'recent is required'}, 400
            else:
                result = get_review(method='recent', value=args['recent'])
        elif args['method'] == 'recent_top':
            if args['recent'] is None or args['top'] is None:
                return {'message': 'recent and top are both required'}, 400
            else:
                result = get_review(method='recent_top', value=(args['recent'], args['top']))
        
        if len(result) == 0:
            return {'message': 'review not found'}, 404
        else:
            return result, 200
    
    @api.expect(review_model)
    @api.response(200, 'Success, review added')
    @api.response(400, 'Fail, invalid review')
    @api.response(404, 'Fail, user not found')
    def post(self):
        '''
        post review to certain movie

        login required: True

        Args:
            None
        
        Request body:
        {
            'movie_id': int, the movie_id of the movie,
            'uid': int, the uid of the user,
            'rating': float, the rating of the movie,
            'review': str, the review of the movie, can be empty,
        }
        
        
        '''

        payload = json.loads(str(request.data, 'utf-8'))

        if len(payload) != 4:
            return {'message': 'Invalid request body'}, 400

        if payload['uid'] is None or payload['movie_id'] is None or payload['rating'] is None:
            return {'message': 'uid, movie_id and rating are all required'}, 400

        if auth.check_uid_exist(payload['uid']):
            insert_review(payload)
            return {'message': 'review added'}, 200
        else:
            return {'message': 'user not exist'}, 404


@api.route('/review/<int:review_id>', methods=['GET'])
@api.param('review_id', 'id of the review')
class get_review(Resource):

    @api.response(200, 'Success, review found')
    @api.response(404, 'Fail, review not found')
    def get(self, review_id):
        '''
        get review with review_id

        login required: False

        Args:
            review_id: int, the id of the review
        
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
        result = get_review(method='review_id', value=review_id)
        if len(result) == 0:
            return {'message': 'review not found'}, 404
        else:
            return result, 200


###############################################################################
#                               rating review                                 #
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
        rate a review with like or dislike

        login required: True

        Args:
            None
        
        Request body:
            {
                'method': 1 for like, 0 for dislike,
                'uid': int, the uid of the user,
                'review_id': int, the id of the review,
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
                rating_review(payload['review_id'], 'like' if payload['method'] else 'dislike')
            else:
                return {'message': 'user not exist'}, 404

        return {'message': 'Rating received.'}, 200


###############################################################################
#                               helping funcs                                 #
###############################################################################

import sqlite3
import os
import datetime

filename = 'reviews.db'
path = os.getcwd() + '/back-end/db/' + filename


def init_review_db():
    '''
    Initialize the database for reviews and create table if it doesn't exist

    Args:
        None
    
    Returns:
        None
    '''

    # create a new database for user if it doesn't exist
    conn = sqlite3.connect(path)
    c = conn.cursor()

    # create a table for user if it doesn't exist
    c.execute("""CREATE TABLE IF NOT EXISTS reviews (
        review_id INTEGER PRIMARY KEY AUTOINCREMENT,
        movieDetail TEXT,
        rating INTEGER NOT NULL,
        uid INTEGER NOT NULL,
        movie_id INTEGER NOT NULL,
        release_date INTEGER NOT NULL,
        like INTEGER DEFAULT 0,
        dislike INTEGER DEFAULT 0)""")
    
    conn.commit()
    conn.close()


def insert_review(review):
    '''
    insert a movieDetail into db

    Args:
        review: dict, the movieDetail to insert
        {
            'movieDetail': str, the movieDetail text,
            'rating': float, the rating of the mostPopularComments,
            'uid': int, the user id,
            'movie_id': int, the mostPopularComments id,
        }
    
    Returns:
        None

    '''
    conn = sqlite3.connect(path)
    c = conn.cursor()


    c.execute("""INSERT INTO reviews (
        review, rating, uid, movie_id, release_date) VALUES (
        '%s', %f, %d, %d, %d)""" % (
        review['review'],
        review['rating'],
        review['uid'],
        review['movie_id'],
        datetime.datetime.now().timestamp()))

    conn.commit()
    conn.close()


def get_review(method = 'uid', value = None):
    '''
    fetch reviews from db based on method and value

    Args:
        method: str, the method to fetch reviews by. 
        {
            'uid': fetch reviews by user id,
            'movie_id': fetch reviews by mostPopularComments id,
            'uid_movie_id': fetch reviews by user id and mostPopularComments id,
            'review_id': fetch a movieDetail by movieDetail id,
            'top': fetch top N reviews by like count,
            'recent': fetch reviews in the last N months,
            'recent_top': fetch top M reviews by like count in the last N months,
            
        }
    
        value: int, the value of the method, for specific
        {
            'uid': user id,
            'movie_id': mostPopularComments id,
            'uid_movie_id': user id and mostPopularComments id, (uid, movie_id)
            'review_id': movieDetail id,
            'top': Top N reviews
            'recent': reviews in the last N months
            'recent_top': top M reviews in the last N months, (M top, N months)
        }
    
    Returns:
        reviews: list, the reviews fetched from db
    '''
    conn = sqlite3.connect(path)
    c = conn.cursor()

    print(method, value)

    if method == 'uid':
        c.execute("""SELECT * FROM reviews WHERE uid = %d""" % (value,))
    elif method == 'movie_id':
        c.execute("""SELECT * FROM reviews WHERE movie_id = %d""" % (value,))
    elif method == 'uid_movie_id':
        c.execute("""SELECT * FROM reviews WHERE uid = %d AND movie_id = %d""" % (value[0], value[1]))
    elif method == 'top':
        c.execute("""SELECT * FROM reviews ORDER BY like DESC LIMIT %d""" % (value,))
    elif method == 'recent':
        c.execute("""SELECT * FROM reviews WHERE release_date > %d""" % (datetime.datetime.now().timestamp() - value * 30 * 24 * 60 * 60,))
    elif method == 'recent_top':
        c.execute("""SELECT * FROM reviews WHERE release_date > %d ORDER BY like DESC LIMIT %d""" % (datetime.datetime.now().timestamp() - value[0] * 30 * 24 * 60 * 60, value[1],))
    elif method == 'review_id':
        c.execute("""SELECT * FROM reviews WHERE review_id = %d""" % (value,))

    reviews = c.fetchall()
    if reviews is None:
        return False


    result = []
    
    
    conn.close()

    for i in reviews:
        review = {}
        review['review_id'] = i[0]
        review['movieDetail'] = i[1]
        review['rating'] = i[2]
        review['uid'] = i[3]
        review['movie_id'] = i[4]
        review['release_date'] = i[5]
        review['like'] = i[6]
        review['dislike'] = i[7]
        result.append(review)

    return result


def rating_review(review_id, method):
    '''
    like or dislike a movieDetail

    Args:
        review_id: int, the movieDetail id
        method: str, the like or dislike
    
    Returns:
        None

    '''

    conn = sqlite3.connect(path)
    c = conn.cursor()

    if method == 'like':
        c.execute("""UPDATE reviews SET like = like + 1 WHERE review_id = %d""" % (review_id,))
    elif method == 'dislike':
        c.execute("""UPDATE reviews SET dislike = dislike + 1 WHERE review_id = %d""" % (review_id,))

    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_review_db()