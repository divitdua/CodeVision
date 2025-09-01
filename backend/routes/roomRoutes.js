const express = require("express");
const Room = require("../models/Room");
const User = require("../models/User");

const router = express.Router();

// ✅ Add question to room
router.post("/:roomId/question", async (req, res) => {
  try {
    const { question } = req.body;
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.question = question;
    await room.save();

    // Emit to all users in the room
    req.app.get("io").to(req.params.roomId).emit("new-question", question);

    res.json({ message: "Question uploaded", question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create a new room
router.post("/", async (req, res) => {
  try {
    const { name, type, teacherId } = req.body;
    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const room = new Room({ name, type, teacher: teacher._id });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("teacher", "name email")
      .populate("students", "name email");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Join a room
router.post("/:roomId/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.students.includes(userId)) {
      return res.status(400).json({ message: "User already in room" });
    }

    room.students.push(userId);
    await room.save();

    res.json({ message: "User joined room successfully", room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
