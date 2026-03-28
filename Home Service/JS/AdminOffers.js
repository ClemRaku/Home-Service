const offerCards = document.querySelectorAll(".offer-card");
const editOfferModal = document.getElementById("editOfferModal");
const editButtons = document.querySelectorAll(".action-btn.edit");
const modalClose = editOfferModal?.querySelector(".modal-close");
const modalCancel = editOfferModal?.querySelector(".modal-btn.ghost");
const addOfferButton = document.getElementById("addOfferButton");
const addOfferModal = document.getElementById("addOfferModal");
const addModalClose = addOfferModal?.querySelector(".modal-close");
const addModalCancel = addOfferModal?.querySelector(".modal-btn.ghost");
const addOfferForm = document.getElementById("addOfferForm");
const addOfferTitleInput = document.getElementById("addOfferTitleInput");
const addServiceNameInput = document.getElementById("addServiceNameInput");
const addCategoryNameInput = document.getElementById("addCategoryNameInput");
const addPackageNameInput = document.getElementById("addPackageNameInput");
const addDiscountInput = document.getElementById("addDiscountInput");
const addPromoCodeInput = document.getElementById("addPromoCodeInput");
const addValidUntilInput = document.getElementById("addValidUntilInput");
const offersGrid = document.querySelector(".offers-grid");
const editOfferForm = document.getElementById("editOfferForm");
const offerTitleInput = document.getElementById("offerTitleInput");
const serviceNameInput = document.getElementById("serviceNameInput");
const categoryNameInput = document.getElementById("categoryNameInput");
const packageNameInput = document.getElementById("packageNameInput");
const discountInput = document.getElementById("discountInput");
const promoCodeInput = document.getElementById("promoCodeInput");
const validUntilInput = document.getElementById("validUntilInput");
const editServiceCategoryRow = document.getElementById("editServiceCategoryRow");
const editPackageField = document.getElementById("editPackageField");

let activeCard = null;

const toggleModal = (modal, show) => {
  if (!modal) return;
  modal.classList.toggle("show", show);
  modal.setAttribute("aria-hidden", show ? "false" : "true");
};

const getCardValue = (card, selector) => card?.querySelector(selector)?.textContent?.trim() || "";

const setInputValue = (input, value) => {
  if (input) {
    input.value = value;
  }
};

const formatDiscountValue = (value) => {
  const cleaned = value.replace(/%\s*OFF/i, "").trim();
  if (!cleaned) return "";
  return cleaned.includes("%") ? cleaned : `${cleaned}% OFF`;
};

const attachDiscountFormatter = (input) => {
  if (!input) return;
  const handle = () => {
    const formatted = formatDiscountValue(input.value);
    if (formatted) {
      input.value = formatted;
    }
  };
  input.addEventListener("blur", handle);
  input.addEventListener("change", handle);
};

const openEditModal = (card) => {
  activeCard = card;
  const packageValue = getCardValue(card, "[data-offer-package]");
  const isPackageOffer = Boolean(packageValue);

  if (editServiceCategoryRow) {
    editServiceCategoryRow.style.display = isPackageOffer ? "none" : "grid";
  }

  if (editPackageField) {
    editPackageField.style.display = isPackageOffer ? "grid" : "none";
  }

  setInputValue(offerTitleInput, getCardValue(card, "[data-offer-title]"));
  setInputValue(serviceNameInput, getCardValue(card, "[data-offer-service]"));
  setInputValue(categoryNameInput, getCardValue(card, "[data-offer-category]"));
  setInputValue(packageNameInput, packageValue);
  setInputValue(discountInput, getCardValue(card, "[data-offer-discount]"));
  setInputValue(promoCodeInput, getCardValue(card, "[data-offer-code]"));
  setInputValue(validUntilInput, getCardValue(card, "[data-offer-valid]"));
  toggleModal(editOfferModal, true);
};

const removeOfferCard = (card) => {
  if (!card) return;
  card.remove();
};

editButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const card = event.currentTarget.closest(".offer-card");
    if (card) {
      openEditModal(card);
    }
  });
});

const deleteButtons = document.querySelectorAll(".action-btn.delete");
deleteButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const card = event.currentTarget.closest(".offer-card");
    if (card) {
      removeOfferCard(card);
    }
  });
});

const closeEditModal = () => {
  toggleModal(editOfferModal, false);
  activeCard = null;
};

modalClose?.addEventListener("click", closeEditModal);
modalCancel?.addEventListener("click", closeEditModal);

editOfferModal?.addEventListener("click", (event) => {
  if (event.target === editOfferModal) {
    closeEditModal();
  }
});

const openAddModal = () => {
  toggleModal(addOfferModal, true);
};

const closeAddModal = () => {
  toggleModal(addOfferModal, false);
  addOfferForm?.reset();
};

addOfferButton?.addEventListener("click", openAddModal);
addModalClose?.addEventListener("click", closeAddModal);
addModalCancel?.addEventListener("click", closeAddModal);

