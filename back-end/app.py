from flask import Flask, request
from flask import send_file
from flask_restx import Resource, Api
from flask_restx import fields, reqparse

app = Flask(__name__)
api = Api(app)


sign_up_arguments = reqparse.RequestParser()
sign_up_arguments.add_argument('Email')
sign_up_arguments.add_argument('Password')

@api.route('/signup', methods=['PUT'])
class users(Resource):
    @api.expect(sign_up_arguments)
    def put(self):
        args = sign_up_arguments.parse_args()
        returnedMsg = {'message': 'hola'}
        return returnedMsg, 200

movie_arguments = reqparse.RequestParser()
movie_arguments.add_argument('title')

@api.route('/movies', methods=['GET'])
class movies(Resource):
    @api.expect(movie_arguments)
    def get(self):
        args = movie_arguments.parse_args()
        returnedMsg = {'message': 'hola'}
        return returnedMsg, 200


if __name__ == "__main__":
    app.run(debug=True)
