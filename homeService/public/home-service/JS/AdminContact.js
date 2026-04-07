const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");
const statusFilter = document.getElementById("statusFilter");
const cardsGrid = document.getElementById("cardsGrid");
const loadingStatus = document.getElementById("loadingStatus");
const pendingCountEl = document.querySelector(".pending-count");
const requestModal = document.getElementById("requestModal");
const requestCloseTriggers = Array.from(document.querySelectorAll("[data-request-close]"));
const replyModal = document.getElementById("replyModal");
const replyCloseTriggers = Array.from(document.querySelectorAll("[data-reply-close]"));
const replyButtons = Array.from(document.querySelectorAll("[data-open-reply]"));
const openReplyFromView = document.getElementById("openReplyFromView");
const replySuccessModal = document.getElementById("replySuccessModal");
const replySuccessCloseTriggers = Array.from(document.querySelectorAll("[data-reply-success-close]"));
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

let contactData = [];
let activeCard = null;

const avatarIcons = ["help-circle", "alert-circle", "calendar-x-2", "star", "message-square", "phone", "mail"];
const avatarColors = ["soft-green", "soft-orange", "soft-pink", "soft-yellow"];

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    dashboard.classList.toggle("collapsed");
  });
}

async function fetchContactData() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/Contact?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    contactData = Array.isArray(data) ? data : [];
    renderCards();
  } catch (error) {
    console.error('Error fetching contact data:', error);
    if (loadingStatus) {
      loadingStatus.textContent = 'Error loading contact requests. Please try again.';
    }
  }
}

function getStatusLabel(statusVal) {
  // status is a boolean: false = pending, true = resolved
  return statusVal === true ? 'resolved' : 'pending';
}

function getAvatarIcon(index) {
  return avatarIcons[index % avatarIcons.length];
}

