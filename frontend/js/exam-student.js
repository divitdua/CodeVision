document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
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

  // ✅ Ensure join-room is emitted after socket connects
  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);

    // Emit join-room
    console.log("🧠 Emitting join-room", { roomId, role: "student", studentName: userName });
    socket.emit("join-room", { roomId, role: "student", studentName: userName });

    // Safety: Re-emit after a short delay in case of timing issues
    setTimeout(() => {
      console.log("🧠 Re-emitting join-room for safety");
      socket.emit("join-room", { roomId, role: "student", studentName: userName });
    }, 300);
  });

  // -------------------
  // MONACO EDITOR SETUP
  // -------------------
  let editor;
  require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs" } });
  require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(document.getElementById("editor"), {
      value: "// Start coding here...\n",
      language: "javascript",
      theme: "vs-dark",
      automaticLayout: true
    });
  });

  // -------------------
  // LANGUAGE SWITCHER
  // -------------------
  const languageSelect = document.getElementById("language");
  languageSelect.addEventListener("change", (e) => {
    const lang = e.target.value;
    let monacoLang = "javascript";
    if (lang === "python") monacoLang = "python";
    if (lang === "cpp") monacoLang = "cpp";
    monaco.editor.setModelLanguage(editor.getModel(), monacoLang);
  });

  // -------------------
  // CHAT FUNCTIONALITY
  // -------------------
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

  // -------------------
  // RUN CODE
  // -------------------
  document.getElementById("runCode").addEventListener("click", async () => {
    const code = editor.getValue();
    const language = languageSelect.value;
    const outputBox = document.getElementById("output");
    outputBox.textContent = "Running...";
    try {
      const response = await axios.post("http://localhost:5000/api/run", { code, language }, { headers: { Authorization: `Bearer ${token}` } });
      outputBox.textContent = response.data.output || "No output";
    } catch (error) {
      outputBox.textContent = "Error running code.";
      console.error(error);
    }
  });

  // -------------------
  // SUBMIT CODE
  // -------------------
  document.getElementById("submitCode").addEventListener("click", async () => {
    const code = editor.getValue();
    const language = languageSelect.value;
    try {
      await axios.post(`http://localhost:5000/api/exams/${roomId}/submit`, { code, language }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Code submitted successfully!");
    } catch (error) {
      alert("Failed to submit code.");
      console.error(error);
    }
  });
});
