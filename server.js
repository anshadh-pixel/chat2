const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// ✅ Allow only your GitHub frontend
app.use(cors({
  origin: "https://anshadh-pixel.github.io"
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://anshadh-pixel.github.io",
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("login", (username) => {
    users[username] = socket.id;
    socket.emit("login_success", Object.keys(users));
  });

  socket.on("send_private", ({ to, message }) => {
    const toId = users[to];
    const from = Object.keys(users).find(k => users[k] === socket.id);
    if (toId) {
      io.to(toId).emit("receive_private", { from, message });
    }
  });

  socket.on("disconnect", () => {
    const user = Object.keys(users).find(k => users[k] === socket.id);
    if (user) delete users[user];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
});