function getAvatarColor(index) {
  return avatarColors[index % avatarColors.length];
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

function renderCards() {
  if (!cardsGrid) return;

  const filterValue = statusFilter?.value || 'all';
  const filteredData = contactData.filter(item => {
    if (filterValue === 'all') return true;
    return getStatusLabel(item.status) === filterValue;
  });

  if (filteredData.length === 0) {
    cardsGrid.innerHTML = '<p class="loading-status">No contact requests found.</p>';
    updatePendingCount();
    return;
  }

  cardsGrid.innerHTML = filteredData.map((item, index) => {
    const icon = getAvatarIcon(index);
    const color = getAvatarColor(index);
    const status = getStatusLabel(item.status);
    const fullName = item.full_name || 'Unknown';
    const email = item.email || 'N/A';
    const phone = item['phone-number'] || 'N/A';
    const date = formatDate(item.created_at);
    const subject = item.service_interested || 'General Inquiry';
    const message = item.message || '';

    return `
      <article class="contact-card" data-status="${status}" data-id="${item.id || index}">
        <div class="card-head">
          <div class="identity">
            <div class="avatar ${color}">
              <i data-lucide="${icon}"></i>
            </div>
            <div>
              <h4>${fullName}</h4>
              <p>${email}</p>
            </div>
          </div>
          <span class="status-chip ${status}">${status}</span>
        </div>
        <div class="meta-list">
          <p><i data-lucide="phone"></i> ${phone}</p>
          <p><i data-lucide="calendar"></i> ${date}</p>
          <p><i data-lucide="message-square"></i> ${subject}</p>
          <p class="message">${message}</p>
        </div>
        <div class="card-actions">
          <button class="action-btn view-btn">
            <i data-lucide="eye"></i><span>View</span>
          </button>
          <button class="action-btn reply" data-open-reply>
            <i data-lucide="reply"></i><span>Reply</span>
          </button>
          <button class="action-btn danger delete-btn">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </article>
    `;
  }).join('');

  updatePendingCount();
  attachCardEventListeners();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function updatePendingCount() {
  const pendingCount = contactData.filter(item => getStatusLabel(item.status) === 'pending').length;
  if (pendingCountEl) {
    pendingCountEl.textContent = `${pendingCount} pending`;
  }
}

function attachCardEventListeners() {
  const viewButtons = Array.from(document.querySelectorAll(".view-btn"));
  const replyButtons = Array.from(document.querySelectorAll("[data-open-reply]"));
  const deleteButtons = Array.from(document.querySelectorAll(".delete-btn"));

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".contact-card");
      openRequestModal(card);
    });
  });

  replyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".contact-card");
      openReplyModal(card);
    });
  });

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const card = btn.closest(".contact-card");
      if (!card) return;

      const contactId = card.dataset.id;
      if (!contactId) return;

      if (activeCard === card) {
        closeRequestModal();
        closeReplyModal();
        closeReplySuccessModal();
      }

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Contact?id=eq.${contactId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete: ${response.status}`);
        }

        card.remove();
        contactData = contactData.filter(item => String(item.id) !== String(contactId));
        updatePendingCount();
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact request.');
      }
    });
  });
}

function getCardData(card) {
  const contactId = card?.dataset.id;
  const item = contactData.find(c => String(c.id) === String(contactId));

  if (item) {
    return {
      name: item.full_name || 'Unknown',
      email: item.email || 'N/A',
      status: getStatusLabel(item.status),
      phone: item['phone-number'] || 'N/A',
      date: formatDate(item.created_at),
      subject: item.service_interested || 'General Inquiry',
      message: item.message || '',
      avatarIconName: 'help-circle',
    };
  }

  const name = card.querySelector(".identity h4")?.textContent?.trim() ?? "";
  const email = card.querySelector(".identity p")?.textContent?.trim() ?? "";
  const statusChip = card.querySelector(".status-chip");
  const status = statusChip?.textContent?.trim().toLowerCase() ?? "pending";
  const metaRows = card.querySelectorAll(".meta-list p");
  const phone = metaRows[0]?.textContent?.trim() ?? "";
  const date = metaRows[1]?.textContent?.trim() ?? "";
  const subject = metaRows[2]?.textContent?.trim() ?? "";
  const message = card.querySelector(".meta-list .message")?.textContent?.trim() ?? metaRows[3]?.textContent?.trim() ?? "";
  const avatarIconName = card.querySelector(".avatar i")?.getAttribute("data-lucide") ?? "help-circle";

  return { name, email, status, phone, date, subject, message, avatarIconName };
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
    modalCustomerStatus.classList.add(cardData.status === "resolved" ? "resolved" : "pending");
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
    replySuccessSubject.textContent = customSubject || `Re: ${cardData.subject}`;
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

function updateBodyModalState() {
  const hasOpenModal =
    requestModal?.classList.contains("active") ||
    replyModal?.classList.contains("active") ||
    replySuccessModal?.classList.contains("active");
  document.body.classList.toggle("modal-open", Boolean(hasOpenModal));
}

statusFilter?.addEventListener("change", () => {
  renderCards();
});

requestCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeRequestModal);
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

replyForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!activeCard) {
    closeReplyModal();
    return;
  }

  const contactId = activeCard.dataset.id;
  const replyText = replyMessage?.value?.trim() || "";

  if (!contactId || !replyText) {
    alert('Please write a reply before sending.');
    return;
  }

  const sendBtn = replyForm.querySelector('.reply-btn--send');
  const originalText = sendBtn?.textContent || 'Send Reply';
  if (sendBtn) {
    sendBtn.textContent = 'Sending...';
    sendBtn.disabled = true;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/Contact?id=eq.${contactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        reply: replyText,
        status: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    // Update local data
    const itemIndex = contactData.findIndex(c => String(c.id) === String(contactId));
    if (itemIndex !== -1) {
      contactData[itemIndex].reply = replyText;
      contactData[itemIndex].status = true;
    }

    const customSubject = replySubject?.value?.trim() || "";
    closeReplyModal({ preserveActiveCard: true });
    openReplySuccessModal(activeCard, customSubject);

    // Re-render cards to reflect updated status
    renderCards();
  } catch (error) {
    console.error('Error sending reply:', error);
    alert('Failed to send reply. Please try again.');
  } finally {
    if (sendBtn) {
      sendBtn.textContent = originalText;
      sendBtn.disabled = false;
    }
  }
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

// Initialize
fetchContactData();

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}