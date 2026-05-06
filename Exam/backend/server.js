const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const logRoutes = require("./routes/logRoutes");
const Log = require("./models/Log");
const runRoutes = require("./routes/runRoutes");
const examRoutes = require("./routes/examRoutes"); 
const User = require("./models/User");


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
app.use("/api/run", runRoutes); 
app.use("/api/exams", examRoutes);

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));



 // Registration Endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or Email already exists!" });
        }

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name: username,
            username: username,
            email: email,
            password: hashedPassword
        });

        // Save to Database
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
});

// --- Login Endpoint ---
app.post("/api/login", async (req, res) => {
    try {
        // 1. Get data from the frontend
        const { username, password } = req.body;

        // 2. Find the user by username (or email if you prefer)
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // 3. Compare the typed password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // 4. Create a secure token (Keep the secret key safe in your .env file!)
        const secretKey = process.env.JWT_SECRET || "fallback_secret_dev_key";
        const token = jwt.sign(
            { userId: user._id, username: user.username }, 
            secretKey, 
            { expiresIn: "24h" } // Token expires in 24 hours
        );

        // 5. Send success response with the token and user data
        res.status(200).json({ 
            message: "Login successful!",
            token: token,
            userId: user._id,
            username: user.username 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});


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
