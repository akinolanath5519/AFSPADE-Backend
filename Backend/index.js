const express = require("express");
const http = require("http"); // Import HTTP module
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const chatRoutes = require("./routes/chatRoutes");
require('dotenv').config();  // Load environment variables




dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server instance
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Store connected users
const connectedUsers = {};

io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // Listen for user joining a chat
  socket.on("joinChat", (studentId) => {
    connectedUsers[studentId] = socket.id;
    console.log(`📌 Student ${studentId} joined chat.`);
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (const student in connectedUsers) {
      if (connectedUsers[student] === socket.id) {
        delete connectedUsers[student];
      }
    }
  });
});

// Attach `io` to the app so it can be accessed in routes/controllers
app.set("socketio", io);

// Routes
app.use(userRoutes);
app.use(courseRoutes);
app.use(assignmentRoutes);
app.use(chatRoutes);

// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
