from flask import Flask, request, jsonify, make_response

from flask_cors import CORS
from dotenv import load_dotenv
import os

from pymysql import connect
import secrets
import traceback


load_dotenv()

app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173"]
)

# Routes

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "No Fields"}), 400

    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not username:
        return jsonify({"error": "No Username"}), 400

    try:
        db_res = add_user(username, email, password);
        if db_res:
            user_id = db_res[0]
            token = gen_session(user_id)

            res = make_response(jsonify({"message": "success"}))
            
            res.set_cookie(
                "token",
                token,

                # Deliberately vulnerable????
                httponly=False,
                secure=False,
                samesite="Lax"
            )

            return res
        else:
            return jsonify({"error": "Email taken"}), 400
    except Exception as e:
        print(e)
        return jsonify({"error": "Bad request"}), 400

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Bad request"}), 400
    
    email = data.get("email")
    password = data.get("password")

    try:
        db_res = find_user_id(email, password);
        if db_res:
            user_id = db_res[0]
            token = gen_session(user_id)

            res = make_response(jsonify({"message": "success"}))

            res.set_cookie(
                "token",
                token,

                # Deliberately vulnerable????
                httponly=False,
                secure=False,
                samesite="Lax"
            )

            return res
        else:
            return jsonify({"error": "Invalid Credentials"}), 401
    except Exception as e:
        print(e)
        return jsonify({"error": "Bad request"}), 400

@app.route("/")
def root():
    return "???"

@app.route("/home", methods=["GET"])
def home():
    token = request.cookies.get("token")
    try:
        user_id = get_user_id_from_token(token);

        if user_id:
            user_info = get_user_info(user_id[0]);
            return jsonify({
                "user_id": user_info[0],
                "username": user_info[1],
                "email": user_info[2],
                "bio": user_info[3],
                "is_admin": user_info[4]
            })
        else:
            return jsonify({"error": "Unauthorised"}), 401
    except Exception as e:
        print(e)
        return jsonify({"error": "Bad request"}), 400
    

@app.route("/home/bio", methods=["POST"])
def update_bio():
    token = request.cookies.get("token")

    db_res = get_user_id_from_token(token)
    if not db_res:
        return jsonify({"error": "Unauthorised"}), 401

    data = request.get_json()
    try:
        execute(
            """
            UPDATE users
            SET bio=%s
            WHERE id=%s
            """,
            (data.get("bio"), db_res[0])
        )
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": "Bad request"}), 400

@app.route("/logout", methods=["delete"])
def logout():
    token = request.cookies.get("token")
    try:
        execute(
            """
            DELETE FROM sessions
            WHERE token=%s
            """,
            (token)
        )
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": "Bad request"}), 400

@app.route("/users", methods=["GET"])
def get_users():
    # token = request.cookies.get("token")

    # db_res = get_user_id_from_token(token)
    # if not db_res:
    #     return jsonify({"error": "Unauthorised"}), 401
    
    users = execute("""
        SELECT id, username, bio
        FROM users
        ORDER BY username
    """)

    return jsonify([
        {
            "user_id": row[0],
            "username": row[1],
            "bio": row[2] or ""
        }
        for row in users
    ])

@app.route("/user/lookup", methods=["POST"])
def lookup():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Bad request"}), 400

    try:
        # oops I forgot to change the implementation from integer to string
        user_id = data.get("username")
        next_user = user_id + 1

        users = execute("""
            SELECT username, bio
            FROM users
            WHERE (user_id = '%d')
            ORDER BY username
        """, user_id)

        return jsonify([
            {
                "username": row[0],
                "bio": row[1] or ""
            }
            for row in users
        ])

    except Exception as e:
        error_trace = traceback.format_exc()
        
        return jsonify({
            "error": error_trace,
        }), 500

@app.route("/admin/delete/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        delete_user_from_id(user_id);
        return jsonify({"success": True})
    except Exception as e:
        print(f"ERROR ON DELETE: {str(e)}")
        return jsonify({"error": "No such user"}), 400


### DB ###

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
    results = execute(f"SELECT id, username, email, bio, is_admin FROM users WHERE (id = '{user_id}')")
    return results[0] if (results) else False

def get_user_id_from_token(token):
    results = execute(f"SELECT user_id FROM sessions WHERE (token = '{token}')")
    return results[0] if (results) else False

def delete_user_from_id(user_id):
    results = execute("DELETE FROM users WHERE (id = %s)", (user_id, ))
    return results if (results) else False

if __name__ == "__main__":
    app.run(port=8000, debug=True)

