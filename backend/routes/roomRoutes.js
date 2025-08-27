const express = require("express");
const Room = require("../models/Room");
const User = require("../models/User");

const router = express.Router();

// Create a new room
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

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().populate("teacher", "name email");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;