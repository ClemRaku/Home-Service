const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");
const searchInput = document.getElementById("employeeSearch");
const statusFilter = document.getElementById("statusFilter");
const getEmployeeRows = () => Array.from(document.querySelectorAll(".employee-table tbody tr"));
const addEmployeeBtn = document.getElementById("addEmployeeBtn");
const addEmployeeModal = document.getElementById("addEmployeeModal");
const addModalCloseBtn = document.getElementById("addModalCloseBtn");
const addCancelBtn = document.getElementById("addCancelBtn");
const addEmployeeForm = document.getElementById("addEmployeeForm");
const addFullNameInput = document.getElementById("addFullName");
const addEmailInput = document.getElementById("addEmail");
const addPhoneInput = document.getElementById("addPhone");
const addRoleInput = document.getElementById("addRole");
const employeeTableBody = document.querySelector(".employee-table tbody");
const editEmployeeModal = document.getElementById("editEmployeeModal");
const editModalCloseBtn = document.getElementById("editModalCloseBtn");
const editCancelBtn = document.getElementById("editCancelBtn");
const editEmployeeForm = document.getElementById("editEmployeeForm");
const editFullNameInput = document.getElementById("editFullName");
const editEmailInput = document.getElementById("editEmail");
const editPhoneInput = document.getElementById("editPhone");
const editRoleInput = document.getElementById("editRole");
const editStatusInput = document.getElementById("editStatus");

let selectedRowForEdit = null;

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    dashboard.classList.toggle("collapsed");
  });
}

const applyFilters = () => {
  const query = (searchInput?.value || "").trim().toLowerCase();
  const status = statusFilter?.value || "all";
  const employeeRows = getEmployeeRows();

  employeeRows.forEach((row) => {
    const rowText = row.textContent?.toLowerCase() || "";
    const rowStatus = row.dataset.status || "";

    const matchesSearch = rowText.includes(query);
    const matchesStatus = status === "all" || status === rowStatus;

    row.style.display = matchesSearch && matchesStatus ? "table-row" : "none";
  });
};

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}

if (statusFilter) {
  statusFilter.addEventListener("change", applyFilters);
}

document.querySelectorAll(".action-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // Placeholder only to mimic dashboard interactions from design.
  });
});

const syncBodyModalState = () => {
  const hasOpenModal =
    addEmployeeModal?.classList.contains("open") ||
    editEmployeeModal?.classList.contains("open");

  document.body.classList.toggle("modal-open", Boolean(hasOpenModal));
};

const openAddModal = () => {
  if (!addEmployeeModal) {
    return;
  }

  addEmployeeModal.classList.add("open");
  addEmployeeModal.setAttribute("aria-hidden", "false");
  syncBodyModalState();
};

const closeAddModal = () => {
  if (!addEmployeeModal) {
    return;
  }

  addEmployeeModal.classList.remove("open");
  addEmployeeModal.setAttribute("aria-hidden", "true");
  syncBodyModalState();
};

const closeEditModal = () => {
  if (!editEmployeeModal) return;
  editEmployeeModal.classList.remove("open");
  editEmployeeModal.setAttribute("aria-hidden", "true");
  syncBodyModalState();
  selectedRowForEdit = null;
};

const updateRowStatusPill = (row, status) => {
  const statusPill = row?.querySelector(".status-pill");

  if (!statusPill) {
    return;
  }

  statusPill.className = "status-pill";
  statusPill.classList.add(status === "inactive" ? "inactive" : "active");
  statusPill.textContent = status;
};

const openEditModal = (row) => {
  if (!row) {
    return;
  }

  selectedRowForEdit = row;

  const name = row.querySelector(".employee-cell h4")?.textContent?.trim() ?? "";
  const email = row.querySelector(".employee-cell span")?.textContent?.trim() ?? "";
  const phone = row.querySelector("td:nth-child(3)")?.textContent?.trim() ?? "";
  const role = row.querySelector("td:nth-child(2)")?.textContent?.trim() ?? "";
  const status = row.dataset.status ?? "active";

  if (editFullNameInput) {
    editFullNameInput.value = name;
  }

  if (editEmailInput) {
    editEmailInput.value = email;
  }

  if (editPhoneInput) {
    editPhoneInput.value = phone;
  }

  if (editRoleInput) {
    editRoleInput.value = role;
  }

  if (editStatusInput) {
    editStatusInput.value = status === "inactive" ? "inactive" : "active";
  }

  if (!editEmployeeModal) {
    return;
  }

  editEmployeeModal.classList.add("open");
  editEmployeeModal.setAttribute("aria-hidden", "false");
  syncBodyModalState();
};

