import re
import sqlite3
import os
import pandas as pd

filename = 'reviews.db'
path = os.path.join(os.path.dirname(__file__), 'db', filename)


def init_review_db():
    # create a new database for user if it doesn't exist
    conn = sqlite3.connect(path)
    c = conn.cursor()

    # create a table for user if it doesn't exist
    c.execute("""CREATE TABLE IF NOT EXISTS reviews (
        review_id INTEGER PRIMARY KEY AUTOINCREMENT,
        review TEXT,
        rating INTEGER NOT NULL,
        uid INTEGER NOT NULL,
        movie_id INTEGER NOT NULL,
        like INTEGER DEFAULT 0,
        dislike INTEGER DEFAULT 0)""")
    
    conn.commit()
    conn.close()


def insert_review(review):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    c.execute("""INSERT INTO reviews (
        review, rating, uid, movie_id)
    )""" % (
        review['review'],
        review['rating'],
        review['uid'],
        review['movie_id'],))

    conn.commit()
    conn.close()


def get_reviews(method = 'uid', value = None):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    if method == 'uid':
        c.execute("""SELECT * FROM reviews WHERE uid = %d""" % (value,))
    elif method == 'movie_id':
        c.execute("""SELECT * FROM reviews WHERE movie_id = %d""" % (value,))
    elif method == 'popular':
        c.execute("""SELECT * FROM reviews ORDER BY like DESC LIMIT 10""")

    reviews = c.fetchall()
    
    conn.close()
    return reviews




# def insert_review(review):
#     conn = sqlite3.connect(path)
#     c = conn.cursor()
#     c.execute("""INSERT INTO reviews (
#         review, rating, uid, title, movie_id) VALUES (
