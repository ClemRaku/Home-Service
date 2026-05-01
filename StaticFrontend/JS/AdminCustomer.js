const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    dashboard.classList.toggle("collapsed");
  });
}

const searchInput = document.getElementById("customerSearch");
const statusFilter = document.getElementById("statusFilter");
const tableBody = document.querySelector(".customer-table tbody");
const modal = document.getElementById("customerModal");
const modalAvatar = document.getElementById("modalAvatar");
const modalName = document.getElementById("modalName");
const modalStatus = document.getElementById("modalStatus");
const modalEmail = document.getElementById("modalEmail");
const modalPhone = document.getElementById("modalPhone");
const modalAddress = document.getElementById("modalAddress");
const modalBookings = document.getElementById("modalBookings");
const modalTotal = document.getElementById("modalTotal");
const modalSince = document.getElementById("modalSince");
const editModal = document.getElementById("editCustomerModal");
const editForm = document.getElementById("editCustomerForm");
const editNameInput = document.getElementById("editCustomerName");
const editEmailInput = document.getElementById("editCustomerEmail");
const editPhoneInput = document.getElementById("editCustomerPhone");
const editAddressInput = document.getElementById("editCustomerAddress");

let selectedRowForEdit = null;
let selectedRowForView = null;

const getCustomerRows = () => Array.from(document.querySelectorAll(".customer-table tbody tr"));

const applyFilters = () => {
  const searchValue = searchInput?.value.toLowerCase().trim() ?? "";
  const statusValue = statusFilter?.value ?? "all";
  const customerRows = getCustomerRows();

  customerRows.forEach((row) => {
    const rowText = row.textContent?.toLowerCase() ?? "";
    const rowStatus = row.dataset.status ?? "";
    const matchesSearch = rowText.includes(searchValue);
    const matchesStatus = statusValue === "all" || statusValue === rowStatus;

    row.style.display = matchesSearch && matchesStatus ? "table-row" : "none";
  });
};

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

if (statusFilter) {
  statusFilter.addEventListener("change", applyFilters);
}

const updateModalStatus = (status) => {
  if (!modalStatus) {
    return;
  }

  modalStatus.textContent = status;
  modalStatus.className = "status-pill";

  if (status === "blacklisted") {
    modalStatus.classList.add("danger");
  } else {
    modalStatus.classList.add("active");
  }
};

const updateRowStatusPill = (row, status) => {
  const rowStatusPill = row?.querySelector(".status-pill");

  if (!rowStatusPill) {
    return;
  }

  rowStatusPill.className = "status-pill";
  rowStatusPill.textContent = status;

  if (status === "blacklisted") {
    rowStatusPill.classList.add("danger");
  } else {
    rowStatusPill.classList.add("active");
  }
};

const buildActionButtons = (status) => {
  if (status === "blacklisted") {
    return `
      <button class="action-btn view"><i data-lucide="eye"></i></button>
      <button class="action-btn edit"><i data-lucide="pencil"></i></button>
      <button class="action-btn success"><i data-lucide="check"></i></button>
    `;
  }

  return `
    <button class="action-btn view"><i data-lucide="eye"></i></button>
    <button class="action-btn edit"><i data-lucide="pencil"></i></button>
    <button class="action-btn assign"><i data-lucide="user-round-x"></i></button>
    <button class="action-btn danger"><i data-lucide="ban"></i></button>
  `;
};

