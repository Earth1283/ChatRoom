from flask import Flask, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO, emit
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

# Initialize Flask app, socket, and login manager
app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
socketio = SocketIO(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"

# SQLite Database setup
DATABASE = 'chatroom.db'

# Create a database if it doesn't exist
def init_db():
    if not os.path.exists(DATABASE):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)''')
        cursor.execute('''CREATE TABLE messages (id INTEGER PRIMARY KEY, username TEXT, message TEXT)''')
        conn.commit()
        conn.close()

init_db()

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

# Route to Home (Chatroom)
@app.route('/')
@login_required
def chatroom():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT username, message FROM messages ORDER BY id DESC')
    messages = cursor.fetchall()
    conn.close()
    return render_template('chatroom.html', messages=messages)

# Route to Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user[2], password):
            user_obj = User(user[0])
            login_user(user_obj, remember=request.form.get('remember'))
            return redirect(url_for('chatroom'))
        else:
            return 'Invalid Credentials', 401
    
    return render_template('login.html')

# Route to Register (New User)
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Hash password before storing it
        hashed_password = generate_password_hash(password)

        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_password))
        conn.commit()
        conn.close()

        return redirect(url_for('login'))
    
    return render_template('register.html')

# Route to Logout
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# SocketIO event to handle chat messages
@socketio.on('message')
def handle_message(msg):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO messages (username, message) VALUES (?, ?)', (current_user.id, msg))
    conn.commit()
    conn.close()
    emit('new_message', {'username': current_user.id, 'message': msg}, broadcast=True)

# SocketIO event for typing indicator
@socketio.on('typing')
def handle_typing(username):
    emit('typing', {'username': username}, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=8080)
