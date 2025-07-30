const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

const users = {};

io.on("connection", socket => {
  socket.on("login", username => {
    users[username] = socket.id;
    socket.username = username;
    socket.emit("login_success");
  });

  socket.on("send_private", ({ to, message }) => {
    const target = users[to];
    if (target) {
      io.to(target).emit("receive_private", { from: socket.username, message });
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.username];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(✅ Server running on port ${PORT});
});