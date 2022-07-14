import json
from winreg import DisableReflectionKey
from flask import request
from flask_restx import Resource, Namespace, fields, reqparse
from sqlalchemy import exists, func
from extensions import db
from Models.model import Review, User, Film, Review_Like, Review_Dislike
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

review_delete_arguments = reqparse.RequestParser()
review_delete_arguments.add_argument('u_id', type=str)
review_delete_arguments.add_argument('r_id', type=str)

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



@api.route('/review', methods=['GET', 'POST', 'DELETE'])
class reviews(Resource):

    ########################################
    #             Get Reviews              #
    ########################################
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
                # result = Review.query.filter_by(u_id=args['u_id']).all()
                result = User.query.filter_by(u_id=args['u_id']).first().reviews.all()
        elif args['method'] == 'f_id':
            if args['f_id'] is None:
                return {'message': 'f_id is required'}, 400
            else:
                # result = Review.query.filter_by(f_id=args['f_id']).all()
                result = Film.query.filter_by(f_id=args['f_id']).first().reviews.all()
        elif args['method'] == 'u_f_id':
            if args['u_id'] is None or args['f_id'] is None:
                return {'message': 'u_id and f_id are both required'}, 400
            else:
                result = Review.query.filter_by(u_id=args['u_id'], f_id=args['f_id']).all()
        elif args['method'] == 'top':
            if args['top'] is None:
                return {'message': 'top is required'}, 400
            else:
                result_list = [(x, len(x.likes.all())) for x in Review.query.all()]
                result_list.sort(key=lambda x: x[1], reverse=True)
                result = [x[0] for x in result_list[:args['top']]]
        elif args['method'] == 'recent':
            if args['recent'] is None:
                return {'message': 'recent is required'}, 400
            else:
                result = Review.query.filter_by(Review.created_time > datetime.now() - timedelta(weeks=args['recent']*4)).all()
        elif args['method'] == 'recent_top':
            if args['recent'] is None or args['top'] is None:
                return {'message': 'recent and top are both required'}, 400
            else:
                reviews = Review.query.filter_by(Review.created_time > datetime.now() - timedelta(weeks=args['recent']*4)).all()
                result_list = [(x, len(x.likes.all())) for x in reviews]
                result_list.sort(key=lambda x: x[1], reverse=True)
                result = [x[0] for x in result_list[:args['top']]]
        
        if len(result) == 0:
            return {'message': 'review not found'}, 404
        else:
            result = [{
                'r_id': x.r_id,
                'f_id': x.f_id,
                'u_id': x.u_id,
                'rating': x.rating,
                'content': x.content,
                'created_time': x.created_time,
                'like': len(x.likes.all()),
                'dislike': len(x.dislikes.all()),
            } for x in result]
            return result, 200
    
    ########################################
    #             Post Review              #
    ########################################
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
    
    ########################################
    #             Delete Review            #
    ########################################
    @api.doc(
        description = "delete a review",
        responses = {
            200: "Success, review deteled",
            404: "Fail, review not found",
        },
    )
    @api.expect(review_delete_arguments, validate=True)
    def delete(self):
        args = review_delete_arguments.parse_args()
        if args['r_id'] is None:
            return {'message': 'r_id is required'}, 400
        else:
            if not db.session.query(exists().where(Review.r_id == args['r_id'] and Review.u_id == args['u_id'])).scalar():
                return {'message': 'review not found'}, 404
            else:
                db.session.query(Review).filter(Review.r_id == args['r_id']).delete()
                db.session.commit()
                return {'message': 'review deleted'}, 200



@api.route('/review/<string:review_id>', methods=['GET'])
class get_review(Resource):

    ########################################
    #         Get Review by r_id           #
    ########################################
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
        result = Review.query.filter_by(r_id=review_id).first()
        if result is None:
            return {'message': 'review not found'}, 404
        else:
            return {
                'r_id': result.r_id,
                'f_id': result.f_id,
                'u_id': result.u_id,
                'rating': result.rating,
                'content': result.content,
                'created_time': result.created_time,
                'like': len(result.likes.all()),
                'dislike': len(result.dislikes.all()),
            }, 200


@api.route('/review/rating', methods=['POST'])
class rating_review(Resource):

    ########################################
    #       Like & Dislike Review          #
    ########################################
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
                like = Review_Like.query.filter_by(u_id=payload['u_id'], r_id=payload['r_id']).first()
                dislike = Review_Dislike.query.filter_by(u_id=payload['u_id'], r_id=payload['r_id']).first()
                if payload['method'] == 1:
                    if dislike is not None:
                        return {'message': 'you already disliked this review'}, 400

                    if like is None:
                        db.session.add(Review_Like(
                            u_id = payload['u_id'],
                            r_id = payload['r_id'],
                        ))
                        db.session.commit()
                        return {'message': 'review liked'}, 200
                    else:
                        # if user already liked the review, remove
                        db.session.query(Review_Like).filter(Review_Like.u_id == payload['u_id'], Review_Like.r_id == payload['r_id']).delete()
                        db.session.commit()
                        return {'message': 'review unliked'}, 200
                elif payload['method'] == 0:
                    if like is not None:
                        return {'message': 'you already liked this review'}, 400
                        
                    if dislike is None:
                        db.session.add(Review_Dislike(
                            u_id = payload['u_id'],
                            r_id = payload['r_id'],
                        ))
                        db.session.commit()
                        return {'message': 'review disliked'}, 200
                    else:
                        # if user already disliked the review, remove
                        db.session.query(Review_Dislike).filter(Review_Dislike.u_id == payload['u_id'], Review_Dislike.r_id == payload['r_id']).delete()
                        db.session.commit()
                        return {'message': 'review undisliked'}, 200
        
                    
