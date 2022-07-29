from email import message
import json
from re import U
from flask import request, jsonify
from flask_restx import Resource, Namespace, fields, reqparse
from flask_mail import Message
from flask_jwt_extended import create_access_token, jwt_required, current_user
from sqlalchemy import exists
from extensions import db, mail, jwt
from Models.model import User

api = Namespace("auth", description="Authentication related operations", path="/")


################################################################################
#                             AUTHENTICATION MODEL                             #
################################################################################


signup_arguments = reqparse.RequestParser()
signup_arguments.add_argument('email', type=str, required=True)
signup_arguments.add_argument('verification_code', type=int, required=True)

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
    "is_admin": fields.Boolean(required=True, description="whether the user is admin"),
    "is_blocked": fields.Boolean(required=True, description="whether the user is blocked by admin"),
    "is_self": fields.Boolean(required=True, description="whether the user is the current user"),
    "followed": fields.Boolean(required=False, description="whether the user is followed by current user"),
    "blocked": fields.Boolean(required=False, description="whether the user is blocked by current user"),
})

user_profile_model = api.model('user', {
    "username": fields.String(required=False, description="User's username"),
    "old_password": fields.String(required=False, description="User's old password"),
    "new_password": fields.String(required=False, description="User's new password"),
    "email": fields.String(required=False, description="User's email"),
    "photo_url": fields.String(required=False, description="User's photo_url"),
})

resetpwd_arguments = reqparse.RequestParser()
resetpwd_arguments.add_argument('email', type=str, required=True, help='Email is required')
resetpwd_arguments.add_argument('verification_code', type=int, required=True)

resetpwd_model = api.model('resetpwd', {
    "email": fields.String(required=True, description="User's email"),
    "password": fields.String(required=True, description="User's password"),
})


################################################################################
#                                    ROUTES                                    #
################################################################################


          ############################################################
          #                      SignUp & Login                      #
          ############################################################


@api.route('/auth/signup', methods=['GET', 'POST'])
class signup(Resource):

    ########################################
    #        send verification email       #
    ########################################
    @api.doc(
        description="Send a verification email to check if the email is valid",
        responses={
            200: 'Success, email sent',
            400: 'Fail, email not sent'
        }
    )
    @api.expect(signup_arguments)
    def get(self):
        args = signup_arguments.parse_args()
        
        # check if the email is valid (not in the database)
        if db.session.query(exists().where(User.email == args['email'])).scalar():
            # email already exists, not valid
            return {'message': 'Email already exists'}, 400
        else:
            # email not in the database, valid
            msg = Message(
                subject = "Verification email", 
                sender = "doubimovie@163.com",
                recipients = [args['email']],
                body = 
                """
                Hello,

                This is a verification email to Sign up on DOUBI.
                Your verification code is: 

                {}
                
                Please enter this code in the Sign up page.
                if you did not request a password reset, please ignore this email.
                """.format(args['verification_code'])
            )
            mail.send(msg)
            return {'message': 'Email sent'}, 200

    ########################################
    #             Sign up user             #
    ########################################
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



@api.route('/auth/resetpwd', methods=['GET', 'POST'])
class resetpwd(Resource):

    ########################################
    #       send reset password email      #
    ########################################
    @api.doc(
        description="Get user email and send a reset password verification email",
        responses = {
            200: 'Success, email sent',
            404: 'Fail, user not found'
        }
    )
    @api.expect(resetpwd_arguments, validate=True)
    def get(self):
        args = resetpwd_arguments.parse_args()

        # check if user exists
        if db.session.query(exists().where(User.email == args['email'])).scalar():
            msg = Message(
                subject='DOUBI Password Reset',
                sender='doubimovie@163.com',
                recipients=[args['email']],
                body=
                """
                Hello,

                This is a verification email to reset your password on DOUBI.
                Your verification code is: 

                {}
                
                Please enter this code in the reset password page.
                if you did not request a password reset, please ignore this email.
                """.format(args['verification_code'])
            )
            mail.send(msg)
            return {'message': 'Email sent'}, 200
        else:
            return {'message': 'User not found'}, 404

    ########################################
    #            reset password            #
    ########################################    
    @api.doc(
        description="Reset user password",
        responses = {
            200: 'Success, password reset',
            404: 'Fail, user not found'
        }
    )
    @api.expect(resetpwd_model, validate=True)
    def post(self):
        payload = json.loads(str(request.data, 'utf-8'))
        email = payload['email']
        password = payload['password']

        # check if user exists
        if db.session.query(exists().where(User.email == email)).scalar():
            user = User.query.filter_by(email=email).first()
            user.password = password
            db.session.commit()
            return {'message': 'Password reset'}, 200
        else:
            return {'message': 'User not found'}, 404




@api.route('/auth/login', methods=['GET', 'POST'])
class login(Resource):

    ########################################
    #                 Login                #
    ########################################
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
            if user.verify_password(password):
                access_token = create_access_token(identity=user)
                return {
                    'message': 'Logged in as {}'.format(user.username),
                    'access_token': access_token,
                    'u_id': user.u_id
                    }, 200
            else:
                return {'message': 'Wrong password'}, 403
        else:
            return {'message': 'User not found'}, 401


          ############################################################
          #                       User Profile                       #
          ############################################################

