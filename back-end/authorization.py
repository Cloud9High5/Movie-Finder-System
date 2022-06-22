import sqlite3
import os

filename = 'users.db'
path = os.path.join(os.path.dirname(__file__), 'db', filename)

test_user_info = [
    {
        'username': 'turing',
        'password': 'turing123',
        'email': 'turing@doubi.com',
        'is_admin': 1,
        'is_blocked': 0,
    },
    {
        'username': 'spielberg',
        'password': 'spielberg123',
        'email': 'spielberg@doubi.com',
        'is_admin': 0,
        'is_blocked': 0,
    },
    {
        'username': 'andrew',
        'password': 'andrew123',
        'email': 'andrew@doubi.com',
        'is_admin': 0,
        'is_blocked': 0,
    },
    {
        'username': 'putin',
        'password': 'putin123',
        'email': 'putin@doubi.com',
        'is_admin': 0,
        'is_blocked': 0,
    },
    {
        'username': 'trump',
        'password': 'trump123',
        'email': 'trump@doubi.com',
        'is_admin': 0,
        'is_blocked': 1,
    },
]

# create db file and user table
def init_user_db():
    # create a new database for user if it doesn't exist
    conn = sqlite3.connect(path)
    c = conn.cursor()

    # create a table for user if it doesn't exist
    c.execute("""CREATE TABLE IF NOT EXISTS users (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT,
        email TEXT,
        is_admin INTEGER DEFAULT 0,
        is_blocked INTEGER DEFAULT 0)""")

    conn.commit()
    conn.close()


# check if user exists
def check_user_exist(email):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    c.execute("SELECT * FROM users WHERE username = '%s'" % email)
    user = c.fetchone()
    conn.close()

    if user is None:
        return False
    else:
        return True


# check if user is admin
def check_admin(username):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    c.execute("SELECT is_admin FROM users WHERE username = '%s'" % username)
    is_admin = c.fetchone()[0]
    conn.close()

    if is_admin == 1:
        return True
    else:
        return False


# check if user is blocked
def check_blocked(username):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    c.execute("SELECT is_blocked FROM users WHERE username = '%s'" % username)
    is_blocked = c.fetchone()[0]
    conn.close()

    if is_blocked == 1:
        return True
    else:
        return False


# insert a new user
def insert_user(user):
    conn = sqlite3.connect(path)
    c = conn.cursor()

    c.execute("""INSERT INTO users (
        username, password, email) VALUES (
        '%s', '%s', '%s')""" % (
        user['username'],
        user['password'],
        user['email'],))

    conn.commit()
    conn.close()

# insert test user info into db
def test_data():
    count = 0
    conn = sqlite3.connect(path)
    c = conn.cursor()

    for user in test_user_info:
        if not check_user_exist(user['username']):
            c.execute("""INSERT INTO users (
                username, password, email, is_admin, is_blocked) VALUES (
                '%s', '%s', '%s', %d, %d)""" % (
                user['username'],
                user['password'],
                user['email'],
                user['is_admin'],
                user['is_blocked'],))
            count += 1
    
    conn.commit()
    conn.close()
    print('insert %d test users' % count)


if __name__ == "__main__":
    init_user_db()
    test_data()