document.addEventListener("DOMContentLoaded", () => {
  const socket = io("http://localhost:5000");
  const token = localStorage.getItem("token");
  const roomId = localStorage.getItem("roomId");

  const roomIdEl = document.getElementById("roomId");
  const participantsEl = document.getElementById("participants");
  const chatBox = document.getElementById("chatBox");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const logsEl = document.getElementById("logs");
  const downloadLogsBtn = document.getElementById("downloadLogs");
  const downloadCodesBtn = document.getElementById("downloadCodes");

  // Show room ID
  roomIdEl.textContent = roomId || "N/A";

  // Join room as host
  socket.on("connect", () => {
    socket.emit("join-room", { roomId, role: "host", studentName: "Host" });
  });

  // Participants update
  socket.on("participants-update", list => {
    participantsEl.innerHTML = "";
    list.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      participantsEl.appendChild(li);
    });
  });

  // Chat
  sendBtn.addEventListener("click", () => {
    const message = chatInput.value.trim();
    if (!message) return;
    socket.emit("chat-message", { roomId, sender: "Host", message });
    chatInput.value = "";
  });

  socket.on("chat-message", ({ sender, message }) => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // Logging
  let logs = [];
  function addLog(event) {
    const logEntry = `${new Date().toLocaleTimeString()} - ${event}`;
    logs.push(logEntry);
    const li = document.createElement("li");
    li.textContent = logEntry;
    logsEl.appendChild(li);
  }
  addLog("Exam started");
  window.onblur = () => addLog("Window minimized or tab switched");
  window.onfocus = () => addLog("Window focused");

  downloadLogsBtn.addEventListener("click", () => {
    const csvContent = "data:text/csv;charset=utf-8," + logs.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.setAttribute("download", `logs_${roomId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  downloadCodesBtn.addEventListener("click", async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exams/${roomId}/download-codes`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `submitted_codes_${roomId}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download codes.");
      console.error(err);
    }
  });
});
