// Navigate to create room page
function goToCreate_join() {
  window.location.href = "frontend/create-join.html";
}

// Navigate to join room page
function goToCollaborative() {
  window.location.href = "frontend/collaborative.html";
}

// Test Socket.IO connection
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server with ID:", socket.id);
});


 document.addEventListener('DOMContentLoaded', () => {
const tabButtons = document.querySelectorAll("[data-tab-target]");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab-target");
      const targetEl = document.getElementById(targetId);

      if (!targetEl) return;

      // Hide all tab contents
      tabContents.forEach((c) => c.classList.add("hidden"));
      // Show target tab content
      targetEl.classList.remove("hidden");

      // Update button styles
      tabButtons.forEach((b) => {
        b.classList.remove("bg-indigo-600", "text-white");
        b.classList.add("bg-gray-100", "text-gray-700");
      });

      btn.classList.remove("bg-gray-100", "text-gray-700");
      btn.classList.add("bg-indigo-600", "text-white");
    });
  });
});

