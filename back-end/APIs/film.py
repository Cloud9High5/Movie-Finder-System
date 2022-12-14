import json
from flask import request
from flask_jwt_extended import current_user, jwt_required
from flask_restx import Resource, Namespace, fields, reqparse
from sqlalchemy import exists, func
from extensions import db
from Models.model import Film
from .helper import film_based_recommendation, user_based_recommendation

api = Namespace("film", description="Authentication related operations", path="/")

################################################################################
#                                  FILM MODEL                                  #
################################################################################


film_arguments = reqparse.RequestParser()
film_arguments.add_argument('f_id')

film_model = api.model('film', {
    "f_id": fields.String(required=True, description="Film id"),
    "title": fields.String(required=True, description="Film title"),
    "year": fields.Integer(required=True, description="Film released year"),
    "run_time": fields.String(required=True, description="Film run time"),
    "rating": fields.Float(required=True, description="Film rating"),
    "rating_distribution": fields.Raw(required=True, description="Film rating distribution"),
    "rating_imdb": fields.Float(required=True, description="Film rating on IMDB"),
    "overview": fields.String(required=True, description="Film overview"),
    "director": fields.String(required=True, description="Film director"),
    "url_poster": fields.String(required=True, description="Film poster url"),
    "genres": fields.List(fields.String, required=True, description="Film genres"),
    "actors": fields.List(fields.String, required=True, description="Film actors"),
})

film_create_model = api.model('film', {
    "title": fields.String(required=True, description="Film title"),
    "year": fields.Integer(required=True, description="Film released year"),
    "run_time": fields.String(required=True, description="Film run time"),
    "rating_imdb": fields.Float(required=True, description="Film rating on IMDB"),
    "overview": fields.String(required=True, description="Film overview"),
    "director": fields.String(required=True, description="Film director"),
    "url_poster": fields.String(required=True, description="Film poster url"),
    "genres": fields.List(fields.String, required=True, description="Film genres"),
    "actors": fields.List(fields.String, required=True, description="Film actors"),
})

top_rating_arguments = reqparse.RequestParser()
top_rating_arguments.add_argument('number')

top_recent_arguments = reqparse.RequestParser()
top_recent_arguments.add_argument('number')

search_arguments = reqparse.RequestParser()
search_arguments.add_argument('method', type=str, default='title')
search_arguments.add_argument('value', type=str, default='')
search_arguments.add_argument('order', type=str, default='year')

################################################################################
#                                    ROUTES                                    #
################################################################################


@api.route('/films', methods=['GET', 'POST'])
class film(Resource):

    @api.doc(
        'Get film by ID',
        responses={
            200: 'Success, film found',
            404: 'Fail, film not found'
        }
    )
    @api.marshal_with(film_model, code=200)
    @api.expect(film_arguments)
    @jwt_required(optional=True)
    def get(self):
        args = film_arguments.parse_args()
        if db.session.query(exists().where(Film.f_id == args['f_id'])).scalar():
            result = Film.query.filter_by(f_id=args['f_id']).first()

            reviews = result.reviews.all()
            # compute average rating for review on DOUBI
            if current_user:
                blocked_id = [x.u_id for x in current_user.blocked.all()]
                reviews = [x for x in reviews if x.u_id not in blocked_id]
                result = {
                    "f_id": result.f_id,
                    "title": result.title,
                    "year": result.year,
                    "run_time": result.run_time,
                    "rating": result.rating_customized(current_user),
                    "rating_distribution": result.rating_distribution_customized(current_user),
                    "rating_imdb": result.rating_imdb,
                    "overview": result.overview,
                    "director": result.director,
                    "url_poster": result.url_poster,
                    "genres": result.genres,
                    "actors": result.actors,
                }

            return result, 200
        else:
            return {'message': 'Film not found'}, 404

    @api.expect(film_create_model, validate=True)
    @jwt_required()
    def post(self):

        # check if current user is admin
        if current_user.is_admin:
            payload = json.loads(str(request.data, 'utf-8'))  # turn request body into python dictionary
            title = payload["title"]
            year = payload["year"]
            director = payload["director"]
            # check if film already exists
            film = Film.query.filter(Film.title == title, Film.year == year, Film.director == director).first()
            if film is not None:
                return {'message': 'Film already exists'}, 409
            else:
                db.session.add(Film(title=title, 
                                    genre=', '.join(payload["genres"]),
                                    year=year, 
                                    run_time=payload['run_time'],
                                    rating_imdb=payload['rating_imdb'],
                                    rating_doubi=0.0,
                                    overview=payload['overview'], 
                                    director=director,
                                    actor=', '.join(payload['actors']),
                                    url_poster=payload['url_poster']))
                db.session.commit()
                return {
                           'message': 'Film created',
                           'f_id': Film.query.filter(Film.title == title, Film.year == year,
                                                     Film.director == director).first().f_id
                       }, 201
        else:
            return {'message': 'Film can only be created by admin'}


