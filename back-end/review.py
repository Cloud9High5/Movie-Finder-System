import sqlite3
import os

filename = 'reviews.db'
path = os.path.join(os.path.dirname(__file__), 'db', filename)

print(path)
