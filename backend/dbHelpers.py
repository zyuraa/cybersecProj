from dotenv import load_dotenv
from pymysql import connect
from datetime import datetime, timedelta
import secrets
import os

# executes sql function
def execute(query, parameters=None):
    connection = connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    cursor = connection.cursor()

    try:
        cursor.execute(query, parameters)

        # return rows if SELECT
        if query.strip().upper().startswith("SELECT"):
            return cursor.fetchall()

        # else commit changes and return row count
        connection.commit()
        return cursor.rowcount

    finally:
        connection.close()

def find_user_id(email, password):
    results = execute(f"SELECT id, is_admin FROM users WHERE (email = '{email}') AND password = '{password}'")
    return results[0] if (results) else False

def add_user(username, email, password):
    results = execute(f"SELECT id, is_admin FROM users WHERE (username = '{username}' OR email = '{email}')")
    if results:
        return False

    execute(f"INSERT INTO users (username, password, email) VALUES ('{username}', '{password}', '{email}')")

    results = execute("SELECT id, is_admin FROM users WHERE id = LAST_INSERT_ID(id) ORDER BY id DESC LIMIT 1")
    return results[0] if (results) else None

def gen_session(id):
    token = secrets.token_hex(32)
    results = execute(f"INSERT INTO sessions (user_id, token) VALUES ({id}, '{token}')")
    return token

def get_user_info(user_id):
    results = execute(f"SELECT username, email, bio FROM users WHERE (id = '{user_id}')")
    return results[0] if (results) else False

def get_user_id_from_token(token):
    results = execute(f"SELECT user_id FROM sessions WHERE (token = '{token}')")
    return results[0] if (results) else False