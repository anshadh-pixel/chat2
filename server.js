const express = require('express');
const http = require('http');
const cors = require('cors'); // 👈 add this
const { Server } = require('socket.io');

const app = express();
app.use(cors()); // 👈 enable CORS for all origins

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://anshadh-pixel.github.io", // 👈 ONLY allow your frontend
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('login', (username) => {
    users[socket.id] = username;
    socket.emit('login_success', Object.values(users));
  });

  socket.on('send_private', ({ to, message }) => {
    for (let id in users) {
      if (users[id] === to) {
        io.to(id).emit('receive_private', {
          from: users[socket.id],
          message: message
        });
        break;
      }
    }
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
