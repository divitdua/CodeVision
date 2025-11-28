// ====== Common Config ======
const API_BASE = "http://localhost:5000/api"; // Backend API URL
const SOCKET_URL = "http://localhost:5000";   // Socket.IO server

// Connect to Socket.IO
const socket = io(SOCKET_URL);

// ====== TEMPORARY TOKEN SETUP FOR DEV ======
if (!localStorage.getItem("authToken")) {
    const dummyToken = "devToken123";   // simple string, no decode needed
    localStorage.setItem("authToken", dummyToken);
    localStorage.setItem("userId", "testUserId");
    localStorage.setItem("studentName", "Host");  // Host name
}

// Helper: Get token
function getToken() {
  return localStorage.getItem("authToken");
}

// Helper: API call with auth
function apiGet(path) {
  return axios.get(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
}

function apiPost(path, data) {
  return axios.post(`${API_BASE}${path}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
}

// ====== Save Log (Student Activity) ======
function saveLog(category, action, data = "") {
  const roomId = localStorage.getItem("currentRoomId");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("studentName");

  if (!roomId || !userId || !userName) return;

  axios.post(`${API_BASE}/logs/add`, {
    roomId,
    userId,
    userName,
    category,
    action,
    data
  }, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
}
