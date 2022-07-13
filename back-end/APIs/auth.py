import json
from flask import request
from flask_restx import Resource, Namespace, fields
from sqlalchemy import exists
from extensions import db
from Models.model import User

api = Namespace("auth", description="Authentication related operations", path="/")

################################################################################
#                             AUTHENTICATION MODEL                             #
################################################################################



signup_model = api.model('users', {
    "email": fields.String(required=True, description="User's email"),
    "username": fields.String(required=True, description="User's username"),
    "password": fields.String(required=True, description="User's password"),
})


login_model = api.model('login', {
    "email": fields.String,
    "password": fields.String,
})



################################################################################
#                                    ROUTES                                    #
################################################################################



@api.route('/auth/signup', methods=['GET', 'POST'])
class signup(Resource):

    @api.doc(
        'Sign up',
        responses = {
            201: 'Success, user created',
            409: 'Fail, User already exists'
        }
    )
    @api.expect(signup_model, validate=True)
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))  # turn request body into python dictionary
        email = payload['email']
        # check if user already exists
        if db.session.query(exists().where(User.email == email)).scalar():
            return {'message': 'User already exists'}, 409
        else:
            db.session.add(User(email=email, username=payload['username'], password=payload['password']))
            db.session.commit()
            return {'message': 'User created'}, 201



@api.route('/auth/login', methods=['GET', 'POST'])
class login(Resource):

    @api.doc(
        'Login',
        responses = {
            200: 'Success, user logged in',
            401: 'Fail, user not found',
            403: 'Fail, wrong password'
        }
    )
    @api.expect(login_model, validate=True)
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))
        email = payload['email']
        password = payload['password']

        if db.session.query(exists().where(User.email == email)).scalar():
            user = db.session.query(User).filter(User.email == email).first()
            if user.password == password:
                return {
                    'message': 'login success',
                    'login_flag': 'True',
                    'u_id': user.u_id,
                    }, 200
            else:
                return {
                    'message': 'Wrong password',
                    'login_flag': 'False'
                    }, 403
        else:
            return {
                'message': 'User not found',
                'login_flag': 'False'
                }, 401



@api.route('/auth/user/<string:u_id>', methods=['GET'])
class user_info(Resource):
    @api.doc(
        'Get User Info',
        params={'u_id': 'User ID'},
        responses = {
            200: 'Success, user info returned',
            401: 'Fail, user not found'
        }
    )
    def get(self, u_id):
        user = db.session.query(User).filter(User.u_id == u_id).first()
        if user:
            return {
                'u_id': user.u_id,
                'username': user.username,
                'email': user.email,
                'photo_url': user.photo_url,
            }, 200
        else:
            return {
                'message': 'User not found'
            }, 401
