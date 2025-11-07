// ====== Common Config ======
const API_BASE = "http://localhost:5000/api"; // Backend API URL
const SOCKET_URL = "http://localhost:5000";   // Socket.IO server

// Connect to Socket.IO
const socket = io(SOCKET_URL);

// Helper: Get token
function getToken() {
  return localStorage.getItem("token");
}

// Helper: Set token
function setToken(token) {
  localStorage.setItem("token", token);
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
