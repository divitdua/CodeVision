const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  roomId: { type: String, required: true },

  // Added fields (minimal but required)
  userId: { type: String, required: true },
  userName: { type: String, required: true },

  // Optional category for grouping logs
  category: { type: String, default: "general" },

  action: { type: String, required: true },  // e.g. "joined", "tab-blur"
  data: { type: String },

  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", logSchema);
