const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    dashboard.classList.toggle("collapsed");
  });
}

const scheduleModal = document.getElementById("scheduleModal");
const editButtons = document.querySelectorAll(".action-btn.edit");
const modalCloseTriggers = document.querySelectorAll("[data-modal-close]");
const bookingModal = document.getElementById("bookingModal");
const viewButtons = document.querySelectorAll(".action-btn.view");
const bookingCloseTriggers = document.querySelectorAll("[data-booking-close]");
const bookingStatusBadge = document.querySelector("[data-booking-status]");
const bookingProgressButton = document.querySelector(
  "[data-booking-action='progress']"
);
const bookingActionLabel = document.querySelector(
  "[data-booking-action-label]"
);
const bookingActions = document.querySelector(".booking-modal__actions");
let bookingActionStep = "scheduled";
let activeBookingRow = null;

const openScheduleModal = () => {
  if (!scheduleModal) return;
  scheduleModal.classList.add("active");
  scheduleModal.setAttribute("aria-hidden", "false");
};

const closeScheduleModal = () => {
  if (!scheduleModal) return;
  scheduleModal.classList.remove("active");
  scheduleModal.setAttribute("aria-hidden", "true");
};

const openBookingModal = () => {
  if (!bookingModal) return;
  bookingModal.classList.add("active");
  bookingModal.setAttribute("aria-hidden", "false");
};

const closeBookingModal = () => {
  if (!bookingModal) return;
  bookingModal.classList.remove("active");
  bookingModal.setAttribute("aria-hidden", "true");
  activeBookingRow = null;
};

const setBookingStatus = (status) => {
  if (bookingStatusBadge) {
    bookingStatusBadge.textContent = status;
    bookingStatusBadge.classList.remove("scheduled", "in-progress", "completed");
    bookingStatusBadge.classList.add(status);
  }
  if (activeBookingRow) {
    const statusCell = activeBookingRow.querySelector(".status");
    if (statusCell) {
      statusCell.textContent = status;
      statusCell.classList.remove("scheduled", "in-progress", "completed");
      statusCell.classList.add(status);
    }
  }
};

const setActionState = (state) => {
  bookingActionStep = state;
  if (!bookingProgressButton || !bookingActionLabel) return;
  bookingProgressButton.classList.remove("in-progress", "completed");
  bookingActions?.classList.remove("single", "completed-only");
  bookingProgressButton.style.display = "inline-flex";
  if (state === "scheduled") {
    bookingActionLabel.textContent = "Mark In Progress";
    bookingProgressButton.classList.remove("ghost");
    bookingProgressButton.classList.add("primary");
    return;
  }
  if (state === "in-progress") {
    bookingActionLabel.textContent = "Mark Completed";
    bookingProgressButton.classList.remove("ghost");
    bookingProgressButton.classList.add("primary");
    bookingProgressButton.classList.add("in-progress");
    return;
  }
  bookingActionLabel.textContent = "Cancel";
  bookingProgressButton.classList.remove("primary");
  bookingProgressButton.classList.add("ghost");
  bookingProgressButton.classList.remove("in-progress", "completed");
  bookingActions?.classList.add("single", "completed-only");
};

editButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    openScheduleModal();
  });
});

modalCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeScheduleModal);
});

viewButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    activeBookingRow = button.closest("tr");
    const statusCell = activeBookingRow?.querySelector(".status");
    const currentStatus = statusCell?.textContent?.trim() || "scheduled";
    setBookingStatus(currentStatus);
    if (currentStatus === "completed") {
      setActionState("completed");
    } else if (currentStatus === "in-progress") {
      setActionState("in-progress");
    } else {
      setActionState("scheduled");
    }
    openBookingModal();
  });
});

bookingCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeBookingModal);
});

if (bookingProgressButton) {
  bookingProgressButton.addEventListener("click", () => {
    if (bookingActionStep === "scheduled") {
      setBookingStatus("in-progress");
      setActionState("in-progress");
      return;
    }
    if (bookingActionStep === "in-progress") {
      setBookingStatus("completed");
      setActionState("completed");
      return;
    }
    closeBookingModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeScheduleModal();
    closeBookingModal();
  }
});

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}
