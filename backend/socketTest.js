const io = require("socket.io-client");

console.log("Starting test...");

const socket = io("http://localhost:5000");

const departmentId = "UK"; // 👈 use simple string first

socket.on("connect", () => {
  console.log("🟢 Connected to server:", socket.id);

  // Join room
  socket.emit("joinDepartment", departmentId);

  console.log("📌 Joined room:", departmentId);

  // Send message after 2 sec
  setTimeout(() => {
    console.log("📤 Sending message...");

    socket.emit("sendMessage", {
      text: "Hello test",
      department: departmentId
    });
  }, 2000);
});

socket.on("receiveMessage", (data) => {
  console.log("📩 Received message:", data);
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection error:", err.message);
});