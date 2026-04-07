const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");

const statusFilter = document.getElementById("statusFilter");
const cards = Array.from(document.querySelectorAll(".contact-card"));
const pendingCountEl = document.querySelector(".pending-count");
const requestModal = document.getElementById("requestModal");
const requestCloseTriggers = Array.from(
  document.querySelectorAll("[data-request-close]"),
);
const viewButtons = Array.from(document.querySelectorAll(".view-btn"));
const replyModal = document.getElementById("replyModal");
const replyCloseTriggers = Array.from(
  document.querySelectorAll("[data-reply-close]"),
);
const replyButtons = Array.from(document.querySelectorAll("[data-open-reply]"));
const openReplyFromView = document.getElementById("openReplyFromView");
const replySuccessModal = document.getElementById("replySuccessModal");
const replySuccessCloseTriggers = Array.from(
  document.querySelectorAll("[data-reply-success-close]"),
);
const replySuccessDoneBtn = document.getElementById("replySuccessDoneBtn");

const modalCustomerName = document.getElementById("modalCustomerName");
const modalCustomerStatus = document.getElementById("modalCustomerStatus");
const modalCustomerEmail = document.getElementById("modalCustomerEmail");
const modalCustomerPhone = document.getElementById("modalCustomerPhone");
const modalCustomerSubject = document.getElementById("modalCustomerSubject");
const modalCustomerDate = document.getElementById("modalCustomerDate");
const modalCustomerMessage = document.getElementById("modalCustomerMessage");
const modalAvatarIcon = requestModal?.querySelector(".request-modal__avatar i");
const replyRecipientName = document.getElementById("replyRecipientName");
const replyRecipientEmail = document.getElementById("replyRecipientEmail");
const replyOriginalMessage = document.getElementById("replyOriginalMessage");
const replySubject = document.getElementById("replySubject");
const replyMessage = document.getElementById("replyMessage");
const replyForm = document.getElementById("replyForm");
const replySuccessName = document.getElementById("replySuccessName");
const replySuccessEmail = document.getElementById("replySuccessEmail");
const replySuccessSubject = document.getElementById("replySuccessSubject");

let activeCard = null;

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    dashboard.classList.toggle("collapsed");
  });
}

function updatePendingCount() {
  const pendingVisible = cards.filter(
    (card) =>
      card.dataset.status === "pending" && !card.classList.contains("hidden"),
  ).length;

  pendingCountEl.textContent = `${pendingVisible} pending`;
}

function applyFilter(value) {
  cards.forEach((card) => {
    const shouldShow = value === "all" || card.dataset.status === value;
    card.classList.toggle("hidden", !shouldShow);
  });

  updatePendingCount();
}

function updateBodyModalState() {
  const hasOpenModal =
    requestModal?.classList.contains("active") ||
    replyModal?.classList.contains("active") ||
    replySuccessModal?.classList.contains("active");
  document.body.classList.toggle("modal-open", Boolean(hasOpenModal));
}

function getCardData(card) {
  const name = card.querySelector(".identity h4")?.textContent?.trim() ?? "";
  const email = card.querySelector(".identity p")?.textContent?.trim() ?? "";
  const statusChip = card.querySelector(".status-chip");
  const status = statusChip?.textContent?.trim().toLowerCase() ?? "pending";
  const metaRows = card.querySelectorAll(".meta-list p");
  const phone = metaRows[0]?.textContent?.trim() ?? "";
  const date = metaRows[1]?.textContent?.trim() ?? "";
  const subject = metaRows[2]?.textContent?.trim() ?? "";
  const message =
    card.querySelector(".meta-list .message")?.textContent?.trim() ??
    metaRows[3]?.textContent?.trim() ??
    "";
  const avatarIconName =
    card.querySelector(".avatar i")?.getAttribute("data-lucide") ??
    "help-circle";

  return {
    name,
    email,
    status,
    phone,
    date,
    subject,
    message,
    avatarIconName,
  };
}

