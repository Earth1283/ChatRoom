const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error("Database connection error", err.message);
    } else {
        console.log('Connected to the users database.');
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                username TEXT UNIQUE,
                password TEXT
            );
        `, (err) => {
            if (err) {
                console.error("Users table creation error", err.message);
            } else {
                console.log('Users table checked or created.');
            }
        });
        db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                message TEXT,
                timestamp INTEGER
            );
        `, (err) => {
            if (err) {
                console.error("Messages table creation error", err.message);
            } else {
                console.log('Messages table checked or created.');
            }
        });
    }
});

const saltRounds = 10;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }
}));

function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

app.get('/', isLoggedIn, (req, res) => {
    res.redirect('/chatroom');
});

app.get('/chatroom', isLoggedIn, (req, res) => {
    res.sendFile(__dirname + '/public/chatroom.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            if (err.errno === 19 && err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).send('Username already taken');
            } else {
                console.error("Registration error", err.message);
                return res.status(500).send('Registration failed');
            }
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT password FROM users WHERE username = ?`, [username], async (err, row) => {
        if (err) {
            console.error("Login query error", err.message);
            return res.status(500).send('Login failed');
        }
        if (row) {
            const passwordMatch = await bcrypt.compare(password, row.password);
            if (passwordMatch) {
                req.session.userId = username;
                return res.redirect('/chatroom');
            }
        }
        res.status(401).send('Login failed');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/login');
    });
});

app.get('/get-username', isLoggedIn, (req, res) => {
    res.json({ username: req.session.userId });
});

app.get('/load-messages', isLoggedIn, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const messagesPerPage = 50;
    const offset = (page - 1) * messagesPerPage;

    db.all(`
        SELECT username, message, timestamp
        FROM messages
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
    `, [messagesPerPage, offset], (err, rows) => {
        if (err) {
            console.error("Message loading error", err.message);
            return res.status(500).json({ error: 'Could not load messages' });
        }
        res.json({ messages: rows.reverse() }); // Reverse to get oldest first for display
    });
});


io.on('connection', (socket) => {
    let username;

    socket.on('set-username', (name) => {
        username = name;
        io.emit('user-join', `${username} joined the chat`);
    });

    socket.on('chat message', (msg) => {
        const timestamp = Date.now();
        db.run(`
            INSERT INTO messages (username, message, timestamp)
            VALUES (?, ?, ?)
        `, [username, msg, timestamp], (dbErr) => {
            if (dbErr) {
                console.error("Message saving error", dbErr.message);
                // Consider error handling for message saving failures
            }
            io.emit('chat message', { username: username, message: msg, timestamp: timestamp });
        });
    });

    socket.on('typing', (isTyping) => {
        socket.broadcast.emit('typing-update', { username: username, isTyping: isTyping });
    });

    socket.on('disconnect', () => {
        if(username) {
            io.emit('user-leave', `${username} left the chat`);
        }
    });
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});