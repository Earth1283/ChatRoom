const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const socketIo = require('socket.io');
const http = require('http');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const csvParser = require('csv-parser');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize SQLite DB
const db = new sqlite3.Database('./chatroom.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database connected');
    // Create table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT)`);
  }
});

// Middleware for serving static files and parsing cookies
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Simple authentication middleware
const checkLogin = (req, res, next) => {
  const username = req.cookies.username;
  if (!username) {
    return res.redirect('/login');
  }
  req.username = username;
  next();
};

// Route to serve login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Route to handle login form submission
app.post('/login', (req, res) => {
  const { username, password, rememberMe } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err || !row) {
      return res.status(401).send('Invalid username or password');
    }
    // Compare hashed passwords
    bcrypt.compare(password, row.password, (err, result) => {
      if (result) {
        // Set remember-me cookie if selected
        if (rememberMe) {
          res.cookie('username', username, { maxAge: 86400000 }); // 24 hours
        }
        res.redirect('/');
      } else {
        res.status(401).send('Invalid username or password');
      }
    });
  });
});

// Route for registration
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
    if (err) {
      return res.status(500).send('Error registering user');
    }
    res.redirect('/login');
  });
});

// Chatroom page (Only accessible if logged in)
app.get('/', checkLogin, (req, res) => {
  res.sendFile(__dirname + '/public/chatroom.html');
});

// WebSocket for real-time chat and typing indicator
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send last 20 messages from the CSV to the new user
  fs.createReadStream('messages.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      socket.emit('newMessage', row);
    })
    .on('end', () => {
      console.log('Finished sending previous messages');
    });

  socket.on('sendMessage', (message, username) => {
    // Write the new message to the CSV file
    const writer = csvWriter({
      path: 'messages.csv',
      header: [
        { id: 'username', title: 'username' },
        { id: 'message', title: 'message' },
      ],
      append: true,
    });

    writer.writeRecords([{ username, message }])
      .then(() => console.log('Message written to CSV'))
      .catch((err) => console.error('Error writing message to CSV:', err));

    // Broadcast the message to all connected clients
    io.emit('newMessage', { message, username });
  });

  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