function openRequestModal(card) {
  if (!requestModal || !card) return;

  activeCard = card;

  const cardData = getCardData(card);

  if (modalCustomerName) modalCustomerName.textContent = cardData.name;
  if (modalCustomerEmail) modalCustomerEmail.textContent = cardData.email;
  if (modalCustomerPhone) modalCustomerPhone.textContent = cardData.phone;
  if (modalCustomerDate) modalCustomerDate.textContent = cardData.date;
  if (modalCustomerSubject) modalCustomerSubject.textContent = cardData.subject;
  if (modalCustomerMessage) modalCustomerMessage.textContent = cardData.message;

  if (modalCustomerStatus) {
    modalCustomerStatus.textContent = cardData.status;
    modalCustomerStatus.className = "request-modal__status";
    modalCustomerStatus.classList.add(
      cardData.status === "resolved" ? "resolved" : "pending",
    );
  }

  if (modalAvatarIcon) {
    modalAvatarIcon.setAttribute("data-lucide", cardData.avatarIconName);
  }

  requestModal.classList.add("active");
  requestModal.setAttribute("aria-hidden", "false");
  updateBodyModalState();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeRequestModal(options = {}) {
  if (!requestModal) return;

  const { preserveActiveCard = false } = options;

  requestModal.classList.remove("active");
  requestModal.setAttribute("aria-hidden", "true");
  updateBodyModalState();

  if (!preserveActiveCard && !replyModal?.classList.contains("active")) {
    activeCard = null;
  }
}

function openReplyModal(card) {
  if (!replyModal || !card) return;

  activeCard = card;
  const cardData = getCardData(card);

  if (replyRecipientName) replyRecipientName.textContent = cardData.name;
  if (replyRecipientEmail) replyRecipientEmail.textContent = cardData.email;
  if (replyOriginalMessage) replyOriginalMessage.textContent = cardData.message;
  if (replySubject) replySubject.value = `Re: ${cardData.subject}`;
  if (replyMessage) replyMessage.value = "";

  replyModal.classList.add("active");
  replyModal.setAttribute("aria-hidden", "false");
  updateBodyModalState();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeReplyModal(options = {}) {
  if (!replyModal) return;

  const { preserveActiveCard = false } = options;

  replyModal.classList.remove("active");
  replyModal.setAttribute("aria-hidden", "true");
  updateBodyModalState();

  if (
    !preserveActiveCard &&
    !requestModal?.classList.contains("active") &&
    !replySuccessModal?.classList.contains("active")
  ) {
    activeCard = null;
  }
}

function openReplySuccessModal(card, customSubject = "") {
  if (!replySuccessModal || !card) return;

  activeCard = card;
  const cardData = getCardData(card);

  if (replySuccessName) replySuccessName.textContent = cardData.name;
  if (replySuccessEmail) replySuccessEmail.textContent = cardData.email;
  if (replySuccessSubject) {
    replySuccessSubject.textContent =
      customSubject || `Re: ${cardData.subject}`;
  }

  replySuccessModal.classList.add("active");
  replySuccessModal.setAttribute("aria-hidden", "false");
  updateBodyModalState();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function closeReplySuccessModal() {
  if (!replySuccessModal) return;

  replySuccessModal.classList.remove("active");
  replySuccessModal.setAttribute("aria-hidden", "true");
  updateBodyModalState();

  if (!requestModal?.classList.contains("active")) {
    activeCard = null;
  }
}

statusFilter?.addEventListener("change", (event) => {
  applyFilter(event.target.value);
});

viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".contact-card");
    openRequestModal(card);
  });
});

requestCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeRequestModal);
});

replyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".contact-card");
    openReplyModal(card);
  });
});

replyCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeReplyModal);
});

replySuccessCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeReplySuccessModal);
});

replySuccessDoneBtn?.addEventListener("click", closeReplySuccessModal);

openReplyFromView?.addEventListener("click", () => {
  if (!activeCard) return;
  closeRequestModal({ preserveActiveCard: true });
  openReplyModal(activeCard);
});

replyForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!activeCard) {
    closeReplyModal();
    return;
  }

  const customSubject = replySubject?.value?.trim() || "";
  closeReplyModal({ preserveActiveCard: true });
  openReplySuccessModal(activeCard, customSubject);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (replySuccessModal?.classList.contains("active")) {
    closeReplySuccessModal();
    return;
  }

  if (replyModal?.classList.contains("active")) {
    closeReplyModal();
    return;
  }

  if (requestModal?.classList.contains("active")) {
    closeRequestModal();
  }
});

document.querySelectorAll(".delete-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".contact-card");
    if (!card) return;

    if (activeCard === card) {
      closeRequestModal();
      closeReplyModal();
      closeReplySuccessModal();
    }

    card.remove();

    const remainingCards = Array.from(
      document.querySelectorAll(".contact-card"),
    );
    cards.length = 0;
    cards.push(...remainingCards);
    updatePendingCount();
  });
});

applyFilter("all");

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}