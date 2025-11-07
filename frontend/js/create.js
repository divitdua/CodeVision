// Handle Exam Room creation
async function createExamRoom() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("No token found! Please log in again.");
      return;
    }

    // Decode user ID from token
    const userId = localStorage.getItem("userId") || JSON.parse(atob(token.split('.')[1])).id;

    // API call to create a new exam room
    const response = await apiPost("/rooms", {
      name: "Exam Room",
      type: "exam",
      teacherId: userId
    });

    const room = response.data || response;
    const roomId = room.roomId;

    // Store new room details
    localStorage.removeItem("roomId"); // clear old one
    localStorage.setItem("roomId", roomId);
    localStorage.setItem("roomType", "exam");

    // Force update before redirect
    console.log("Saved Room ID:", roomId);

    // Update UI (only Room ID)
    document.getElementById("roomId").innerText = roomId;
    document.getElementById("roomInfo").classList.remove("hidden");
  } catch (error) {
    console.error("Room creation error:", error);
    alert("Failed to create room. Check console.");
  }
}

// Placeholder for collaborative room
function createCollaborativeRoom() {
  alert("Collaborative room creation will be available soon.");
}

// Redirect to host page
function goToHostPage() {
  window.location.href = "exam-host.html";
}