addOfferModal?.addEventListener("click", (event) => {
  if (event.target === addOfferModal) {
    closeAddModal();
  }
});

addOfferForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = addOfferTitleInput?.value.trim() || "New Offer";
  const service = addServiceNameInput?.value.trim() || "General Service";
  const category = addCategoryNameInput?.value.trim() || "General";
  const packageName = addPackageNameInput?.value.trim();
  const discount = formatDiscountValue(addDiscountInput?.value || "") || "0% OFF";
  const code = addPromoCodeInput?.value.trim() || "NEWOFFER";
  const validUntil = addValidUntilInput?.value.trim() || "TBD";

  const isPackageOffer = Boolean(packageName);

  const serviceCategoryMarkup = isPackageOffer
    ? ""
    : `
        <p><i data-lucide="wrench"></i> Service: <strong data-offer-service>${service}</strong></p>
        <p><i data-lucide="layers"></i> Category: <span data-offer-category>${category}</span></p>
      `;

  const packageMarkup = isPackageOffer
    ? `<p><i data-lucide="package"></i> Package: <span data-offer-package>${packageName}</span></p>`
    : "";

  if (offersGrid) {
    const card = document.createElement("article");
    card.className = "offer-card active";
    card.innerHTML = `
      <div class="card-head">
        <div>
          <h3 data-offer-title>${title}</h3>
          <h4 data-offer-discount>${discount}</h4>
        </div>
        <span class="status-pill">active</span>
      </div>
      <div class="offer-meta">
        ${serviceCategoryMarkup}
        ${packageMarkup}
        <p><i data-lucide="ticket"></i> Code: <strong data-offer-code>${code}</strong></p>
        <p><i data-lucide="calendar"></i> Valid until: <span data-offer-valid>${validUntil}</span></p>
        <p><i data-lucide="users"></i> Used: 0 times</p>
      </div>
      <div class="card-actions">
        <button class="action-btn edit"><i data-lucide="pencil"></i><span>Edit</span></button>
        <button class="action-btn toggle"><i data-lucide="pause"></i><span>Disable</span></button>
        <button class="action-btn delete"><i data-lucide="trash-2"></i></button>
      </div>
    `;
    offersGrid.prepend(card);
    offerCards.forEach((existing) => existing.classList.remove("new-card"));
    card.classList.add("new-card");

    const editButton = card.querySelector(".action-btn.edit");
    const toggleButton = card.querySelector(".action-btn.toggle");
    const deleteButton = card.querySelector(".action-btn.delete");
    const statusPill = card.querySelector(".status-pill");

    editButton?.addEventListener("click", () => openEditModal(card));
    toggleButton?.addEventListener("click", () => {
      const isInactive = card.classList.contains("inactive");
      card.classList.toggle("inactive", !isInactive);
      card.classList.toggle("active", isInactive);
      statusPill.textContent = isInactive ? "active" : "inactive";
      toggleButton.classList.toggle("enable", !isInactive);
      toggleButton.innerHTML = isInactive
        ? '<i data-lucide="pause"></i><span>Disable</span>'
        : '<i data-lucide="play"></i><span>Enable</span>';

      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    });

    deleteButton?.addEventListener("click", () => removeOfferCard(card));

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  closeAddModal();
});

editOfferForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeCard) {
    closeEditModal();
    return;
  }

  const updateIfValue = (selector, value) => {
    const target = activeCard.querySelector(selector);
    if (target && value.trim()) {
      target.textContent = value.trim();
    }
  };

  updateIfValue("[data-offer-title]", offerTitleInput?.value || "");
  updateIfValue("[data-offer-service]", serviceNameInput?.value || "");
  updateIfValue("[data-offer-category]", categoryNameInput?.value || "");
  updateIfValue("[data-offer-package]", packageNameInput?.value || "");
  updateIfValue("[data-offer-discount]", formatDiscountValue(discountInput?.value || ""));
  updateIfValue("[data-offer-code]", promoCodeInput?.value || "");
  updateIfValue("[data-offer-valid]", validUntilInput?.value || "");

  closeEditModal();
});

offerCards.forEach((card) => {
  const toggleButton = card.querySelector(".action-btn.toggle");
  const statusPill = card.querySelector(".status-pill");

  if (!toggleButton || !statusPill) return;

  toggleButton.addEventListener("click", () => {
    const isInactive = card.classList.contains("inactive");
    card.classList.toggle("inactive", !isInactive);
    card.classList.toggle("active", isInactive);
    statusPill.textContent = isInactive ? "active" : "inactive";
    toggleButton.classList.toggle("enable", !isInactive);
    toggleButton.innerHTML = isInactive
      ? '<i data-lucide="pause"></i><span>Disable</span>'
      : '<i data-lucide="play"></i><span>Enable</span>';

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  });
});

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

attachDiscountFormatter(addDiscountInput);
attachDiscountFormatter(discountInput);