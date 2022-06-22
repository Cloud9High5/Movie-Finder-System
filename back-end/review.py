import sqlite3
import os
import pandas as pd

filename = 'reviews.db'
path = os.path.join(os.path.dirname(__file__), 'db', filename)

# def insert_review(review):
#     conn = sqlite3.connect(path)
#     c = conn.cursor()
#     c.execute("""INSERT INTO reviews (
#         review, rating, uid, title, movie_id) VALUES (
