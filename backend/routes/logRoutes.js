const express = require("express");
const Log = require("../models/Log");

const router = express.Router();

// Get all logs for a room
router.get("/:roomId", async (req, res) => {
  try {
    const logs = await Log.find({ roomId: req.params.roomId }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
