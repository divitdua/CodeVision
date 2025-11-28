const express = require("express");
const router = express.Router();
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Detect Python command
const pythonCmd =
  process.platform === "win32" ? "py" : "python3";  // Windows = py, Linux/Mac = python3

router.post("/run", (req, res) => {
  const { language, code } = req.body;

  // ================= JAVASCRIPT ==================
  if (language === "javascript") {
    const file = path.join(__dirname, "temp.js");
    fs.writeFileSync(file, code);

    return exec(`node "${file}"`, (err, stdout, stderr) => {
      fs.unlinkSync(file);
      if (err) return res.json({ output: stderr || err.message });
      return res.json({ output: stdout });
    });
  }

  // ================= PYTHON ======================
  if (language === "python") {
    const file = path.join(__dirname, "temp.py");
    fs.writeFileSync(file, code);

    return exec(`${pythonCmd} "${file}"`, (err, stdout, stderr) => {
      fs.unlinkSync(file);
      if (err) return res.json({ output: stderr || err.message });
      return res.json({ output: stdout || stderr });
    });
  }

  // ================= C++ =========================
  if (language === "cpp") {
    const cppFile = path.join(__dirname, "temp.cpp");
    const exeFile = path.join(__dirname, "temp.exe");

    fs.writeFileSync(cppFile, code);

    return exec(`g++ "${cppFile}" -o "${exeFile}" && "${exeFile}"`, (err, stdout, stderr) => {
      fs.unlinkSync(cppFile);
      if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile);
      if (err) return res.json({ output: stderr || err.message });
      return res.json({ output: stdout });
    });
  }

  return res.status(400).json({ error: "Unsupported language." });
});

module.exports = router;
