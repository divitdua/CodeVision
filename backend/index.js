const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const User = require("./models/User");
const Room = require("./models/Room");

async function createTestUser() {
  let user = await User.findOne({ email: "alice@example.com" });

  if (!user) {
    user = new User({
      name: "Alice",
      email: "alice@example.com",
      password: "123456",
      role: "student"
    });
    await user.save();
    console.log("User saved:", user);
  } else {
    console.log("User already exists:", user);
  }
}

async function createTestRoom() {
  const teacher = await User.findOne({ email: "alice@example.com" });
  if (!teacher) {
    console.log("Teacher user not found. Create the user first.");
    return;
  }

  let room = await Room.findOne({ name: "Math Exam" });
  if (!room) {
    room = new Room({
      name: "Math Exam",
      type: "exam",
      teacher: teacher._id
    });
    await room.save();
    console.log("Room saved:", room);
  } else {
    console.log("Room already exists:", room);
  }
}

async function main() {
  await createTestUser();
  await createTestRoom();
  mongoose.connection.close(); // close connection after operations
}

main(); 