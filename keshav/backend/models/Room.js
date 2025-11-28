const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["exam", "collab"], required: true },

  // No real teacher for now
  teacher: { type: String, default: "Host" },

  // Allow students without registering
  students: [{ type: String }],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", roomSchema);
