const users = {}; // username to socketId mapping

io.on("connection", (socket) => {
  socket.on("login", (username) => {
    users[username] = socket.id;
    socket.username = username;
    io.emit("login_success", Object.keys(users));
  });

  socket.on("send_private", ({ to, message }) => {
    const from = socket.username;
    const toSocketId = users[to];
    if (toSocketId) {
      io.to(toSocketId).emit("receive_private", {
        from: from,
        message: message,
      });
    }
  });

  socket.on("disconnect", () => {
    const name = socket.username;
    if (name && users[name]) {
      delete users[name];
      io.emit("login_success", Object.keys(users));
    }
  });
});
