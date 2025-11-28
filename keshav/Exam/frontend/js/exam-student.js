document.addEventListener("DOMContentLoaded", () => {
  // ✅ Temporary token
  const token = localStorage.getItem("authToken");
  const roomId = localStorage.getItem("currentRoomId");
  const roomPass = localStorage.getItem("roomPass");
  const userName = localStorage.getItem("studentName") || "Student";

  // Display room info
  const roomIdDisplay = document.getElementById("roomIdDisplay");
  const roomPassDisplay = document.getElementById("roomPassDisplay");
  if (roomIdDisplay) roomIdDisplay.textContent = roomId;
  if (roomPassDisplay) roomPassDisplay.textContent = roomPass;

  // Socket setup
  const socket = io("http://localhost:5000", { query: { roomId, token } });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
    socket.emit("join-room", { roomId, role: "student", studentName: userName });
    setTimeout(() => {
      socket.emit("join-room", { roomId, role: "student", studentName: userName });
    }, 300);

    saveLog("joined", "Student connected");
  });

  // MONACO EDITOR
  let editor;
  require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs" } });
  require(["vs/editor/editor.main"], function () {
    // Default JavaScript code
    editor = monaco.editor.create(document.getElementById("editor"), {
      value: "// Start coding here...\n",
      language: "javascript",
      theme: "vs-dark",
      automaticLayout: true
    });
  });

  // LANGUAGE SWITCHER
  const languageSelect = document.getElementById("language");
  languageSelect.addEventListener("change", (e) => {
    let monacoLang = "javascript";
    let defaultCode = "// Start coding here...\n";

    if (e.target.value === "python") {
      monacoLang = "python";
      defaultCode = "# Start coding here\n";
    }
    if (e.target.value === "cpp") {
      monacoLang = "cpp";
      defaultCode = "// Start coding here...\n";
    }

    monaco.editor.setModelLanguage(editor.getModel(), monacoLang);
    editor.setValue(defaultCode);
  });

  // CHAT
  const chatBox = document.getElementById("chatBox");
  const chatInput = document.getElementById("chatInput");
  const sendChat = document.getElementById("sendChat");

  sendChat.addEventListener("click", () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    socket.emit("chat-message", { roomId, sender: userName, message: msg });
    chatInput.value = "";
  });

  socket.on("chat-message", ({ sender, message }) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // RUN CODE
  document.getElementById("runCode").addEventListener("click", async () => {
    const code = editor.getValue();
    const language = languageSelect.value;
    const outputBox = document.getElementById("output");
    outputBox.textContent = "Running...";
    try {
      const response = await axios.post("http://localhost:5000/api/run/run", { code, language }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      outputBox.textContent = response.data.output || "No output";
    } catch (error) {
      outputBox.textContent = "Error running code.";
      console.error(error);
    }
  });

  // SUBMIT CODE
  document.getElementById("submitCode").addEventListener("click", async () => {
    const code = editor.getValue();
    const language = languageSelect.value;
    try {
      await axios.post(`http://localhost:5000/api/exams/${roomId}/submit`, {
        code,
        language,
        studentName: userName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Code submitted successfully!");
    } catch (error) {
      alert("Failed to submit code.");
      console.error(error);
    }
  });

  // STUDENT LOGGING
  window.addEventListener("beforeunload", () => saveLog("left", "Student closed tab or refreshed"));
  document.addEventListener("visibilitychange", () => {
    saveLog(document.hidden ? "tab-blur" : "tab-focus", "Tab visibility changed");
  });

  function saveLog(action, data = "") {
    socket.emit("log-event", { roomId, user: userName, action, data, timestamp: new Date() });
  }
});
