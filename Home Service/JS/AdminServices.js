const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");
const serviceGrid = document.getElementById("serviceGrid");
const addServiceBtn = document.getElementById("addServiceBtn");

const renderIcons = () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    dashboard.classList.toggle("collapsed");
  });
}

const updateServiceState = (card, nextStatus) => {
  const statusPill = card.querySelector(".status-pill");
  const toggleBtn = card.querySelector(".action-btn.toggle");
  const toggleText = toggleBtn?.querySelector("span");
  const toggleIcon = toggleBtn?.querySelector("i");

  card.dataset.status = nextStatus;

  if (statusPill) {
    statusPill.className = "status-pill";
    statusPill.classList.add(nextStatus === "active" ? "active" : "inactive");
    statusPill.textContent = nextStatus;
  }

  if (toggleBtn) {
    toggleBtn.classList.toggle("enable", nextStatus !== "active");
  }

  if (toggleText) {
    toggleText.textContent = nextStatus === "active" ? "Disable" : "Enable";
  }

  if (toggleIcon) {
    toggleIcon.setAttribute("data-lucide", nextStatus === "active" ? "pause" : "play");
  }

  renderIcons();
};

if (serviceGrid) {
  serviceGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".action-btn");

    if (!button) {
      return;
    }

    const card = button.closest(".service-card");
    if (!card) {
      return;
    }

    if (button.classList.contains("toggle")) {
      const isActive = card.dataset.status === "active";
      updateServiceState(card, isActive ? "inactive" : "active");
      return;
    }

    if (button.classList.contains("delete")) {
      card.remove();
      return;
    }

    if (button.classList.contains("edit")) {
      // Placeholder interaction matching static admin design behavior.
    }
  });
}

if (addServiceBtn) {
  addServiceBtn.addEventListener("click", () => {
    // Placeholder interaction matching static admin design behavior.
  });
}

renderIcons();