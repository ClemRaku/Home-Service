const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
];

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
const tableBody = document.getElementById("customerTableBody");
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

const getCustomerRows = () => Array.from(document.querySelectorAll('.customer-table tbody tr[data-customer-row="true"]'));
const getCustomerIdentifier = (row) => row?.dataset.customerEmail || '';

const supabaseRequest = async (path, options = {}) => {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Supabase request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const formatPhone = (phoneValue) => {
  const raw = String(phoneValue ?? '').trim();

  if (!raw) {
    return 'N/A';
  }

  if (raw.startsWith('+')) {
    return raw;
  }

  const digits = raw.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits[0]} ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return raw;
};

const normalizeStatus = (statusValue) => {
  if (typeof statusValue === 'string') {
    return statusValue.toLowerCase() === 'blacklisted' ? 'blacklisted' : 'active';
  }

  if (typeof statusValue === 'boolean') {
    return statusValue ? 'active' : 'blacklisted';
  }

  return 'active';
};

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount}` : '$0';
};

const getAvatarForCustomer = (customer, index) => {
  const name = customer['Full Name'] || 'Customer';
  return FALLBACK_AVATARS[index % FALLBACK_AVATARS.length]
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0f2fe&color=0f172a`;
};

const renderEmptyState = (message) => {
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = `
    <tr>
      <td colspan="6">${escapeHtml(message)}</td>
    </tr>
  `;
};

