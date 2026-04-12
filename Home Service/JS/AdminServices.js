const serviceGrid = document.getElementById("serviceGrid");
const addServiceBtn = document.getElementById("addServiceBtn");
const addServiceModal = document.getElementById("addServiceModal");
const editServiceModal = document.getElementById("editServiceModal");

const renderIcons = () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};

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

const toggleModal = (modal, isOpen) => {
  if (!modal) {
    return;
  }

  modal.classList.toggle("show", isOpen);
  modal.setAttribute("aria-hidden", (!isOpen).toString());

  if (isOpen) {
    const firstInput = modal.querySelector("input");
    firstInput?.focus();
  }
};

const attachModalHandlers = (modal) => {
  if (!modal) {
    return;
  }

  const closeBtn = modal.querySelector(".modal-close");
  const cancelBtn = modal.querySelector(".modal-btn.ghost");

  closeBtn?.addEventListener("click", () => toggleModal(modal, false));
  cancelBtn?.addEventListener("click", () => toggleModal(modal, false));

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      toggleModal(modal, false);
    }
  });
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
      toggleModal(editServiceModal, true);
    }
  });
}

if (addServiceBtn) {
  addServiceBtn.addEventListener("click", () => {
    toggleModal(addServiceModal, true);
  });
}

attachModalHandlers(addServiceModal);
attachModalHandlers(editServiceModal);

renderIcons();