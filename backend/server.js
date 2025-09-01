const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // restrict in production
    methods: ["GET", "POST"],
  },
});

// Serve static frontend files from "frontend" folder
app.use(express.static(path.join(__dirname, "..", "frontend")));
// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const logRoutes = require("./routes/logRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/logs", logRoutes);

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// Model for logs
const Log = require("./models/Log");

// 🔹 Helper function to save logs
const saveLog = async (roomId, user, action, data = "") => {
  try {
    const log = new Log({ roomId, user, action, data });
    await log.save();
  } catch (err) {
    console.error("❌ Error saving log:", err.message);
  }
};

app.set("io", io);

// 🔹 Socket.IO events
io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  // Join a room
  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);
    console.log(`${user} joined room: ${roomId}`);

    // Save log
    saveLog(roomId, user, "join-room");
  });

  // Code update
  socket.on("code-change", ({ roomId, code, user }) => {
    socket.to(roomId).emit("code-change", code);

    // Save log (only first 50 chars to avoid overload)
    saveLog(roomId, user, "code-change", code.substring(0, 50));
  });

  socket.on("screen-offer", ({ roomId, offer }) => {
  socket.to(roomId).emit("screen-offer", { offer, studentId: socket.id });
});

socket.on("screen-answer", ({ roomId, answer, studentId }) => {
  io.to(studentId).emit("screen-answer", { answer });
});

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.IO running on http://localhost:${PORT}`)
);
