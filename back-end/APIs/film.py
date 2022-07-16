import json
from flask import request
from flask_jwt_extended import current_user, jwt_required
from flask_restx import Resource, Namespace, fields, reqparse
from sqlalchemy import exists, func
from extensions import db
from Models.model import Film, Review

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
    @jwt_required(optional=True)
    def get(self):
        args = film_arguments.parse_args()
        if db.session.query(exists().where(Film.f_id == args['f_id'])).scalar():
            film = Film.query.filter_by(f_id=args['f_id']).first()

            reviews = film.reviews.all()
            # compute average rating for review on DOUBI
            if current_user:
                blocked_id = [x.u_id for x in current_user.blocked.all()]
                reviews = [x for x in reviews if x.u_id not in blocked_id]

            rate = 0 if reviews == [] else format(sum(review.rating for review in reviews) / len(reviews), '.1f')
            film = film.__dict__
            film['rating'] = rate

            return film, 200
        else:
            return {'message': 'Film not found'}, 404

    @api.expect(film_create_model, validate=True)
    @jwt_required()
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))  # turn request body into python dictionary
        title = payload["title"]
        year = payload["year"]
        director = payload["director"]
        # check if film already exists
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
