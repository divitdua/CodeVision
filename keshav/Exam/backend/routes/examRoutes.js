const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

// Language → extension map
const EXT_MAP = {
 cpp: "cpp",
 c: "c",
 py: "py",
 python: "py",
 js: "js",
 javascript: "js",
 java: "java",
 txt: "txt"
};

// Strict filename sanitizer
function sanitizeFilename(name) {
 return name
   .normalize("NFKD")
   .replace(/[^\x00-\x7F]/g, "")
   .replace(/[^a-zA-Z0-9_-]/g, "_");
}

// =========================
// 1) SAVE STUDENT CODE (NO TEMP, NO ZIP)
// =========================
router.post("/:roomId/submit", async (req, res) => {
 try {
   const { code, language, studentName } = req.body;
   const roomId = req.params.roomId;

   if (!studentName) return res.status(400).json({ error: "studentName is required" });
   if (!code || code.trim() === "") return res.status(400).json({ error: "Code cannot be empty" });

   const extension = EXT_MAP[language] || "txt";
   const safeName = sanitizeFilename(studentName);

   const folderPath = path.join(__dirname, "..", "submissions", roomId);

   // create directory once
   if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

   // save file normally
   const filePath = path.join(folderPath, `${safeName}.${extension}`);
   fs.writeFileSync(filePath, code, "utf8");

   res.json({ success: true, message: "Code saved successfully" });
 } catch (err) {
   console.error("SUBMIT ERROR:", err);
   res.status(500).json({ error: "Failed to submit code" });
 }
});

// =========================
// 2) DOWNLOAD ZIP (Created Fresh Every Time)
// =========================
router.get("/:roomId/download-codes", async (req, res) => {
 try {
   const roomId = req.params.roomId;
   const folderPath = path.join(__dirname, "..", "submissions", roomId);

   if (!fs.existsSync(folderPath)) {
     return res.status(404).json({ error: "No submissions found" });
   }

   const zipPath = path.join(__dirname, "..", "submissions", `${roomId}.zip`);

   // remove old zip
   if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

   const output = fs.createWriteStream(zipPath);
   const archive = archiver("zip", { zlib: { level: 9 } });

   output.on("close", () => {
     res.setHeader("Content-Type", "application/zip");
     res.setHeader("Content-Disposition", `attachment; filename="${roomId}-submissions.zip"`);
     res.download(zipPath);
   });

   archive.on("error", (err) => {
     console.error("ZIP ERROR:", err);
     res.status(500).json({ error: "Failed to create ZIP" });
   });

   archive.pipe(output);
   archive.directory(folderPath, false); // zip entire folder
   archive.finalize();
 } catch (err) {
   console.error("DOWNLOAD ERROR:", err);
   res.status(500).json({ error: "Failed to download codes" });
 }
});

module.exports = router;
