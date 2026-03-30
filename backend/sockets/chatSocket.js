let onlineUsers = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // ✅ USER COMES ONLINE
    socket.on("userOnline", (userId) => {
      onlineUsers[userId] = socket.id;

      console.log("ONLINE USERS:", Object.keys(onlineUsers));

      io.emit("onlineUsers", Object.keys(onlineUsers));
    });

    // JOIN ROOM
    socket.on("joinDepartment", (departmentId) => {
      socket.join(departmentId);
    });


    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.sender?._id !== userId) {
        audioRef.current?.play().catch(() => { });

        if (document.hidden) {
          alert("📩 New message received");
        }
      }
    });

    // SEND MESSAGE
    socket.on("sendMessage", async (data) => {
      io.to(data.department).emit("receiveMessage", {
        ...data,
        status: "delivered"
      });
    });

    // TYPING
    socket.on("typing", ({ departmentId, name }) => {
      socket.to(departmentId).emit("typing", name);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      for (let userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
        }
      }

      io.emit("onlineUsers", Object.keys(onlineUsers));

      console.log("🔴 User disconnected:", socket.id);
    });
  });
};