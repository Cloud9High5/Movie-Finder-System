from flask_restx import Resource, Namespace, fields, reqparse

api = Namespace("film", description="Authentication related operations", path="/")


###############################################################################
#                                  Film                                       #
###############################################################################

film_arguments = reqparse.RequestParser()
film_arguments.add_argument('id')

@api.route('/films', methods=['GET'])
class film(Resource):
    @api.expect(film_arguments)
    def get(self):
        args = film_arguments.parse_args()
        if check_film_exist(args['id']):
            film1 = find_film(args['id'])
            response = {
                'movie_id': film1[0],
                'title': film1[1],
                'year': film1[2],
                'run_time': film1[3],
                'rating': film1[4],
                'overview': film1[5],
                'director': film1[6],
                'poster': film1[7]
            }
            return response, 200
        else:
            return {'message': 'Film not found'}, 404


# return the highest rated N movies
top_rating_arguments = reqparse.RequestParser()
top_rating_arguments.add_argument('number')

@api.route('/films/top/<int:number>', methods=['GET'])
class top_rating(Resource):
    # @api.expect(top_rating_arguments)
    def get(self, number):
        args = top_rating_arguments.parse_args()
        # film1 = show_top_rating_film(int(args['number']))
        film1 = show_top_rating_film(int(number))
        result = []
        for row in film1:
            response = {
                    'movie_id': row[0],
                    'title': row[1],
                    'year': row[2],
                    'run_time': row[3],
                    'rating': row[4],
                    'overview': row[5],
                    'director': row[6],
                    'poster': row[7]
                    }
            result.append(response)
        return result, 200

# return the latest released N movies
top_recent_arguments = reqparse.RequestParser()
top_recent_arguments.add_argument('number')

@api.route('/films/recent/<int:number>', methods=['GET'])
class top_recent(Resource):
    # @api.expect(top_recent_arguments)
    def get(self, number):
        args = top_recent_arguments.parse_args()
        # film1 = show_top_recent_film(int(args['number']))
        film1 = show_top_recent_film(int(number))
        result = []
        for row in film1:
            response = {
                    'movie_id': row[0],
                    'title': row[1],
                    'year': row[2],
                    'run_time': row[3],
                    'rating': row[4],
                    'overview': row[5],
                    'director': row[6],
                    'poster': row[7]
                    }
            result.append(response)
        return result, 200


###############################################################################
#                         helping funcs                                       #
###############################################################################

from fileinput import filename
import sqlite3
import os

filename = 'Film_1.db'
path = os.getcwd() + '/back-end/db/' + filename


# create db file and film table
def init_film_db():
    # create a new database for film if it doesn't exist
    conn = sqlite3.connect(path)
    c = conn.cursor()

    # create a table for user if it doesn't exist
    c.execute("""CREATE TABLE IF NOT EXISTS FILM_INFORMATION (
        FILM_ID INTEGER PRIMARY KEY NOT NULL,
        TITLE TEXT NOT NULL,
        YEAR TEXT NOT NULL,
        RUN_TIME TEXT NOT NULL,
        RATING TEXT NOT NULL,
        OVERVIEW TEXT NOT NULL,
        DIRECTOR TEXT NOT NULL,
        POSTER TEXT NOT NULL)
        """)
    conn.commit()
    conn.close()


# check if film exists
def check_film_exist(id):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    c.execute("SELECT * FROM FILM_INFORMATION WHERE FILM_ID = '%s'" % id)
    film = c.fetchone()
    conn.close()

    if film is None:
        return False
    else:
        return True


# Find the corresponding film information by ID
def find_film(id):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    c.execute("SELECT * FROM FILM_INFORMATION WHERE FILM_ID = '%s'" % id)
    film = c.fetchone()
    conn.close()

    return film


def show_top_rating_film(number):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    film = c.execute("select * from FILM_INFORMATION order by rating desc limit '%d'" % number)

    return film


def show_top_recent_film(number):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    film = c.execute("select * from FILM_INFORMATION order by year desc limit '%d'" % number)

    return film


# insert a new film
def insert_film(film):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    c.execute("""INSERT INTO FILM_INFORMATION (
        FILM_ID,TITLE,YEAR,RUN_TIME,RATING,OVERVIEW,DIRECTOR,POSTER) VALUES (
        '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s')""" % (
        film['FILM_ID'],
        film['TITLE'],
        film['YEAR'],
        film['RUN_TIME'],
        film['RATING'],
        film['OVERVIEW'],
        film['DIRECTOR'],
        film['POSTER']
    ))

    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_film_db()





