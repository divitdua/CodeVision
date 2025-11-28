document.addEventListener("DOMContentLoaded", () => {
  // ✅ Use temporary token from common.js
  const token = localStorage.getItem("authToken");
  const socket = io("http://localhost:5000");
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

  // Logs
  let logs = [];
  function addHostLog(event) {
    const logEntry = `${new Date().toLocaleTimeString()} - ${event}`;
    logs.push(logEntry);
    const li = document.createElement("li");
    li.textContent = logEntry;
    logsEl.appendChild(li);
  }

  addHostLog("Exam started"); // initial log

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

  // Real-time student logs
  socket.on("new-log", (log) => {
    const entry = `${log.user} | ${new Date(log.timestamp).toLocaleTimeString()} | ${log.action}`;
    logs.push(entry);

    const li = document.createElement("li");
    li.textContent = entry;

    const suspicious = ["window-blur", "tab-blur", "window-minimized", "focus-loss","tab-focus"];
    if (suspicious.includes(log.action)) {
      li.style.background = "rgba(255, 0, 0, 0.2)";
      li.style.color = "#b00000";
      li.style.fontWeight = "bold";
    }

    logsEl.appendChild(li);
    logsEl.scrollTop = logsEl.scrollHeight;
  });
});
