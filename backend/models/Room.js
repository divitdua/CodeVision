const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },              // Room name
  type: { type: String, enum: ["exam", "collab"], required: true }, // Room type
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },    // Reference to teacher
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of students
  createdAt: { type: Date, default: Date.now },        // Timestamp
});

module.exports = mongoose.model("Room", roomSchema);