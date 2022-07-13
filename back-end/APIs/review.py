import json
from flask import request
from flask_restx import Resource, Namespace, fields, reqparse
from numpy import outer
from sqlalchemy import exists, func
from extensions import db
from Models.model import Review, User, Review_Like
from datetime import datetime, timedelta

api = Namespace("reviews", description="Reviews related operations", path="/")


################################################################################
#                                 REVIEW MODEL                                 #
################################################################################



review_arguments = reqparse.RequestParser()
review_arguments.add_argument('method', type=str, default='u_id')
review_arguments.add_argument('f_id', type=str)
review_arguments.add_argument('u_id', type=str)
review_arguments.add_argument('top', type=int)
review_arguments.add_argument('recent', type=int)

review_model = api.model("Review", {
    "r_id": fields.String(required=True, description="Review ID"),
    "f_id": fields.String(required=True, description="Film ID"),
    "u_id": fields.String(required=True, description="User ID"),
    "rating": fields.Integer(required=True, description="Rating"),
    "content": fields.String(required=False, description="Review Content"),
    "created_time": fields.String(required=True, description="Review Released Time"),
    "like": fields.Integer(required=True, description="Likes"),
    "dislike": fields.Integer(required=True, description="Dislikes"),
})

review_post_model = api.model('Review Post', {
    "f_id": fields.String(required=True, description="Film ID"),
    "u_id": fields.String(required=True, description="User ID"),
    "rating": fields.Float(required=True, description="Rating"),
    "content": fields.String(required=False, description="Review Content"),
})


review_rating_model = api.model('review_rating_model', {
    'method': fields.Integer(required=True, description="Method, 0: dislike, 1: like"),
    'u_id': fields.String(required=True, description="User ID"),
    'r_id': fields.String(required=True, description="Review ID"),
})


################################################################################
#                                    ROUTES                                    #
################################################################################



@api.route('/review', methods=['GET', 'POST'])
class reviews(Resource):
    @api.doc(
        'get reviews based on the given method',
        params = {
            'method': {'type': 'str', 'required': False, 'description': 'the method to get reviews, from [u_id, f_id, u_f_id, top, recent, recent_top]'},
            'f_id': {'type': 'str', 'required': False, 'description': 'the movie id'},
            'u_id': {'type': 'str', 'required': False, 'description': 'the user id'},
            'top': {'type': 'int', 'required': False, 'description': 'the top number of reviews'},
            'recent': {'type': 'int', 'required': False, 'description': 'the recent number of reviews'},
        },
        responses = {
            200: 'Success, review found',
            400: 'Fail, invalid method',
            404: 'Fail, review not found',
        },
    )
    @api.expect(review_arguments, validate=True)
    @api.marshal_list_with(review_model, code=200)
    def get(self):
        result = []
        args = review_arguments.parse_args()
        if args['method'] == 'u_id':
            if args['u_id'] is None:
                return {'message': 'u_id is required'}, 400
            else:
                result = get_review(method='u_id', value=args['u_id'])
        elif args['method'] == 'f_id':
            if args['f_id'] is None:
                return {'message': 'f_id is required'}, 400
            else:
                result = get_review(method='f_id', value=args['f_id'])
        elif args['method'] == 'u_f_id':
            if args['u_id'] is None or args['f_id'] is None:
                return {'message': 'u_id and f_id are both required'}, 400
            else:
                result = get_review(method='u_f_id', value=(args['u_id'], args['f_id']))
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
    
    @api.doc(
        'post a review',
        responses = {
            200: 'Success, review posted',
            400: 'Fail, invalid review',
            404: 'Fail, user not found'
        },
    )
    @api.expect(review_post_model, validate=True)
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))

        if payload['u_id'] is None or payload['f_id'] is None or payload['rating'] is None:
            return {'message': 'u_id, f_id and rating are all required'}, 400

        # check if user exists
        if not db.session.query(exists().where(User.u_id == payload['u_id'])).scalar():
            return {'message': 'user not found'}, 404
        else:
            db.session.add(Review(
                u_id = payload['u_id'],
                f_id = payload['f_id'],
                content = payload['content'],
                rating = payload['rating']
            ))
            db.session.commit()
            return {'message': 'review posted'}, 200


@api.route('/review/<string:review_id>', methods=['GET'])
class get_review(Resource):

    @api.marshal_with(review_model, code=200)
    @api.doc(
        'get a review based on the given review id',
        params = {
            'review_id': {'type': 'str', 'required': True, 'description': 'the review id'},
            },
        responses = {
            200: 'Success, review found',
            404: 'Fail, review not found',
        },
    )
    def get(self, review_id):
        result = get_review(method='review_id', value=review_id)
        if len(result) == 0:
            return {'message': 'review not found'}, 404
        else:
            return result, 200