const persistCustomerUpdate = async (identifierEmail, payload) => {
  const encodedEmail = encodeURIComponent(identifierEmail);
  const updatedRows = await supabaseRequest(`/rest/v1/Customer?Email=eq.${encodedEmail}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!updatedRows?.length) {
    throw new Error('Customer record was not updated.');
  }

  return updatedRows[0];
};

const persistCustomerDelete = async (identifierEmail) => {
  const encodedEmail = encodeURIComponent(identifierEmail);
  await supabaseRequest(`/rest/v1/Customer?Email=eq.${encodedEmail}`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal',
    },
  });
};

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

const buildCustomerRowMarkup = (customer, index) => {
  const fullName = customer['Full Name'] || 'Unnamed Customer';
  const email = customer.Email || 'No email';
  const phone = formatPhone(customer.Phone);
  const address = customer.address || 'No address provided';
  const bookings = Number.isFinite(Number(customer.bookings)) ? Number(customer.bookings) : 0;
  const totalSpent = formatCurrency(customer.wallet);
  const joinedAt = customer.joined_at || 'Unknown';
  const status = normalizeStatus(customer.status);
  const avatar = getAvatarForCustomer(customer, index);

  return `
    <tr data-customer-row="true" data-status="${status}" data-customer-email="${escapeHtml(email)}">
      <td>
        <div class="customer-cell">
          <img src="${avatar}" alt="${escapeHtml(fullName)}" />
          <div>
            <h4>${escapeHtml(fullName)}</h4>
            <span>Joined ${escapeHtml(joinedAt)}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="contact-cell">
          <span>${escapeHtml(email)}</span>
          <small>${escapeHtml(phone)}</small>
        </div>
      </td>
      <td>${escapeHtml(address)}</td>
      <td>
        <div class="activity-cell">
          <span>${bookings} bookings</span>
          <strong>${escapeHtml(totalSpent)}</strong>
        </div>
      </td>
      <td><span class="status-pill ${status === 'blacklisted' ? 'danger' : 'active'}">${status}</span></td>
      <td>
        <div class="action-buttons">
          ${buildActionButtons(status)}
        </div>
      </td>
    </tr>
  `;
};

const renderCustomers = (customers) => {
  if (!tableBody) {
    return;
  }

  if (!customers.length) {
    renderEmptyState('No customers found.');
    return;
  }

  tableBody.innerHTML = customers.map(buildCustomerRowMarkup).join('');

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  applyFilters();
};

const fetchCustomers = async () => {
  if (!tableBody) {
    return;
  }

  try {
    const customers = await supabaseRequest('/rest/v1/Customer?select=*&order=created_at.desc', {
      method: 'GET',
    });
    renderCustomers(customers);
  } catch (error) {
    console.error(error);
    renderEmptyState('Unable to load customers right now.');
  }
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
  tableBody.addEventListener("click", async (event) => {
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
      const customerEmail = getCustomerIdentifier(row);

      if (!customerEmail) {
        window.alert('Unable to delete this customer. Missing email identifier.');
        return;
      }

      const shouldRemove = window.confirm(`Delete ${customerName} permanently from the Customer table?`);

      if (!shouldRemove) {
        return;
      }

      actionButton.disabled = true;

      try {
        await persistCustomerDelete(customerEmail);

        if (selectedRowForView === row) {
          closeModal();
        }

        if (selectedRowForEdit === row) {
          closeEditModal();
        }

        row.remove();

        if (!getCustomerRows().length) {
          renderEmptyState('No customers found.');
        } else {
          applyFilters();
        }
      } catch (error) {
        console.error(error);
        window.alert('Failed to delete customer.');
      } finally {
        actionButton.disabled = false;
      }

      return;
    }

    if (actionButton.classList.contains("danger")) {
      const customerEmail = getCustomerIdentifier(row);

      if (!customerEmail) {
        window.alert('Unable to update this customer. Missing email identifier.');
        return;
      }

      const currentStatus = row.dataset.status ?? "active";

      if (currentStatus !== "blacklisted") {
        row.dataset.previousStatus = currentStatus;
      }

      actionButton.disabled = true;

      try {
        await persistCustomerUpdate(customerEmail, { status: false });
        updateRowStatus(row, "blacklisted");
        applyFilters();
      } catch (error) {
        console.error(error);
        window.alert('Failed to blacklist customer.');
      } finally {
        actionButton.disabled = false;
      }

      return;
    }

    if (actionButton.classList.contains("success")) {
      const customerEmail = getCustomerIdentifier(row);

      if (!customerEmail) {
        window.alert('Unable to update this customer. Missing email identifier.');
        return;
      }

      actionButton.disabled = true;

      const previousStatus = row.dataset.previousStatus;
      const restoredStatus = previousStatus && previousStatus !== "blacklisted" ? previousStatus : "active";

      try {
        await persistCustomerUpdate(customerEmail, { status: true });
        updateRowStatus(row, restoredStatus);
        delete row.dataset.previousStatus;
        applyFilters();
      } catch (error) {
        console.error(error);
        window.alert('Failed to restore customer status.');
      } finally {
        actionButton.disabled = false;
      }
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
  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedRowForEdit) {
      closeEditModal();
      return;
    }

    const updatedName = editNameInput?.value.trim() ?? "";
    const updatedEmail = editEmailInput?.value.trim() ?? "";
    const updatedPhone = editPhoneInput?.value.trim() ?? "";
    const updatedAddress = editAddressInput?.value.trim() ?? "";
    const identifierEmail = getCustomerIdentifier(selectedRowForEdit);

    if (!identifierEmail || !updatedName || !updatedEmail || !updatedPhone || !updatedAddress) {
      window.alert('Full name, email, phone, and address are required.');
      return;
    }

    const submitButton = editForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const updatedCustomer = await persistCustomerUpdate(identifierEmail, {
        'Full Name': updatedName,
        Email: updatedEmail,
        Phone: updatedPhone,
        address: updatedAddress,
      });

      const rowName = selectedRowForEdit.querySelector(".customer-cell h4");
      const rowJoined = selectedRowForEdit.querySelector(".customer-cell span");
      const rowAvatar = selectedRowForEdit.querySelector(".customer-cell img");
      const rowEmail = selectedRowForEdit.querySelector(".contact-cell span");
      const rowPhone = selectedRowForEdit.querySelector(".contact-cell small");
      const rowAddress = selectedRowForEdit.querySelector("td:nth-child(3)");

      if (rowName) {
        rowName.textContent = updatedCustomer['Full Name'] || updatedName;
      }

      if (rowJoined) {
        rowJoined.textContent = `Joined ${updatedCustomer.joined_at || selectedRowForEdit.querySelector('.customer-cell span')?.textContent?.replace('Joined ', '') || 'Unknown'}`;
      }

      if (rowAvatar) {
        rowAvatar.alt = updatedCustomer['Full Name'] || updatedName;
      }

      if (rowEmail) {
        rowEmail.textContent = updatedCustomer.Email || updatedEmail;
      }

      if (rowPhone) {
        rowPhone.textContent = formatPhone(updatedCustomer.Phone || updatedPhone);
      }

      if (rowAddress) {
        rowAddress.textContent = updatedCustomer.address || updatedAddress;
      }

      selectedRowForEdit.dataset.customerEmail = updatedCustomer.Email || updatedEmail;

      if (selectedRowForView === selectedRowForEdit) {
        openModal(selectedRowForEdit);
      }

      applyFilters();

      closeEditModal();
    } catch (error) {
      console.error(error);
      window.alert('Failed to save customer changes.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
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

fetchCustomers();