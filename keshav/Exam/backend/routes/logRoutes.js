const express = require("express");
const Log = require("../models/Log");

const router = express.Router();

// Save a new log (added)
router.post("/add", async (req, res) => {
  try {
    const { roomId, userId, userName, category, action, data } = req.body;

    if (!roomId || !userId || !userName || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const log = new Log({
      roomId,
      userId,
      userName,
      category: category || "general",
      action,
      data: data || ""
    });

    await log.save();
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Failed to save log" });
  }
});

// Get logs for a room (unchanged)
router.get("/:roomId", async (req, res) => {
  try {
    const logs = await Log.find({ roomId: req.params.roomId }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
