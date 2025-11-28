async function joinRoom() {
  const studentName = document.getElementById("studentNameInput").value.trim();
  const roomId = document.getElementById("roomIdInput").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  // Validate inputs
  if (!studentName || !roomId) {
    errorMsg.textContent = "Please enter both your name and Room ID.";
    errorMsg.classList.remove("hidden");
    return;
  }

  try {
    // ✅ Use fallback userId in dev mode
    let userId = localStorage.getItem("userId");
    if (!userId) userId = "testUserId";

    // Call backend API to join room
    const response = await apiPost(`/rooms/${roomId}/join`, {
      userId // only send userId
    });

    console.log("Join response data:", response.data);

    const room = response.data.room || response.data; // handle both formats
    const type = room?.type || "exam";

    // Save student info locally
    localStorage.setItem("currentRoomId", roomId);
    localStorage.setItem("roomType", type);
    localStorage.setItem("studentName", studentName);

    console.log("Saved student name:", localStorage.getItem("studentName"));

    // Redirect to student exam page
    window.location.href = "exam-student.html";

  } catch (err) {
    console.error("Join room error:", err);
    errorMsg.textContent = "Invalid Room ID or server error.";
    errorMsg.classList.remove("hidden");
  }
}

// Bind join button
document.getElementById("joinBtn").addEventListener("click", joinRoom);
