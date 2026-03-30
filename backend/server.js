const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const chatSocket = require("./sockets/chatSocket");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ SOCKET.IO
const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Attach socket
chatSocket(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Server
server.listen(5000, () =>
  console.log("🚀 Server running on port 5000")
);