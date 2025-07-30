const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

let users = {};

io.on("connection", (socket) => {
  socket.on("login", (username) => {
    users[username] = socket.id;
    socket.emit("login_success", Object.keys(users));
  });

  socket.on("send_private", ({ to, message }) => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("receive_private", {
        from: Object.keys(users).find(key => users[key] === socket.id),
        message
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [user, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[user];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(Server running on port ${PORT}));
