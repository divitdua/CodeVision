const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  user: { type: String, default: "Anonymous" },
  action: { type: String, required: true },  // e.g., "join", "code-update"
  data: { type: String }, // optional: code snippet or message
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", logSchema);
