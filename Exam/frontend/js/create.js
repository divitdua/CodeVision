// Handle Exam Room creation
async function createExamRoom() {
  try {
    // Get token & userId from localStorage
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId") || "testUserId";

    // API call to create a new exam room
    const response = await apiPost("/rooms", {
      name: "Exam Room",
      type: "exam",
      teacherId: userId  // placeholder, backend ignores it
    });

    const room = response.data;
    const roomId = room.roomId;

    // Store new room details
    localStorage.setItem("roomId", roomId);
    localStorage.setItem("roomType", "exam");
    localStorage.setItem("currentRoomId", roomId); // for logging
    localStorage.setItem("studentName", "Host");   // teacher/host

    console.log("Saved Room ID:", roomId);

    // Update UI
    const roomIdEl = document.getElementById("roomId");
    if (roomIdEl) roomIdEl.innerText = roomId;
    const roomInfoEl = document.getElementById("roomInfo");
    if (roomInfoEl) roomInfoEl.classList.remove("hidden");

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
