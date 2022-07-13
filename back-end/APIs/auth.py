import json
from logging import NullHandler
from flask import request
from flask_restx import Resource, Namespace, fields, reqparse
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


user_model = api.model('user', {
    "u_id": fields.String,
    "username": fields.String,
    "email": fields.String,
    "photo_url": fields.String
})

modify_follow_argument = reqparse.RequestParser()
modify_follow_argument.add_argument('follow_id', type=str, required=True)


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
    @api.marshal_with(user_model, code=200)
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


@api.route('/auth/user/<string:u_id>/following_list', methods=['GET','POST'])
class following_list(Resource):

    @api.doc(
        'Get User Following List',
        params={'u_id': 'User ID'},
        responses = {
            200: 'Success, following list returned',
            401: 'Fail, Empty list',
        }
    )
    @api.marshal_list_with(user_model, code=200)
    def get(self, u_id):
        users = db.session.query(User.following_list).filter(User.u_id == u_id).first()[0]
        result = db.session.query(User).filter(User.u_id.in_(str_to_following_list(users))).all()
        if result:
            return result, 200
        else:
            return {
                'message': 'User not found'
            }, 401

    @api.doc(
        'Add User to and remove user from Following List',
        params = {
            'u_id': 'User ID'
        },
        responses = {
            200: 'Success, user added to following list',
            401: 'Fail, user not found',
            403: 'Fail, user already in following list',
        }
    )
    @api.expect(modify_follow_argument, validate=True)
    def post(self, u_id):
        follow_id = modify_follow_argument.parse_args()['follow_id']
        user = db.session.query(User).filter(User.u_id == u_id).first()
        following_list = str_to_following_list(user.following_list)
        if user and db.session.query(exists().where(User.u_id == follow_id)).scalar():
            if follow_id == user.u_id:
                return {
                    'message': 'Cannot follow yourself'
                }, 403

            if follow_id not in following_list:
                # add user to following list
                if user.following_list:
                    user.following_list += follow_id
                else:
                    user.following_list = follow_id
                db.session.query(User).filter(User.u_id == u_id).update({'following_list': user.following_list})
                db.session.commit()
                return {
                    'message': 'User added to following list'
                }, 200
            else:
                # remove user from following list
                print(following_list)
                following_list.remove(follow_id)
                print(following_list)

                if len(following_list) == 0:
                    db.session.query(User).filter(User.u_id == u_id).update({'following_list': None})
                else:
                    db.session.query(User).filter(User.u_id == u_id).update({'following_list': following_list_to_str(following_list)})
                db.session.commit()
                return {
                    'message': 'User removed from following list'
                }, 403
        else:
            return {
                'message': 'User not found'
            }, 401



################################################################################
#                                 HELPING FUNCS                                #
################################################################################

def following_list_to_str(following_list):
    following_list_string = ''
    for i in following_list:
        following_list_string += i
    if following_list_string == '':
        following_list_string = None
    return following_list_string


def str_to_following_list(following_list_string):
    if following_list_string:
        return [following_list_string[i:i+32] for i in range(0, len(following_list_string), 32)]
    else:
        return []