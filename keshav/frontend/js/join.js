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
    const userId = localStorage.getItem("userId");

    // Call backend API to join room (pass studentName too)
    const response = await apiPost(`/rooms/${roomId}/join`, {
      userId,
      studentName
    });

    console.log("Join response data:", response.data);

    const room = response.data;
    const type = room?.type || "exam";

    // Save locally
    localStorage.setItem("currentRoomId", roomId);
    localStorage.setItem("roomType", type);
    localStorage.setItem("studentName", studentName);
    console.log("Saved student name:", localStorage.getItem("studentName"));


    // Redirect based on room type
    window.location.href = "exam-student.html";

  } catch (err) {
    console.error("Join room error:", err);
    errorMsg.textContent = "Invalid Room ID or server error.";
    errorMsg.classList.remove("hidden");
  }
}
