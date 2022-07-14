import json
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
    "email": fields.String(required=True, description="User's email"),
    "password": fields.String(required=True, description="User's password"),
})


user_model = api.model('user', {
    "u_id": fields.String(required=True, description="User's u_id"),
    "username": fields.String(required=True, description="User's username"),
    "email": fields.String(required=True, description="User's email"),
    "photo_url": fields.String(required=True, description="User's photo_url"),
})

user_profile_model = api.model('user', {
    "username": fields.String(required=False, description="User's username"),
    "password": fields.String(required=False, description="User's password"),
    "email": fields.String(required=False, description="User's email"),
    "photo_url": fields.String(required=False, description="User's photo_url"),
})

modify_list_argument = reqparse.RequestParser()
modify_list_argument.add_argument('u_id', type=str, required=True)


################################################################################
#                                    ROUTES                                    #
################################################################################



@api.route('/auth/signup', methods=['GET', 'POST'])
class signup(Resource):

    @api.doc(
        description="Sign up a new user",
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
        description = 'Login to the system',
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



@api.route('/auth/user/<string:u_id>', methods=['GET', 'PUT'])
class user_info(Resource):

    @api.doc(
        description = 'Get User Info by u_id',
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

    @api.doc(
        description = 'Modify User Info by u_id',
        responses = {
            200: 'Success, user info modified',
            401: 'Fail, user not found'
        }
    )
    @api.expect(user_profile_model, validate=True)
    def put(self, u_id):
        payload = json.loads(str(request.data, 'utf-8'))
        user = db.session.query(User).filter(User.u_id == u_id).first()
        if user:
            if 'username' in payload:
                user.username = payload['username']
            if 'password' in payload:
                user.password = payload['password']
            if 'email' in payload:
                user.email = payload['email']
            if 'photo_url' in payload:
                user.photo_url = payload['photo_url']
            db.session.commit()
            return {
                'message': 'User info modified'
            }, 200
        else:
            return {
                'message': 'User not found'
            }, 401

@api.route('/auth/user/<string:u_id>/following_list', methods=['GET','POST'])
class following_list(Resource):

    @api.doc(
        description = 'Get User Following List by u_id',
        params={'u_id': 'User ID'},
        responses = {
            200: 'Success, following list returned',
            401: 'Fail, Empty list',
        }
    )
    @api.marshal_list_with(user_model, code=200)
    def get(self, u_id):
        users = db.session.query(User.following_list).filter(User.u_id == u_id).first()[0]
        result = db.session.query(User).filter(User.u_id.in_(str_to_list(users))).all()
        if result:
            return result, 200
        else:
            return {
                'message': 'User not found'
            }, 401

    @api.doc(
        description = 'Add User to Following List, remove if already in list',
        params = {
            'u_id': 'User ID'
        },
        responses = {
            200: 'Success, user added to following list',
            401: 'Fail, user not found',
            403: 'Fail, user already in following list',
        }
    )
    @api.expect(modify_list_argument, validate=True)
    def post(self, u_id):
        follow_id = modify_list_argument.parse_args()['follow_id']
        user = db.session.query(User).filter(User.u_id == u_id).first()
        following_list = str_to_list(user.following_list)
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
                following_list.remove(follow_id)

                if len(following_list) == 0:
                    db.session.query(User).filter(User.u_id == u_id).update({'following_list': None})
                else:
                    db.session.query(User).filter(User.u_id == u_id).update({'following_list': list_to_str(following_list)})
                db.session.commit()
                return {
                    'message': 'User removed from following list'
                }, 403
        else:
            return {
                'message': 'User not found'
            }, 401

@api.route('/auth/user/<string:u_id>/black_list', methods=['GET','POST'])
class black_list(Resource):

    @api.doc(
        description = "Get User's Black List",
        params={'u_id': 'User ID'},
        responses = {
            200: 'Success, black list returned',
            401: 'Fail, Empty list',
        }
    )
    @api.marshal_list_with(user_model, code=200)
    def get(self, u_id):
        users = db.session.query(User.black_list).filter(User.u_id == u_id).first()[0]
        result = db.session.query(User).filter(User.u_id.in_(str_to_list(users))).all()
        if result:
            return result, 200
        else:
            return {
                'message': 'User not found'
            }, 401

    @api.doc(
        description = 'Add User to black List, remove if already in list',
        params = {
            'u_id': 'User ID'
        },
        responses = {
            200: 'Success, user added to black list',
            401: 'Fail, user not found',
            403: 'Fail, user already in black list',
        }
    )
    @api.expect(modify_list_argument, validate=True)
    def post(self, u_id):
        black_id = modify_list_argument.parse_args()['u_id']
        user = db.session.query(User).filter(User.u_id == u_id).first()
        black_list = str_to_list(user.black_list)
        if user and db.session.query(exists().where(User.u_id == black_id)).scalar():
            if black_id == user.u_id:
                return {
                    'message': 'Cannot put yourself into black list'
                }, 403
                
            if black_id not in black_list:
                # add user to black list
                if user.black_list:
                    user.black_list += black_id
                else:
                    user.black_list = black_id
                db.session.query(User).filter(User.u_id == u_id).update({'black_list': user.black_list})
                db.session.commit()
                return {
                    'message': 'User added to black list'
                }, 200
            else:
                # remove user from black list
                black_list.remove(black_id)
                if len(black_list) == 0:
                    db.session.query(User).filter(User.u_id == u_id).update({'black_list': None})
                else:
                    db.session.query(User).filter(User.u_id == u_id).update({'black_list': list_to_str(black_list)})
                db.session.commit()
                return {
                    'message': 'User removed from black list'
                }, 403
        else:
            return {
                'message': 'User not found'
            }, 401

################################################################################
#                                 HELPING FUNCS                                #
################################################################################

def list_to_str(following_list):
    following_list_string = ''
    for i in following_list:
        following_list_string += i
    if following_list_string == '':
        following_list_string = None
    return following_list_string


def str_to_list(following_list_string):
    if following_list_string:
        return [following_list_string[i:i+32] for i in range(0, len(following_list_string), 32)]
    else:
        return []
