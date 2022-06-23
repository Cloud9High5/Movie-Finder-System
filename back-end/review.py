import re
import sqlite3
import os
from webbrowser import get
import pandas as pd

filename = 'reviews.db'
path = os.path.join(os.path.dirname(__file__), 'db', filename)


def init_review_db():
    '''
    Initialize the database for reviews and create table if it doesn't exist

    Args:
        None
    
    Returns:
        None
    '''

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
    '''
    insert a review into db

    Args:
        review: dict, the review to insert
        {
            'review': str, the review text,
            'rating': float, the rating of the movie,
            'uid': int, the user id,
            'movie_id': int, the movie id,
        }
    
    Returns:
        None

    '''
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
    '''
    fetch reviews from db based on method and value

    Args:
        method: str, the method to fetch reviews by. 
        {
            'uid': fetch reviews by user id,
            'movie_id': fetch reviews by movie id,
            'both': fetch reviews by both user id and movie id,
            'popular': fetch top N reviews by like count,
        }
    
        value: int, the value of the method, for specific
        {
            'uid': user id,
            'movie_id': movie id,
            'both': user id and movie id tuple,
            'popular': Top N reviews
        }
    
    Returns:
        reviews: list, the reviews fetched from db
    '''
    conn = sqlite3.connect(path)
    c = conn.cursor()

    if method == 'uid':
        c.execute("""SELECT * FROM reviews WHERE uid = %d""" % (value,))
    elif method == 'movie_id':
        c.execute("""SELECT * FROM reviews WHERE movie_id = %d""" % (value,))
    elif method == 'both':
        c.execute("""SELECT * FROM reviews WHERE uid = %d AND movie_id = %d""" % (value[0], value[1]))
    elif method == 'popular':
        c.execute("""SELECT * FROM reviews ORDER BY like DESC LIMIT 10""")

    reviews = c.fetchall()
    if reviews is None:
        return False

    review = {}
    result = []
    
    
    conn.close()

    for i in reviews:
        review['review_id'] = i[0]
        review['review'] = i[1]
        review['rating'] = i[2]
        review['uid'] = i[3]
        review['movie_id'] = i[4]
        review['like'] = i[5]
        review['dislike'] = i[6]
        result.append(review)

    return result





if __name__ == "__main__":
    # r = get_reviews('both', (1,338))
    r = get_reviews('popular', 10)
    print(len(r))