@api.route('/review/rating', methods=['POST'])
class rating_review(Resource):

    @api.doc(
        'rate a review',
        responses = {
            200: 'Success, review rated',
            400: 'Fail, invalid method',
        },
    )
    @api.expect(review_rating_model, validate=True)
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))

        if payload['u_id'] is None or payload['r_id'] is None:
            return {'message': 'uid and review_id are both required'}, 400
        elif payload['method'] not in [0,1] or payload['method'] is None:
            return {'message': 'method is required and must be 1 for like, or 0 for dislike'}, 400
        else:
            # check if user exists
            if not db.session.query(exists().where(User.u_id == payload['u_id'])).scalar():
                return {'message': 'user not found'}, 404
            else:
                # check if already rated
                rate = db.session.query(Review_Like).filter(Review_Like.u_id == payload['u_id'] and Review_Like.r_id == payload['r_id']).first()
                if rate is None:
                    db.session.add(Review_Like(
                        u_id = payload['u_id'],
                        r_id = payload['r_id'],
                        is_liked = payload['method']
                    ))
                    db.session.commit()
                    return {'message': 'review rated received'}, 200
                elif rate.is_liked == payload['method']:
                    db.session.query(Review_Like).\
                                filter(Review_Like.u_id == payload['u_id'] and Review_Like.r_id == payload['r_id'] and Review_Like.is_liked == payload['method']).\
                                delete()
                    db.session.commit()
                    return {'message': 'review rated canceled'}, 200
                else:
                    return {'message': 'review already rated'}, 400


# ################################################################################
# #                                 HELPING FUNCS                                #
# ################################################################################



def get_review(method = 'u_id', value = None):

    count_like = db.session.query(Review_Like.r_id, func.count(Review_Like.r_id).filter(Review_Like.is_liked==1).label('like_count')).group_by(Review_Like.r_id).subquery()
    count_dislike = db.session.query(Review_Like.r_id, func.count(Review_Like.r_id).filter(Review_Like.is_liked==0).label('dislike_count')).group_by(Review_Like.r_id).subquery()

    # print(count_like)
    # print(count_dislike)

    # print(db.session.query(Review, count_like.c.like_count).outerjoin(count_like, Review.r_id == count_like.c.r_id).all())
    reviews = None

    if method == 'u_id':
        reviews = db.session.query(Review).filter(Review.u_id == value).subquery()
        reviews = db.session.query(reviews, count_like.c.like_count, count_dislike.c.dislike_count).\
                            outerjoin(count_like, reviews.c.r_id == count_like.c.r_id).\
                            outerjoin(count_dislike, reviews.c.r_id == count_dislike.c.r_id).\
                            all()
    elif method == 'f_id':
        reviews = db.session.query(Review).filter(Review.f_id == value).subquery()
        reviews = db.session.query(reviews, count_like.c.like_count, count_dislike.c.dislike_count).\
                            outerjoin(count_like, reviews.c.r_id == count_like.c.r_id).\
                            outerjoin(count_dislike, reviews.c.r_id == count_dislike.c.r_id).\
                            all()
    elif method == 'u_f_id':
        reviews = db.session.query(Review).filter(Review.u_id == value[0], Review.f_id == value[1]).subquery()
        reviews = db.session.query(reviews, count_like.c.like_count, count_dislike.c.dislike_count).\
                            outerjoin(count_like, reviews.c.r_id == count_like.c.r_id).\
                            outerjoin(count_dislike, reviews.c.r_id == count_dislike.c.r_id).\
                            all()
    elif method == 'top':
        reviews = db.session.query(Review).subquery()
        reviews = db.session.query(reviews, count_like.c.like_count, count_dislike.c.dislike_count).\
                            outerjoin(count_like, reviews.c.r_id == count_like.c.r_id).\
                            outerjoin(count_dislike, reviews.c.r_id == count_dislike.c.r_id).\
                            order_by(count_like.c.like_count.desc()).\
                            limit(value).\
                            all()
    elif method == 'recent':
        reviews = db.session.query(Review).filter(Review.created_time > datetime.now() - timedelta(weeks=value*4)).subquery()
        reviews = db.session.query(reviews, count_like.c.like_count, count_dislike.c.dislike_count).\
                            outerjoin(count_like, reviews.c.r_id == count_like.c.r_id).\
                            outerjoin(count_dislike, reviews.c.r_id == count_dislike.c.r_id).\
                            order_by(reviews.c.created_time.desc()).\
                            all()
    elif method == 'recent_top':
        reviews = db.session.query(Review).filter(Review.created_time > datetime.now() - timedelta(weeks=value[0]*4)).subquery()
        reviews = db.session.query(reviews, count_like.c.like_count, count_dislike.c.dislike_count).\
                            outerjoin(count_like, reviews.c.r_id == count_like.c.r_id).\
                            outerjoin(count_dislike, reviews.c.r_id == count_dislike.c.r_id).\
                            order_by(count_like.c.like_count.desc()).\
                            limit(value[1]).\
                            all()
    elif method == 'review_id':
        reviews = db.session.query(Review).filter(Review.r_id == value).subquery()
        reviews = db.session.query(reviews, count_like.c.like_count, count_dislike.c.dislike_count).\
                            outerjoin(count_like, reviews.c.r_id == count_like.c.r_id).\
                            outerjoin(count_dislike, reviews.c.r_id == count_dislike.c.r_id).\
                            all()

    if reviews is None:
        return False


    result = []
    
    for i in reviews:
        review = {}
        review['r_id'] = i[0]
        review['u_id'] = i[1]
        review['f_id'] = i[2]
        review['content'] = i[3]
        review['rating'] = i[4]
        review['created_time'] = str(i[5])
        review['like'] = i[6] if i[6] is not None else 0
        review['dislike'] = i[7] if i[7] is not None else 0
        result.append(review)

    return result
