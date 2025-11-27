const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const logRoutes = require("./routes/logRoutes");
const examRoutes = require("./routes/examRoutes");

const Log = require("./models/Log");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/exams", examRoutes);

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// Helper to save logs
const saveLog = async (roomId, userName, action, data = "") => {
  try {
    const log = new Log({
      roomId,
      userId: "server",        // server-generated logs
      userName,
      category: "server",
      action,
      data
    });

    await log.save();
  } catch (err) {
    console.error("❌ Error saving log:", err.message);
  }
};


// Track participants per room
const participantsPerRoom = {};

io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  // --- Join room ---
  socket.on("join-room", ({ roomId, role, studentName }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.studentName = studentName || "Anonymous";

    if (!participantsPerRoom[roomId]) participantsPerRoom[roomId] = [];

    // Add participant if not already in the list
    if (!participantsPerRoom[roomId].includes(socket.studentName)) {
      participantsPerRoom[roomId].push(socket.studentName);
    }

    console.log(`📥 ${socket.studentName} joined room: ${roomId}`);

    // Emit updated participants list to everyone in room
    io.to(roomId).emit("participants-update", participantsPerRoom[roomId]);

    saveLog(roomId, socket.studentName, "join-room");
  });

  // --- Chat message ---
  socket.on("chat-message", ({ roomId, message, sender }) => {
    io.to(roomId).emit("chat-message", { message, sender });
    saveLog(roomId, sender, "chat-message", message);
  });

  // --- Code changes ---
  socket.on("code-change", ({ roomId, code, user }) => {
    socket.to(roomId).emit("code-change", code);
    saveLog(roomId, user, "code-change", code.substring(0, 50));
  });

  // --- Student Activity Logs (REAL-TIME + SAVE) ---
  socket.on("log-event", async (data) => {
    try {
      // Save to database
      await Log.create({
        roomId: data.roomId,
        userId: "student",
        userName: data.user,
        category: "activity",
        action: data.action,
        data: data.data,
        timestamp: data.timestamp,
      });

      // 🔥 Real-time send to host dashboard
      io.to(data.roomId).emit("new-log", {
        user: data.user,
        action: data.action,
        data: data.data,
        timestamp: data.timestamp,
      });

    } catch (err) {
      console.error("❌ Error saving student log:", err.message);
    }
  });



  // --- Disconnect ---
  socket.on("disconnecting", () => {
    const roomId = socket.roomId;
    if (roomId && participantsPerRoom[roomId]) {
      participantsPerRoom[roomId] = participantsPerRoom[roomId].filter(
        (name) => name !== socket.studentName
      );
      io.to(roomId).emit("participants-update", participantsPerRoom[roomId]);
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.IO running on http://localhost:${PORT}`)
);
