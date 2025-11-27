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


// Placeholder for collaborative room
function createCollaborativeRoom() {
  alert("Collaborative room creation will be available soon.");
}

// Redirect to host page
function goToHostPage() {
  window.location.href = "exam-host.html";
}

function goToStudentPage() {
  window.location.href = "exam-student.html";
}


function toggleJoin(){
   document.getElementById("login-toggle").style.backgroundColor="#fff";
    document.getElementById("login-toggle").style.color="#222";
    document.getElementById("signup-toggle").style.backgroundColor="#57b846";
    document.getElementById("signup-toggle").style.color="#fff";
    document.getElementById("login-form").style.display="none";
    document.getElementById("signup-form").style.display="block";
}

function toggleCreate(){
    document.getElementById("login-toggle").style.backgroundColor="#57B846";
    document.getElementById("login-toggle").style.color="#fff";
    document.getElementById("signup-toggle").style.backgroundColor="#fff";
    document.getElementById("signup-toggle").style.color="#222";
    document.getElementById("signup-form").style.display="none";
    document.getElementById("login-form").style.display="block";
}
