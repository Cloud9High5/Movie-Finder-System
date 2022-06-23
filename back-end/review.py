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




# def insert_review(review):
#     conn = sqlite3.connect(path)
#     c = conn.cursor()
#     c.execute("""INSERT INTO reviews (
#         review, rating, uid, title, movie_id) VALUES (
