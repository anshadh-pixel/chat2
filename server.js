const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors()); // ✅ CORS enabled

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // ✅ Allow GitHub Pages frontend
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  socket.on("login", (username) => {
    users[username] = socket.id;
    socket.emit("login_success", Object.keys(users));
  });

  socket.on("send_private", ({ to, message }) => {
    const toSocketId = users[to];
    const fromUsername = Object.keys(users).find(key => users[key] === socket.id);

    if (toSocketId) {
      io.to(toSocketId).emit("receive_private", {
        from: fromUsername,
        message
      });
    }
  });

  socket.on("disconnect", () => {
    const username = Object.keys(users).find(key => users[key] === socket.id);
    if (username) {
      delete users[username];
      console.log("❌ Disconnected:", username);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
