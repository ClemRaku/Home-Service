document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  const filterButtons = document.querySelectorAll(".filter-pill");
  const jobCards = document.querySelectorAll(".job-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const filter = button.dataset.filter;
      jobCards.forEach((card) => {
        const status = card.dataset.status;
        if (filter === "all" || status === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  const modal = document.getElementById("jobModal");
  const modalClose = document.querySelector(".modal-close");
  const modalSecondary = document.querySelector(".modal-secondary");
  const modalTitle = document.getElementById("modalTitle");
  const modalClient = document.getElementById("modalClient");
  const modalDate = document.getElementById("modalDate");
  const modalDuration = document.getElementById("modalDuration");
  const modalDistance = document.getElementById("modalDistance");
  const modalService = document.getElementById("modalService");
  const modalLocation = document.getElementById("modalLocation");
  const modalPhone = document.getElementById("modalPhone");
  const modalPrice = document.getElementById("modalPrice");
  const modalPriority = document.getElementById("modalPriority");
  const modalPriorityText = document.getElementById("modalPriorityText");
  const modalStatus = document.getElementById("modalStatus");
  const modalNote = document.getElementById("modalNote");
  const modalPrimary = document.querySelector(".modal-primary");
  let activeJobButton = null;

  const setBadgeStyles = (badge, type) => {
    badge.className = "badge";
    if (type) {
      badge.classList.add(type);
    }
  };

  const openModal = (button) => {
    activeJobButton = button;
    modalTitle.textContent = button.dataset.title || "Job Details";
    modalClient.textContent = button.dataset.client || "";
    modalDate.textContent = button.dataset.date || "-";
    modalDuration.textContent = button.dataset.duration || "-";
    modalDistance.textContent = button.dataset.distance || "-";
    modalService.textContent = button.dataset.service || "-";
    modalLocation.textContent = button.dataset.location || "-";
    modalPhone.textContent = button.dataset.phone || "-";
    modalPrice.textContent = button.dataset.price || "-";
    modalNote.textContent = button.dataset.note || "-";

    const priorityType = button.dataset.priority || "normal";
    const priorityLabel = button.dataset.priorityLabel || "Normal";
    const statusType = button.dataset.status || "scheduled";
    const statusLabel = button.dataset.statusLabel || "Scheduled";

    modalPriority.textContent = priorityLabel;
    modalPriorityText.textContent = priorityLabel;
    modalStatus.textContent = statusLabel;

    setBadgeStyles(modalPriority, priorityType);
    setBadgeStyles(modalStatus, statusType);

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    if (modalPrimary) {
      const state = button.dataset.state || "scheduled";
      if (state === "completed") {
        modalPrimary.textContent = "Completed";
        modalPrimary.disabled = true;
      } else {
        modalPrimary.disabled = false;
        modalPrimary.textContent = state === "in-progress" ? "Mark Done" : "Start Job";
      }
    }
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  const updateJobCard = ({
    status,
    statusLabel,
    badgeClass,
    buttonText,
    buttonClass,
  }) => {
    if (!activeJobButton) return;
    const card = activeJobButton.closest(".job-card");
    const statusBadge = card?.querySelector(".badge.scheduled, .badge.in-progress, .badge.completed");

    activeJobButton.dataset.state = status;
    activeJobButton.dataset.status = status;
    activeJobButton.dataset.statusLabel = statusLabel;
    activeJobButton.textContent = buttonText;
    activeJobButton.className = `btn ${buttonClass}`;

    if (statusBadge) {
      statusBadge.textContent = statusLabel;
      statusBadge.className = `badge ${badgeClass}`;
    }

    if (card) {
      card.dataset.status = status;
    }

    modalStatus.textContent = statusLabel;
    setBadgeStyles(modalStatus, badgeClass);
    if (modalPrimary) {
      modalPrimary.textContent = buttonText;
      modalPrimary.disabled = status === "completed";
    }
  };

  document.querySelectorAll(".view-details").forEach((button) => {
    button.addEventListener("click", () => {
      const state = button.dataset.state || "scheduled";
      if (state === "in-progress") {
        activeJobButton = button;
        updateJobCard({
          status: "completed",
          statusLabel: "Completed",
          badgeClass: "completed",
          buttonText: "Completed",
          buttonClass: "outline",
        });
        return;
      }
      if (state === "completed") {
        return;
      }
      openModal(button);
    });
  });

  document.querySelectorAll(".status-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      activeJobButton = button;
      updateJobCard({
        status: "completed",
        statusLabel: "Completed",
        badgeClass: "completed",
        buttonText: "Completed",
        buttonClass: "outline",
      });
    });
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (modalSecondary) {
    modalSecondary.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  if (modalPrimary) {
    modalPrimary.addEventListener("click", () => {
      if (!activeJobButton) return;
      const currentState = activeJobButton.dataset.state || "scheduled";

      if (currentState === "scheduled") {
        updateJobCard({
          status: "in-progress",
          statusLabel: "In Progress",
          badgeClass: "in-progress",
          buttonText: "Mark Done",
          buttonClass: "primary",
        });
        closeModal();
      } else if (currentState === "in-progress") {
        updateJobCard({
          status: "completed",
          statusLabel: "Completed",
          badgeClass: "completed",
          buttonText: "Completed",
          buttonClass: "outline",
        });
        closeModal();
      }
    });
  }
});