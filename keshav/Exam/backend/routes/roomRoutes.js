const express = require("express");
const Room = require("../models/Room");

const router = express.Router();

// Create a new room (no real teacher)
router.post("/", async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Room name and type are required" });
    }

    const room = new Room({
      name,
      type,
    });

    await room.save();

    res.status(201).json({
      roomId: room._id,
      name: room.name,
      teacher: "Host",
    });

  } catch (err) {
    console.error("ROOM CREATE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find(); // ❌ no populate, because students are strings
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join a room
router.post("/:roomId/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.students.includes(userId)) {
      room.students.push(userId);
      await room.save();
    }

    res.json({
      message: "User joined room successfully",
      room,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
