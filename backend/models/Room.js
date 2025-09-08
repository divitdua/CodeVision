const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: String,
  type: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  question: { type: String, default: "" }  // NEW
});

module.exports = mongoose.model("Room", RoomSchema);
