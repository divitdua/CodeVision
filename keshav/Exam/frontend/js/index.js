// ✅ Ensure socket uses temporary token
const token = localStorage.getItem("authToken");
const socket = io("http://localhost:5000", { query: { token } });

// Navigate to create room page
function goToCreate() {
  window.location.href = "create.html";
}

// Navigate to join room page
function goToJoin() {
  window.location.href = "join.html";
}

// Test Socket.IO connection
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server with ID:", socket.id);
});
