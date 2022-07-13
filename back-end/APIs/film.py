from flask_restx import Resource, Namespace, fields, reqparse
from sqlalchemy import exists
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

top_rating_arguments = reqparse.RequestParser()
top_rating_arguments.add_argument('number')

top_recent_arguments = reqparse.RequestParser()
top_recent_arguments.add_argument('number')

################################################################################
#                                    ROUTES                                    #
################################################################################



@api.route('/films', methods=['GET'])
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
        result = db.session.query(Film).filter(Film.year >= (datetime.now().year - number)).order_by(Film.year.desc()).all()
        return result, 200
