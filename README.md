# Real-time Chatroom Application

This project is a simple real-time chatroom application built with Node.js, Socket.IO, and SQLite for user authentication and message persistence. It features user registration and login, a live chat interface, dark mode, typing indicators, and message timestamps.

## Features

*   **User Authentication:** Secure user registration and login system to manage access to the chatroom.
*   **Real-time Chat:**  Instantaneous message delivery to all connected users using WebSockets.
*   **Message Persistence:** Chat messages are stored in an SQLite database (`users.db`) to preserve chat history across sessions.
*   **Message History:**  Loads and displays previous chat messages in chunks of 50 when users join the chatroom.
*   **Typing Indicator:**  Real-time typing indicators to show when other users are composing messages.
*   **Dark Mode:**  A user-toggleable dark mode for improved readability in low-light environments.
*   **Local Time Display:** Message timestamps are displayed on hover, showing the local time of each message.
*   **Emoji Dark Mode Toggle:**  The dark mode toggle is implemented as an emoji button fixed to the bottom left corner for easy access.

## Technologies Used

*   **Backend:**
    *   [Node.js](https://nodejs.org/) - JavaScript runtime environment
    *   [Express](https://expressjs.com/) - Web application framework for Node.js
    *   [Socket.IO](https://socket.io/) - Library for real-time, bidirectional communication
    *   [bcrypt](https://www.npmjs.com/package/bcrypt) - Password-hashing function
    *   [express-session](https://www.npmjs.com/package/express-session) - Middleware for creating session management
    *   [body-parser](https://www.npmjs.com/package/body-parser) - Middleware to handle request bodies
    *   [sqlite3](https://www.npmjs.com/package/sqlite3) - SQLite database client for Node.js

*   **Frontend:**
    *   HTML
    *   CSS
    *   JavaScript
    *   [Socket.IO Client](https://www.npmjs.com/package/socket.io-client)

## Setup Instructions

Follow these steps to get the chatroom application running on your local machine:

1.  **Prerequisites:**
    *   Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) (Node Package Manager) installed on your system.

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/Earth1283/ChatRoom # Replace [repository-url] with the actual repository URL
    cd [repository-folder]   # Replace [repository-folder] with the cloned repository folder name
    ```

3.  **Install Dependencies:**
    You do not have to follow this step if you cloned my repo with the git clone command (it comes "pre-packaged" with the dependencies)
    
    Navigate to the project directory in your terminal and run:
    ```bash
    npm install express socket.io bcrypt express-session body-parser sqlite3
    ```
    This command installs all the necessary Node.js modules listed in `package.json`.

5.  **Run the Server:**
    Start the Node.js server by running:
    ```bash
    node index.js
    ```
    The server will start at `http://localhost:8000`.

6.  **Access the Chatroom:**
    Open your web browser and go to [http://localhost:8000](http://localhost:8000).

## Usage Instructions

1.  **Homepage:**
    *   Upon accessing `http://localhost:8000`, you will be directed to the homepage.
    *   From the homepage, you can choose to either **login** if you already have an account or **register** if you are a new user.

2.  **Registration:**
    *   Click on the "register" link to go to the registration page (`/register`).
    *   Enter your desired username and password in the registration form.
    *   Click the "Register" button to create your account. You will be redirected to the login page upon successful registration.

3.  **Login:**
    *   Click on the "login" link on the homepage or navigate to `/login`.
    *   Enter your registered username and password in the login form.
    *   Click the "Login" button to log in. Upon successful login, you will be redirected to the chatroom (`/chatroom`).

4.  **Chatting in the Chatroom:**
    *   Once logged in, you will enter the chatroom interface.
    *   Type your message in the input field at the bottom.
    *   Press the "Send" button or hit Enter to send your message to all connected users.
    *   You will see messages from other users appear in real-time.
    *   A typing indicator will appear when other users are typing messages.
    *   Hover over a message to see the local time it was sent, displayed in light grey on the right side of the message.
    *   Previous messages (in chunks of 50) are loaded when you first enter the chatroom.

5.  **Dark Mode Toggle:**
    *   Click on the emoji button (🌙 or ☀️) located in the bottom left corner of the screen to toggle between light and dark mode.
    *   Your dark mode preference is saved in your browser's local storage and will be remembered across sessions.

6.  **Logout:**
    *   To logout, click the "Logout" button located in the header of the chatroom.
    *   You will be redirected back to the login page.

## Database

*   This chatroom application uses an SQLite database (`users.db`) to store:
    *   Usernames and hashed passwords for authentication in the `users` table.
    *   Chat messages, usernames, and timestamps in the `messages` table for message persistence.
*   The database file `users.db` will be created in the project's root directory when the server is first run if it does not already exist.

## Customization

*   **Styling:** You can customize the look and feel of the chatroom by modifying the `public/style.css` file.
*   **Functionality:**  Further features such as user avatars, private messaging, or message editing could be added by extending the server-side (`server.js`) and client-side (`public/chatroom.html` and script) code.

## License

[Optional: Add license information here, e.g., MIT License, Apache 2.0, etc.]

---

Thank you for using the Real-time Chatroom Application!
