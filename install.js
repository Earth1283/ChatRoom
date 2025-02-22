const https = require('https');
const fs = require('fs');
const path = require('path');

// Function to download a file
function downloadFile(url, destination) {
  https.get(url, (response) => {
    if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(destination);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${destination}`);
      });
    } else {
      console.error(`Failed to download ${url}: ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${url}: ${err.message}`);
  });
}

// URLs of the files to download
const files = [
  { url: 'https://raw.githubusercontent.com/Earth1283/ChatRoom/main/README.md', destination: 'Readme.md' },
  { url: 'https://raw.githubusercontent.com/Earth1283/ChatRoom/main/index.js', destination: 'index.js' },
  { url: 'https://raw.githubusercontent.com/Earth1283/ChatRoom/main/chatroom.html', destination: 'public/chatroom.html' },
  { url: 'https://raw.githubusercontent.com/Earth1283/ChatRoom/main/login.html', destination: 'public/login.html' },
  { url: 'https://raw.githubusercontent.com/Earth1283/ChatRoom/main/register.html', destination: 'public/register.html' },
  { url: 'https://raw.githubusercontent.com/Earth1283/ChatRoom/main/style.css', destination: 'public/style.css' }
];

// Create the 'public' directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Download each file
files.forEach(file => {
  downloadFile(file.url, file.destination);
});

// After all downloads are complete
console.log('Thanks for downloading <3');
console.log('Remember to run `npm install express sqlite3 socket.io cookie-parser bcryptjs` to install the npm dependencies');
console.log('Additional information is within README.md');
