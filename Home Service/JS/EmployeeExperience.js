document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const statusToggle = document.getElementById("statusToggle");
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");
  const logoutBtn = document.getElementById("logoutBtn");

  // Status toggle
  if (statusToggle) {
    statusToggle.addEventListener("change", () => {
      if (statusToggle.checked) {
        statusDot.style.background = "#4ade80";
        statusLabel.textContent = "Online";
        showToast("You are now Online", "success");
      } else {
        statusDot.style.background = "#ef4444";
        statusLabel.textContent = "Offline";
        showToast("You are now Offline", "warning");
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Logging out...", "info");
      setTimeout(() => {
        window.location.href = "../Html/Login.html";
      }, 1000);
    });
  }

  // Toast notification
  function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = "toast";
    const iconMap = { success: "check-circle", info: "info", warning: "alert-circle" };
    toast.innerHTML = `
      <div class="toast-icon ${type}">
        <i data-lucide="${iconMap[type] || "info"}"></i>
      </div>
      <div class="toast-content">
        <p>${message}</p>
      </div>
    `;
    toastContainer.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => {
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function createToastContainer() {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
    return container;
  }
});
