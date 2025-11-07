// Navigate to create room page
function goToCreate() {
  window.location.href = "frontend/create.html";
}

// Navigate to join room page
function goToJoin() {
  window.location.href = "frontend/join.html";
}

// Test Socket.IO connection
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server with ID:", socket.id);
});
