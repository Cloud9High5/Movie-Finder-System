import json
from urllib import response
from winreg import DisableReflectionKey
from flask import request
from flask_restx import Resource, Namespace, fields, marshal, reqparse
from flask_jwt_extended import jwt_required, current_user
import jwt
from sqlalchemy import exists, func
from extensions import db
from Models.model import Review, User, Film, Review_Like, Review_Dislike, bad_word
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
    "rating": fields.Float(required=True, description="Rating"),
    "content": fields.String(required=False, description="Review Content"),
})

review_edit_model = api.model('Review Edit', {
    "r_id": fields.String(required=True, description="Review ID"),
    "rating": fields.Float(required=True, description="Rating"),
    "content": fields.String(required=False, description="Review Content"),
})


review_rating_model = api.model('review_rating_model', {
    'method': fields.Integer(required=True, description="Method, 0: dislike, 1: like"),
    'r_id': fields.String(required=True, description="Review ID"),
})


################################################################################
#                                    ROUTES                                    #
################################################################################



@api.route('/review', methods=['GET', 'POST', 'PUT', 'DELETE'])
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
    @jwt_required(optional=True)
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
                result = Review.query.filter(Review.created_time > datetime.now() - timedelta(weeks=args['recent']*4)).order_by(Review.created_time.desc()).all()
        elif args['method'] == 'recent_top':
            if args['recent'] is None or args['top'] is None:
                return {'message': 'recent and top are both required'}, 400
            else:
                reviews = Review.query.filter(Review.created_time > (datetime.now() - timedelta(weeks=args['recent']*4))).all()
                result_list = [(x, len(x.likes.all())) for x in reviews]
                result_list.sort(key=lambda x: x[1], reverse=True)
                result = [x[0] for x in result_list[:args['top']]]
        
        if current_user:
            blocked_id = [x.u_id for x in current_user.blocked.all()]
            result = [x for x in result if x.u_id not in blocked_id]
        
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
    @jwt_required()
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))

        if payload['f_id'] is None or payload['rating'] is None:
            return {'message': 'f_id and rating are all required'}, 400
        
        # check if user already posted a review for this film
        if Review.query.filter_by(u_id=current_user.u_id, f_id=payload['f_id']).first() is not None:
            return {'message': 'you have already posted a review for this film'}, 400
        
        # check if target film is in current user's wish list
        film = Film.query.filter_by(f_id=payload['f_id']).first()
        if film in current_user.wish.all():
            current_user.wish.remove(film)
            db.session.commit()
        
        # bad word check
        bad_words = db.session.query(bad_word.c.word).all()
        bad_words = [x[0] for x in bad_words]
        
        bad_word_flag = False
        
        for word in payload['content'].split():
            if word in bad_words:
                bad_word_flag = True

        # post review
        db.session.add(Review(
            u_id = current_user.u_id,
            f_id = payload['f_id'],
            content = payload['content'],
            rating = payload['rating'],
            bad_word = bad_word_flag,
        ))
        db.session.commit()
        
        # modify rating_doubi
        film = Film.query.filter_by(f_id=payload['f_id']).first()
        film.rating_doubi = film.rating
        db.session.commit()
        
        return {'message': '{} post a review for {}'.format(
            current_user.username, 
            db.session.query(Film.title).filter(Film.f_id == payload['f_id']).first()[0])}, 200
    
    ########################################
    #              Edit Review             #
    ########################################
    @api.doc(
        'edit a review',
        responses = {
            200: 'Success, review edited',
            400: 'Fail, invalid review',
            404: 'Fail, user not found'
        },
    )
    @api.expect(review_edit_model, validate=True)
    @jwt_required()
    def put(self):
        payload = json.loads(str(request.data, 'utf-8'))

        if payload['r_id'] is None or payload['rating'] is None:
            return {'message': 'r_id and rating are all required'}, 400

        target_review = Review.query.filter_by(r_id=payload['r_id']).first()
        if target_review is None:
            return {'message': 'review not found'}, 404
        
        if target_review.u_id != current_user.u_id:
            return {'message': 'you are not the owner of this review'}, 400
        
        target_review.content = payload['content']
        target_review.rating = payload['rating']
        
        db.session.commit()
        return {'message': '{} edit a review'.format(current_user.username)}, 200
        
    
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
    @jwt_required()
    def delete(self):
        args = review_delete_arguments.parse_args()
        if args['r_id'] is None:
            return {'message': 'r_id is required'}, 400
        else:
            review = Review.query.filter_by(r_id=args['r_id']).one_or_none()
            if review is None:
                return {'message': 'review not found'}, 404
            else:
                if review.u_id == current_user.u_id or current_user.admin:
                    db.session.delete(review)
                    db.session.commit()
                    return {'message': 'review deleted'}, 200
                else:
                    return {'message': 'you are not the author of this review'}, 400


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
    @jwt_required()
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))

        if payload['r_id'] is None:
            return {'message': 'review_id is required'}, 400
        elif payload['method'] not in [0,1] or payload['method'] is None:
            return {'message': 'method is required and must be 1 for like, or 0 for dislike'}, 400
        else:
            like = Review_Like.query.filter_by(u_id=current_user.u_id, r_id=payload['r_id']).first()
            dislike = Review_Dislike.query.filter_by(u_id=current_user.u_id, r_id=payload['r_id']).first()
            if payload['method'] == 1:
                if dislike is not None:
                    return {'message': 'you already disliked this review'}, 400

                if like is None:
                    db.session.add(Review_Like(
                        u_id = current_user.u_id,
                        r_id = payload['r_id'],
                    ))
                    db.session.commit()
                    return {'message': 'review liked'}, 200
                else:
                    # if user already liked the review, remove
                    db.session.query(Review_Like).filter(Review_Like.u_id == current_user.u_id, Review_Like.r_id == payload['r_id']).delete()
                    db.session.commit()
                    return {'message': 'review unliked'}, 200
            elif payload['method'] == 0:
                if like is not None:
                    return {'message': 'you already liked this review'}, 400
                    
                if dislike is None:
                    db.session.add(Review_Dislike(
                        u_id = current_user.u_id,
                        r_id = payload['r_id'],
                    ))
                    db.session.commit()
                    return {'message': 'review disliked'}, 200
                else:
                    # if user already disliked the review, remove
                    db.session.query(Review_Dislike).filter(Review_Dislike.u_id == current_user.u_id, Review_Dislike.r_id == payload['r_id']).delete()
                    db.session.commit()
                    return {'message': 'review undisliked'}, 200
        
                    
@api.route('/review/likes_dislikes', methods=['GET'])
class like_list(Resource):

    ########################################
    #            like record               #
    ########################################
    @api.doc(
        description = "return a list of r_id which current user liked and disliked",
        responses={
            200: 'Success, list of liked and disliked reviews'
        }
    )
    @jwt_required()
    def get(self):
        likes = current_user.review_likes.all()
        dislikes = current_user.review_dislikes.all()
        return {'likes': [like.r_id for like in likes], 'dislikes': [dislike.r_id for dislike in dislikes]}, 200
    

@api.route('/review/bad_word', methods=['GET'])
class bad_word_review(Resource):
    
    ########################################
    #    get all reviews with bad word     #
    ########################################    
    @api.doc(
        description = "return a list of reviews with bad word",
        responses={
            200: 'Success'
        }
    )
    @api.marshal_list_with(review_model)
    @jwt_required()
    def get(self):
        if current_user.is_admin:
            result = db.session.query(Review).filter(Review.bad_word==True).order_by(Review.created_time.desc()).all()
            return result, 200
        else:
            return {"message": "you are not admin"}, 400