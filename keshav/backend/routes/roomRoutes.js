const express = require("express");
const Room = require("../models/Room");
const User = require("../models/User");

const router = express.Router();

// Create a new room (✅ no password now)
router.post("/", async (req, res) => {
  try {
    const { name, type, teacherId } = req.body;
    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Create room (no password field)
    const room = new Room({
      name,
      type,
      teacher: teacher._id,
    });

    await room.save();

    res.status(201).json({
      roomId: room._id,
      name: room.name,
      teacher: teacher.name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all rooms
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

// Join a room (✅ simplified — no password check)
router.post("/:roomId/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Prevent duplicate joins
    if (room.students.includes(userId)) {
      return res.status(400).json({ message: "User already in room" });
    }

    room.students.push(userId);
    await room.save();

    res.json({
      message: "User joined room successfully",
      room,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
