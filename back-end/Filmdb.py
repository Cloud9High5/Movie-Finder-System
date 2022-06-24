import sqlite3

filename = 'db/Film_1.db'


# create db file and film table
def init_film_db():
    # create a new database for film if it doesn't exist
    conn = sqlite3.connect(filename)
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
    conn = sqlite3.connect(filename)
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
    conn = sqlite3.connect(filename)
    c = conn.cursor()

    c.execute("SELECT * FROM FILM_INFORMATION WHERE FILM_ID = '%s'" % id)
    film = c.fetchone()
    conn.close()

    return film


# insert a new film
def insert_film(film):
    conn = sqlite3.connect(filename)
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