if (employeeTableBody) {
  employeeTableBody.addEventListener("click", (event) => {
    const editButton = event.target.closest(".action-btn.edit");

    if (!editButton) {
      return;
    }

    const row = editButton.closest("tr");
    if (!row) {
      return;
    }

    event.stopPropagation();
    openEditModal(row);
  });
}

if (editModalCloseBtn) {
  editModalCloseBtn.addEventListener("click", closeEditModal);
}

if (editCancelBtn) {
  editCancelBtn.addEventListener("click", closeEditModal);
}

if (editEmployeeForm) {
  editEmployeeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedRowForEdit) {
      closeEditModal();
      return;
    }

    const updatedName = editFullNameInput?.value.trim() ?? "";
    const updatedEmail = editEmailInput?.value.trim() ?? "";
    const updatedPhone = editPhoneInput?.value.trim() ?? "";
    const updatedRole = editRoleInput?.value.trim() ?? "";
    const updatedStatus = editStatusInput?.value === "inactive" ? "inactive" : "active";

    const rowName = selectedRowForEdit.querySelector(".employee-cell h4");
    const rowAvatar = selectedRowForEdit.querySelector(".employee-cell img");
    const rowEmail = selectedRowForEdit.querySelector(".employee-cell span");
    const rowRole = selectedRowForEdit.querySelector("td:nth-child(2)");
    const rowPhone = selectedRowForEdit.querySelector("td:nth-child(3)");

    if (rowName && updatedName) {
      rowName.textContent = updatedName;
    }

    if (rowAvatar && updatedName) {
      rowAvatar.alt = updatedName;
    }

    if (rowEmail && updatedEmail) {
      rowEmail.textContent = updatedEmail;
    }

    if (rowRole && updatedRole) {
      rowRole.textContent = updatedRole;
    }

    if (rowPhone && updatedPhone) {
      rowPhone.textContent = updatedPhone;
    }

    selectedRowForEdit.dataset.status = updatedStatus;
    updateRowStatusPill(selectedRowForEdit, updatedStatus);
    applyFilters();

    closeEditModal();
  });
}

if (editEmployeeModal) {
  editEmployeeModal.addEventListener("click", (event) => {
    if (event.target === editEmployeeModal) {
      closeEditModal();
    }
  });
}

if (addEmployeeBtn) {
  addEmployeeBtn.addEventListener("click", openAddModal);
}

if (addModalCloseBtn) {
  addModalCloseBtn.addEventListener("click", closeAddModal);
}

if (addCancelBtn) {
  addCancelBtn.addEventListener("click", closeAddModal);
}

if (addEmployeeModal) {
  addEmployeeModal.addEventListener("click", (event) => {
    if (event.target === addEmployeeModal) {
      closeAddModal();
    }
  });
}

if (addEmployeeForm) {
  addEmployeeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const fullName = addFullNameInput?.value.trim() ?? "";
    const email = addEmailInput?.value.trim() ?? "";
    const phone = addPhoneInput?.value.trim() ?? "";
    const role = addRoleInput?.value.trim() || "Not Assigned";

    if (!employeeTableBody || !fullName || !email || !phone) {
      closeAddModal();
      return;
    }

    const row = document.createElement("tr");
    row.dataset.status = "active";
    row.innerHTML = `
      <td>
        <div class="employee-cell">
          <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="${fullName}" />
          <div>
            <h4>${fullName}</h4>
            <span>${email}</span>
          </div>
        </div>
      </td>
      <td>${role}</td>
      <td>${phone}</td>
      <td>
        <div class="rating-cell">
          <i data-lucide="star"></i>
          <span>0.0</span>
          <small>(0 jobs)</small>
        </div>
      </td>
      <td><span class="status-pill active">active</span></td>
      <td>
        <div class="actions">
          <button class="action-btn location" title="Track employee"><i data-lucide="map-pin"></i></button>
          <button class="action-btn edit" title="Edit employee"><i data-lucide="pencil"></i></button>
          <button class="action-btn assign" title="Unassign"><i data-lucide="user-round-x"></i></button>
          <button class="action-btn danger" title="Disable"><i data-lucide="ban"></i></button>
        </div>
      </td>
    `;

    employeeTableBody.prepend(row);
    addEmployeeForm.reset();
    closeAddModal();
    applyFilters();

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (editEmployeeModal?.classList.contains("open")) {
      closeEditModal();
    }

    if (addEmployeeModal?.classList.contains("open")) {
      closeAddModal();
    }
  }
});

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}
