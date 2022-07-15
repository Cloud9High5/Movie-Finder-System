import json
from flask import request
from flask_restx import Resource, Namespace, fields, reqparse
from sqlalchemy import exists, func
from extensions import db
from Models.model import Film
from datetime import datetime

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
    "rating_imdb": fields.Float(required=True, description="Film rating on IMDB"),
    "overview": fields.String(required=True, description="Film overview"),
    "director": fields.String(required=True, description="Film director"),
    "url_poster": fields.String(required=True, description="Film poster url"),
})

film_create_model = api.model('film', {
    "title": fields.String(required=True, description="Film title"),
    "year": fields.Integer(required=True, description="Film released year"),
    "run_time": fields.String(required=True, description="Film run time"),
    "rating_imdb": fields.Float(required=True, description="Film rating on IMDB"),
    "overview": fields.String(required=True, description="Film overview"),
    "director": fields.String(required=True, description="Film director"),
    "url_poster": fields.String(required=True, description="Film poster url"),
})

top_rating_arguments = reqparse.RequestParser()
top_rating_arguments.add_argument('number')

top_recent_arguments = reqparse.RequestParser()
top_recent_arguments.add_argument('number')

################################################################################
#                                    ROUTES                                    #
################################################################################



@api.route('/films', methods=['GET', 'POST'])
class film(Resource):

    @api.doc(
        'Get film by ID',
        responses = {
            200: 'Success, film found',
            404: 'Fail, film not found'
        }
    )
    @api.marshal_with(film_model, code=200)
    @api.expect(film_arguments)
    def get(self):
        args = film_arguments.parse_args()
        if db.session.query(exists().where(Film.f_id == args['f_id'])).scalar():
            film = Film.query.filter_by(f_id=args['f_id']).first()
            return film, 200
        else:
            return {'message': 'Film not found'}, 404

    @api.expect(film_create_model, validate=True)
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))  # turn request body into python dictionary
        title = payload["title"]
        year = payload["year"]
        director = payload["director"]
        # check if film already exists
        # FIXME: exists checking works for any one of three fields, but not for all
        film = Film.query.filter(Film.title == title, Film.year == year, Film.director == director).first()
        if film is not None:
            return {'message': 'Film already exists'}, 409
        else:
            db.session.add(Film(title=title, year=year, run_time=payload['run_time'],
                                rating_imdb=payload['rating_imdb'], overview=payload['overview'], director=director,
                                url_poster=payload['url_poster']))
            db.session.commit()
            return {'message': 'Film created'}, 201


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
        params = {
            "number": "Number of films to return"
        },
        responses = {
            200: 'Success, films found',
        }
    )
    @api.marshal_list_with(film_model, code=200)
    def get(self, number):
        result = db.session.query(Film).order_by(Film.rating_imdb.desc()).limit(number).all()
        return result, 200



@api.route('/films/recent/<int:number>', methods=['GET'])
class top_recent(Resource):

    @api.doc(
        "Get films in the recent <number> years",
        params = {
            "number": "Number of films to return"
        },
        responses = {
            200: 'Success, films found',
        }
    )
    @api.marshal_list_with(film_model, code=200)
    def get(self, number):
        result = db.session.query(Film).order_by(Film.year.desc()).limit(number).all()
        return result, 200