@api.route('/films/random', methods=['GET'])
class random(Resource):

    @api.doc(
        'Get random 10 films',
        responses={
            200: 'Success, film found',
        }
    )
    @api.marshal_list_with(film_model, code=200)
    def get(self):
        result = db.session.query(Film).order_by(func.random()).limit(10).all()
        return result, 200


@api.route('/films/top/<int:number>', methods=['GET'])
class top_rating(Resource):

    @api.doc(
        "Get top <number> films with the highest IMDB rate",
        params={
            "number": "Number of films to return"
        },
        responses={
            200: 'Success, films found',
        }
    )
    @api.marshal_list_with(film_model, code=200)
    def get(self, number):
        result = db.session.query(Film).order_by(Film.rating_doubi.desc()).limit(number).all()
        return result, 200


@api.route('/films/recent/<int:number>', methods=['GET'])
class top_recent(Resource):

    @api.doc(
        "Get films in the recent <number> years",
        params={
            "number": "Number of films to return"
        },
        responses={
            200: 'Success, films found',
        }
    )
    @api.marshal_list_with(film_model, code=200)
    def get(self, number):
        result = db.session.query(Film).order_by(Film.year.desc()).limit(number).all()
        return result, 200

@api.route('/films/search', methods=['GET'])
class search(Resource):

    ########################################
    #             Search Film              #
    ########################################
    @api.doc(
        'search films based on the given method',
        params={
            'method': {'type': 'str', 'required': False,
                       'description': 'the method to get reviews, either title, director'},
            'value': {'type': 'str', 'required': False, 'description': 'the query to search for'},
            'order': {'type': 'str', 'required': False, 'description': 'the order to sort the results'}
        },
        responses={
            200: 'Success, films found',
            400: 'Fail, invalid method',
            404: 'Fail, films not found',
        },
    )
    @api.expect(search_arguments, validate=True)
    @api.marshal_list_with(film_model, code=200)
    @jwt_required(optional=True)
    def get(self):
        result = []
        args = search_arguments.parse_args()
        if args['method'] == 'title':
            if args['value'] is None:
                return {'message': 'title is required'}, 400
            else:
                result = Film.query.filter(Film.title.like('%' + args['value'] + '%')).all()
        elif args['method'] == 'director':
            if args['value'] is None:
                return {'message': 'director is required'}, 400
            else:
                values = args['value'].split(',')
                for i, value in enumerate(values):
                    if i == 0:
                        result = Film.query.filter(Film.director.like('%' + value + '%'))
                    else:
                        result = result.filter(Film.director.like('%' + value + '%'))
                result = result.all()
        elif args['method'] == 'genre':
            if args['value'] is None:
                return {'message': 'genre is required'}, 400
            else:
                values = args['value'].split(',')
                for i, value in enumerate(values):
                    if i == 0:
                        result = Film.query.filter(Film.genre.like('%' + value + '%'))
                    else:
                        result = result.filter(Film.genre.like('%' + value + '%'))
                result = result.all()
        elif args['method'] == 'actor':
            if args['value'] is None:
                return {'message': 'actor is required'}, 400
            else:
                values = args['value'].split(',')
                for i, value in enumerate(values):
                    if i == 0:
                        result = Film.query.filter(Film.actor.like('%' + value + '%'))
                    else:
                        result = result.filter(Film.actor.like('%' + value + '%'))
                result = result.all()
        
        if len(result) == 0:
            return {'message': 'film not found'}, 404
        
        
        if args['order'] == 'year':
            result = sorted(result, key=lambda x: x.year, reverse=True)
        elif args['order'] == 'rating_imdb':
            result = sorted(result, key=lambda x: x.rating_imdb, reverse=True)
        elif args['order'] == 'rating_doubi':
            result = sorted(result, key=lambda x: x.rating, reverse=True)
        
        return result, 200


@api.route('/films/<string:f_id>/recommend/film', methods=['GET'])
class film_based_recommend(Resource):

    @api.doc(
        'Get 5 recommendations for a film based on film similarity',
        responses={
            200: 'Success',
            404: 'Fail, films not found',
        },
    )
    @api.marshal_list_with(film_model, code=200)
    def get(self, f_id):
        result = []
        # check if film exists
        if Film.query.filter(Film.f_id == f_id).first() is not None:
            f_id_list = film_based_recommendation(f_id)
            for f_id in f_id_list:
                result.append(Film.query.filter(Film.f_id == f_id).first())
                
        if result is None:
            return {'message': 'film not found'}, 404
        else:
            return result, 200


@api.route('/films/recommend/user', methods=['GET'])
class user_based_recommend(Resource):

    @api.doc(
        'Get 5 recommendations for a film based on user similarity',
        responses={
            200: 'Success',
            404: 'Fail, films not found',
        },
    )
    @api.marshal_list_with(film_model, code=200)
    @jwt_required()
    def get(self):
        result = []
        recommend = user_based_recommendation(current_user.u_id)
        if recommend is None or len(recommend) == 0:
            return {'message': 'film not found, more reviews needed'}, 404
        else:
            for film in recommend:
                result.append(Film.query.filter(Film.f_id == film[1]).first())
            return result, 200