const updateRowStatus = (row, status) => {
  if (!row) {
    return;
  }

  row.dataset.status = status;
  updateRowStatusPill(row, status);

  const rowActionContainer = row.querySelector(".action-buttons");
  if (rowActionContainer) {
    rowActionContainer.innerHTML = buildActionButtons(status);
  }

  if (selectedRowForView === row) {
    updateModalStatus(status);
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};

const openModal = (row) => {
  if (!modal || !row) {
    return;
  }

  selectedRowForView = row;

  const name = row.querySelector(".customer-cell h4")?.textContent ?? "Customer";
  const joined = row.querySelector(".customer-cell span")?.textContent ?? "";
  const avatar = row.querySelector(".customer-cell img")?.getAttribute("src") ?? "";
  const email = row.querySelector(".contact-cell span")?.textContent ?? "";
  const phone = row.querySelector(".contact-cell small")?.textContent ?? "";
  const address = row.querySelector("td:nth-child(3)")?.textContent ?? "";
  const bookings = row.querySelector(".activity-cell span")?.textContent ?? "";
  const total = row.querySelector(".activity-cell strong")?.textContent ?? "";
  const status = row.dataset.status ?? "active";

  if (modalAvatar && avatar) {
    modalAvatar.src = avatar;
  }

  if (modalName) {
    modalName.textContent = name;
  }

  if (modalEmail) {
    modalEmail.textContent = email;
  }

  if (modalPhone) {
    modalPhone.textContent = phone;
  }

  if (modalAddress) {
    modalAddress.textContent = address;
  }

  if (modalBookings) {
    modalBookings.textContent = bookings.replace(" bookings", "");
  }

  if (modalTotal) {
    modalTotal.textContent = total;
  }

  if (modalSince) {
    modalSince.textContent = joined.replace("Joined ", "").slice(0, 4);
  }

  updateModalStatus(status);
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};

const closeModal = () => {
  if (!modal) {
    return;
  }

  selectedRowForView = null;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
};

const openEditModal = (row) => {
  if (!editModal || !row) {
    return;
  }

  selectedRowForEdit = row;

  const name = row.querySelector(".customer-cell h4")?.textContent?.trim() ?? "";
  const email = row.querySelector(".contact-cell span")?.textContent?.trim() ?? "";
  const phone = row.querySelector(".contact-cell small")?.textContent?.trim() ?? "";
  const address = row.querySelector("td:nth-child(3)")?.textContent?.trim() ?? "";

  if (editNameInput) {
    editNameInput.value = name;
  }

  if (editEmailInput) {
    editEmailInput.value = email;
  }

  if (editPhoneInput) {
    editPhoneInput.value = phone;
  }

  if (editAddressInput) {
    editAddressInput.value = address;
  }

  editModal.classList.add("active");
  editModal.setAttribute("aria-hidden", "false");
};

const closeEditModal = () => {
  if (!editModal) {
    return;
  }

  editModal.classList.remove("active");
  editModal.setAttribute("aria-hidden", "true");
  selectedRowForEdit = null;
};

if (tableBody) {
  tableBody.addEventListener("click", (event) => {
    const actionButton = event.target.closest(".action-btn");

    if (!actionButton) {
      return;
    }

    const row = actionButton.closest("tr");
    if (!row) {
      return;
    }

    if (actionButton.classList.contains("view")) {
      openModal(row);
      return;
    }

    if (actionButton.classList.contains("edit")) {
      openEditModal(row);
      return;
    }

    if (actionButton.classList.contains("assign")) {
      const customerName = row.querySelector(".customer-cell h4")?.textContent?.trim() ?? "this customer";
      const shouldRemove = window.confirm(`Remove ${customerName} from customer list?`);

      if (!shouldRemove) {
        return;
      }

      if (selectedRowForView === row) {
        closeModal();
      }

      if (selectedRowForEdit === row) {
        closeEditModal();
      }

      row.remove();
      applyFilters();
      return;
    }

    if (actionButton.classList.contains("danger")) {
      const currentStatus = row.dataset.status ?? "active";

      if (currentStatus !== "blacklisted") {
        row.dataset.previousStatus = currentStatus;
      }

      updateRowStatus(row, "blacklisted");
      applyFilters();
      return;
    }

    if (actionButton.classList.contains("success")) {
      const previousStatus = row.dataset.previousStatus;
      const restoredStatus = previousStatus && previousStatus !== "blacklisted" ? previousStatus : "active";

      updateRowStatus(row, restoredStatus);
      delete row.dataset.previousStatus;
      applyFilters();
    }
  });
}

const modalCloseTriggers = Array.from(document.querySelectorAll("[data-modal-close]"));
modalCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeModal);
});

const editCloseTriggers = Array.from(document.querySelectorAll("[data-edit-close]"));
editCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeEditModal);
});

if (editForm) {
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedRowForEdit) {
      closeEditModal();
      return;
    }

    const updatedName = editNameInput?.value.trim() ?? "";
    const updatedEmail = editEmailInput?.value.trim() ?? "";
    const updatedPhone = editPhoneInput?.value.trim() ?? "";
    const updatedAddress = editAddressInput?.value.trim() ?? "";

    const rowName = selectedRowForEdit.querySelector(".customer-cell h4");
    const rowAvatar = selectedRowForEdit.querySelector(".customer-cell img");
    const rowEmail = selectedRowForEdit.querySelector(".contact-cell span");
    const rowPhone = selectedRowForEdit.querySelector(".contact-cell small");
    const rowAddress = selectedRowForEdit.querySelector("td:nth-child(3)");

    if (rowName && updatedName) {
      rowName.textContent = updatedName;
    }

    if (rowAvatar && updatedName) {
      rowAvatar.alt = updatedName;
    }

    if (rowEmail && updatedEmail) {
      rowEmail.textContent = updatedEmail;
    }

    if (rowPhone && updatedPhone) {
      rowPhone.textContent = updatedPhone;
    }

    if (rowAddress && updatedAddress) {
      rowAddress.textContent = updatedAddress;
    }

    applyFilters();

    closeEditModal();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    closeEditModal();
  }
});

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}