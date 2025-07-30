const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Home route to confirm server is working
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

let users = {};

// On new connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle login
  socket.on("login", (username) => {
    users[username] = socket.id;
    console.log('${username} logged in');
    socket.emit("login_success", Object.keys(users));
  });

  // Handle private messages
  socket.on("send_private", ({ to, message }) => {
    const toSocket = users[to];
    if (toSocket) {
      const fromUser = Object.keys(users).find(k => users[k] === socket.id);
      io.to(toSocket).emit("receive_private", { from: fromUser, message });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (const [user, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[user];
        console.log('${user} disconnected');
        break;
      }
    }
  });
});

// Start server on Render-assigned port or fallback
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log('Server running on port ${PORT}'));