@api.route('/auth/user/<string:u_id>', methods=['GET', 'PUT'])
class user_info(Resource):

    ########################################
    #             Get user info            #
    ########################################
    @api.doc(
        description = 'Get User Info by u_id',
        params={'u_id': 'User ID'},
        responses = {
            200: 'Success, user info returned',
            401: 'Fail, user not found'
        }
    )
    @api.marshal_with(user_model, code=200)
    @jwt_required(optional=True)
    def get(self, u_id):
        target_user = User.query.filter_by(u_id=u_id).first()

        if not target_user:
            # could not find user in database, return fail message
            return {'message': 'User not found'}, 401
        else:
            # user found, collect basic info
            result = {
                'u_id': target_user.u_id,
                'email': target_user.email,
                'username': target_user.username,
                'photo_url': target_user.url_photo,
                'is_admin': target_user.is_admin,
                'is_blocked': target_user.is_blocked,
                'is_self': False
            }
            
            if not current_user:
                # access from unauthorized user, return basic info
                return result, 200
            else:
                # access from authorized user
                if u_id == current_user.u_id:
                    # access his/her own profile, return basic info
                    result['is_self'] = True
                    return result, 200
                else:
                    # access other user's profile, return more info
                    result['followed'] = True if target_user in current_user.followed else False
                    result['blocked'] = True if target_user in current_user.blocked else False
                    return result, 200


    ########################################
    #            Update User Info          #
    ########################################
    @api.doc(
        description = 'Modify User Info by u_id',
        responses = {
            200: 'Success, user info modified',
            401: 'Fail, user not found',
            403: 'Fail, wrong password'
        }
    )
    @api.expect(user_profile_model, validate=True)
    @jwt_required()
    def put(self, u_id):
        payload = json.loads(str(request.data, 'utf-8'))
        user = User.query.filter_by(u_id=u_id).first()
        if user == current_user:
            if 'username' in payload:
                user.username = payload['username']
            if 'new_password' in payload:
                # check if old password is correct
                if user.password == payload['old_password']:
                    user.password = payload['new_password']
                else:
                    return {
                        'message': 'Wrong password'
                    }, 403
            if 'email' in payload:
                user.email = payload['email']
            if 'photo_url' in payload:
                user.url_photo = payload['photo_url']
            db.session.commit()
            return {
                'message': '{} User info modified'.format(user.username)
            }, 200
        else:
            return {
                'message': 'User not found'
            }, 401

@api.route('/auth/user/<string:u_id>/following_list', methods=['GET','POST'])
class following_list(Resource):

    ########################################
    #            Get following list        #
    ########################################
    @api.doc(
        description = 'Get User Following List by u_id',
        params={'u_id': 'User ID'},
        responses = {
            200: 'Success, following list returned',
            401: 'Fail, Empty list',
        }
    )
    # @api.marshal_list_with(user_model, code=200)
    def get(self, u_id):
        target_user = db.session.query(User).filter(User.u_id == u_id).first()
        if target_user:
            users = target_user.followed.all()
            if users != []:
                return [{
                    'u_id': user.u_id,
                    'email': user.email,
                    'username': user.username,
                    'photo_url': user.url_photo,
                    'is_admin': user.is_admin,
                    'is_blocked': user.is_blocked
                    } for user in users], 200
            else:
                return [], 200
        else:
            return {
                'message': 'User not found'
            }, 401


    ########################################
    #      Add & Remove following list     #
    ########################################
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
    @jwt_required()
    def post(self, u_id):
        target_user = User.query.filter_by(u_id=u_id).first()

        if current_user == target_user:
            return {
                'message': 'Cannot follow yourself'
            }, 403

        if target_user and current_user:
            if target_user in current_user.followed.all():
                current_user.followed.remove(target_user)
                db.session.commit()
                return {
                    'message': "{} is removed from {}'s following list".format(target_user.username, current_user.username)
                }, 200
            else:
                current_user.followed.append(target_user)
                db.session.commit()
                return {
                    'message': "{} is added to {}'s following list".format(target_user.username, current_user.username)
                }, 200
        else:
            return {
                'message': 'User not found'
            }, 401


@api.route('/auth/user/<string:u_id>/black_list', methods=['GET','POST'])
class black_list(Resource):

    ########################################
    #            Get black list            #
    ########################################
    @api.doc(
        description = "Get User's Black List",
        params={'u_id': 'User ID'},
        responses = {
            200: 'Success, black list returned',
            401: 'Fail, Empty list',
        }
    )
    # @api.marshal_list_with(user_model, code=200)
    def get(self, u_id):
        target_user = User.query.filter_by(u_id=u_id).first()
        if target_user:
            result = target_user.blocked.all()
            result = [{
                'u_id': user.u_id,
                'email': user.email,
                'username': user.username,
                'photo_url': user.url_photo,
                'is_admin': user.is_admin,
                'is_blocked': user.is_blocked
            } for user in result]
            if result != []:
                return result, 200
            else:
                return [], 200

    ########################################
    #       Add & Remove black list        #
    ########################################
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
    @jwt_required()
    def post(self, u_id):
        target_user = User.query.filter_by(u_id=u_id).first()

        if target_user == current_user:
            return {
                'message': 'Cannot black yourself'
            }, 403

        if target_user and current_user:
            if target_user in current_user.blocked.all():
                current_user.blocked.remove(target_user)
                db.session.commit()
                return {
                    'message': "{} is removed from {}'s black list".format(target_user.username, current_user.username)
                }, 200
            else:
                current_user.blocked.append(target_user)
                db.session.commit()
                return {
                    'message': "{} is added to {}'s black list".format(target_user.username, current_user.username)
                }, 200
        else:
            return {
                'message': 'User not found'
            }, 401
