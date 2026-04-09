const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const DEFAULT_LOCATION = {
  address: 'Location not available',
  lat: '40.7128',
  lng: '-74.0060',
};

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const dashboard = document.querySelector('.dashboard');
const searchInput = document.getElementById('employeeSearch');
const statusFilter = document.getElementById('statusFilter');
const getEmployeeRows = () => Array.from(document.querySelectorAll('.employee-table tbody tr[data-employee-row="true"]'));
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const addEmployeeModal = document.getElementById('addEmployeeModal');
const addModalCloseBtn = document.getElementById('addModalCloseBtn');
const addCancelBtn = document.getElementById('addCancelBtn');
const addEmployeeForm = document.getElementById('addEmployeeForm');
const addFullNameInput = document.getElementById('addFullName');
const addEmailInput = document.getElementById('addEmail');
const addPhoneInput = document.getElementById('addPhone');
const addRoleInput = document.getElementById('addRole');
const employeeTableBody = document.getElementById('employeeTableBody');
const editEmployeeModal = document.getElementById('editEmployeeModal');
const editModalCloseBtn = document.getElementById('editModalCloseBtn');
const editCancelBtn = document.getElementById('editCancelBtn');
const editEmployeeForm = document.getElementById('editEmployeeForm');
const editFullNameInput = document.getElementById('editFullName');
const editEmailInput = document.getElementById('editEmail');
const editPhoneInput = document.getElementById('editPhone');
const editRoleInput = document.getElementById('editRole');
const editStatusInput = document.getElementById('editStatus');
const locationModal = document.getElementById('locationModal');
const locationModalCloseBtn = document.getElementById('locationModalCloseBtn');
const locationEmployeeAvatar = document.getElementById('locationEmployeeAvatar');
const locationEmployeeName = document.getElementById('locationEmployeeName');
const locationEmployeeRole = document.getElementById('locationEmployeeRole');
const locationAddress = document.getElementById('locationAddress');
const locationLat = document.getElementById('locationLat');
const locationLng = document.getElementById('locationLng');
const locationMapFrame = document.getElementById('locationMapFrame');
const locationMapCoords = document.getElementById('locationMapCoords');
const locationLargeMapLink = document.getElementById('locationLargeMapLink');

let selectedRowForEdit = null;

const getEmployeeIdentifier = (row) => row?.dataset.employeeEmail || row?.dataset.employeeId || '';

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

const syncBodyModalState = () => {
  const hasOpenModal =
    addEmployeeModal?.classList.contains('open') ||
    editEmployeeModal?.classList.contains('open') ||
    locationModal?.classList.contains('open');

  document.body.classList.toggle('modal-open', Boolean(hasOpenModal));
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const formatPhone = (phoneValue) => {
  const digits = String(phoneValue ?? '').replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits[0]} ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return String(phoneValue ?? 'N/A');
};

const normalizeStatus = (statusValue) => {
  if (typeof statusValue === 'string') {
    return statusValue.toLowerCase() === 'inactive' ? 'inactive' : 'active';
  }

  if (typeof statusValue === 'boolean') {
    return statusValue ? 'active' : 'inactive';
  }

  return 'active';
};

const toDms = (decimal, isLat = true) => {
  const absolute = Math.abs(Number(decimal) || 0);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;
  const direction = isLat ? (Number(decimal) >= 0 ? 'N' : 'S') : Number(decimal) >= 0 ? 'E' : 'W';

  return `${degrees}°${String(minutes).padStart(2, '0')}'${seconds.toFixed(1)}"${direction}`;
};

const buildEmployeeActionButtons = (status) => {
  if (status === 'inactive') {
    return `
      <button class="action-btn location" title="Track employee"><i data-lucide="map-pin"></i></button>
      <button class="action-btn edit" title="Edit employee"><i data-lucide="pencil"></i></button>
      <button class="action-btn success" title="Assign employee"><i data-lucide="check"></i></button>
      <button class="action-btn delete" title="Delete employee"><i data-lucide="trash-2"></i></button>
    `;
  }

  return `
    <button class="action-btn location" title="Track employee"><i data-lucide="map-pin"></i></button>
    <button class="action-btn edit" title="Edit employee"><i data-lucide="pencil"></i></button>
    <button class="action-btn assign" title="Unassign employee"><i data-lucide="user-round-x"></i></button>
    <button class="action-btn delete" title="Delete employee"><i data-lucide="trash-2"></i></button>
  `;
};

const renderEmptyState = (message) => {
  if (!employeeTableBody) {
    return;
  }

  employeeTableBody.innerHTML = `
    <tr>
      <td colspan="6">${escapeHtml(message)}</td>
    </tr>
  `;
};

const buildEmployeeRowMarkup = (employee) => {
  const fullName = employee.full_name || 'Unnamed Employee';
  const email = employee.email || 'No email';
  const phone = formatPhone(employee.phone_number);
  const role = employee.role || 'Not Assigned';
  const performance = Number.isFinite(Number(employee.performance_score)) ? Number(employee.performance_score).toFixed(1) : '0.0';
  const jobsDone = Number.isFinite(Number(employee.jobs_completed)) ? Number(employee.jobs_completed) : 0;
  const status = normalizeStatus(employee.status);
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=eff3ff&color=1e3a8a`;

  return `
    <tr
      data-employee-row="true"
      data-employee-id="${escapeHtml(employee.email || fullName)}"
      data-employee-email="${escapeHtml(employee.email || '')}"
      data-status="${status}"
      data-location-address="${DEFAULT_LOCATION.address}"
      data-location-lat="${DEFAULT_LOCATION.lat}"
      data-location-lng="${DEFAULT_LOCATION.lng}"
      data-map-query="${DEFAULT_LOCATION.lat},${DEFAULT_LOCATION.lng}"
    >
      <td>
        <div class="employee-cell">
          <img src="${avatar}" alt="${escapeHtml(fullName)}" />
          <div>
            <h4>${escapeHtml(fullName)}</h4>
            <span>${escapeHtml(email)}</span>
          </div>
        </div>
      </td>
      <td>${escapeHtml(role)}</td>
      <td>${escapeHtml(phone)}</td>
      <td>
        <div class="rating-cell">
          <i data-lucide="star"></i>
          <span>${performance}</span>
          <small>(${jobsDone} jobs)</small>
        </div>
      </td>
      <td><span class="status-pill ${status === 'inactive' ? 'inactive' : 'active'}">${status}</span></td>
      <td>
        <div class="actions">
          ${buildEmployeeActionButtons(status)}
        </div>
      </td>
    </tr>
  `;
};

const renderEmployees = (employees) => {
  if (!employeeTableBody) {
    return;
  }

  if (!employees.length) {
    renderEmptyState('No employees found.');
    return;
  }

  employeeTableBody.innerHTML = employees.map(buildEmployeeRowMarkup).join('');

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  applyFilters();
};

const fetchEmployees = async () => {
  if (!employeeTableBody) {
    return;
  }

  try {
    const employees = await supabaseRequest('/rest/v1/employees?select=*&order=created_at.desc', {
      method: 'GET',
      headers: {
        Prefer: 'return=representation',
      },
    });
    const nonAdminEmployees = employees.filter(
      (employee) => String(employee?.role ?? '').trim().toLowerCase() !== 'admin'
    );
    renderEmployees(nonAdminEmployees);
  } catch (error) {
    console.error(error);
    renderEmptyState('Unable to load employees right now.');
  }
};

const persistEmployeeUpdate = async (identifierEmail, payload) => {
  const encodedEmail = encodeURIComponent(identifierEmail);
  const updatedRows = await supabaseRequest(`/rest/v1/employees?email=eq.${encodedEmail}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!updatedRows?.length) {
    throw new Error('Employee record was not updated.');
  }

  return updatedRows[0];
};

const persistEmployeeDelete = async (identifierEmail) => {
  const encodedEmail = encodeURIComponent(identifierEmail);
  await supabaseRequest(`/rest/v1/employees?email=eq.${encodedEmail}`, {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal',
    },
  });
};

const persistEmployeeInsert = async (payload) => {
  const insertedRows = await supabaseRequest('/rest/v1/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!insertedRows?.length) {
    throw new Error('Employee record was not created.');
  }

  return insertedRows[0];
};

const applyFilters = () => {
  const query = (searchInput?.value || '').trim().toLowerCase();
  const status = statusFilter?.value || 'all';
  const employeeRows = getEmployeeRows();

  employeeRows.forEach((row) => {
    const rowText = row.textContent?.toLowerCase() || '';
    const rowStatus = row.dataset.status || '';

    const matchesSearch = rowText.includes(query);
    const matchesStatus = status === 'all' || status === rowStatus;

    row.style.display = matchesSearch && matchesStatus ? 'table-row' : 'none';
  });
};

const openAddModal = () => {
  if (!addEmployeeModal) {
    return;
  }

  addEmployeeModal.classList.add('open');
  addEmployeeModal.setAttribute('aria-hidden', 'false');
  syncBodyModalState();
};

const closeAddModal = () => {
  if (!addEmployeeModal) {
    return;
  }

  addEmployeeModal.classList.remove('open');
  addEmployeeModal.setAttribute('aria-hidden', 'true');
  syncBodyModalState();
};

const closeEditModal = () => {
  if (!editEmployeeModal) return;
  editEmployeeModal.classList.remove('open');
  editEmployeeModal.setAttribute('aria-hidden', 'true');
  syncBodyModalState();
  selectedRowForEdit = null;
};

const closeLocationModal = () => {
  if (!locationModal) {
    return;
  }

  locationModal.classList.remove('open');
  locationModal.setAttribute('aria-hidden', 'true');
  syncBodyModalState();
};

const openLocationModal = (row) => {
  if (!row || !locationModal) {
    return;
  }

  const name = row.querySelector('.employee-cell h4')?.textContent?.trim() || 'Employee';
  const role = row.querySelector('td:nth-child(2)')?.textContent?.trim() || 'Not Assigned';
  const avatarSrc = row.querySelector('.employee-cell img')?.getAttribute('src') || '';
  const address = row.dataset.locationAddress || DEFAULT_LOCATION.address;
  const latValue = Number.parseFloat(row.dataset.locationLat ?? DEFAULT_LOCATION.lat);
  const lngValue = Number.parseFloat(row.dataset.locationLng ?? DEFAULT_LOCATION.lng);
  const safeLat = Number.isFinite(latValue) ? latValue : Number(DEFAULT_LOCATION.lat);
  const safeLng = Number.isFinite(lngValue) ? lngValue : Number(DEFAULT_LOCATION.lng);
  const mapQuery = row.dataset.mapQuery || `${safeLat},${safeLng}`;

  if (locationEmployeeName) {
    locationEmployeeName.textContent = name;
  }

  if (locationEmployeeRole) {
    locationEmployeeRole.textContent = role;
  }

  if (locationEmployeeAvatar) {
    if (avatarSrc) {
      locationEmployeeAvatar.src = avatarSrc;
    }
    locationEmployeeAvatar.alt = name;
  }

  if (locationAddress) {
    locationAddress.textContent = address;
  }

  if (locationLat) {
    locationLat.textContent = safeLat.toFixed(4);
  }

  if (locationLng) {
    locationLng.textContent = safeLng.toFixed(4);
  }

  if (locationMapCoords) {
    locationMapCoords.textContent = `${toDms(safeLat, true)} ${toDms(safeLng, false)}`;
  }

  if (locationMapFrame) {
    locationMapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;
  }

  if (locationLargeMapLink) {
    locationLargeMapLink.href = `https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`;
  }

  locationModal.classList.add('open');
  locationModal.setAttribute('aria-hidden', 'false');
  syncBodyModalState();
};

const updateRowStatusPill = (row, status) => {
  const statusPill = row?.querySelector('.status-pill');

  if (!statusPill) {
    return;
  }

  statusPill.className = 'status-pill';
  statusPill.classList.add(status === 'inactive' ? 'inactive' : 'active');
  statusPill.textContent = status;
};

const updateEmployeeRowStatus = (row, status) => {
  if (!row) {
    return;
  }

  row.dataset.status = status;
  updateRowStatusPill(row, status);

  const actions = row.querySelector('.actions');
  if (actions) {
    actions.innerHTML = buildEmployeeActionButtons(status);
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
};

const openEditModal = (row) => {
  if (!row) {
    return;
  }

  selectedRowForEdit = row;

  const name = row.querySelector('.employee-cell h4')?.textContent?.trim() ?? '';
  const email = row.querySelector('.employee-cell span')?.textContent?.trim() ?? '';
  const phone = row.querySelector('td:nth-child(3)')?.textContent?.trim() ?? '';
  const role = row.querySelector('td:nth-child(2)')?.textContent?.trim() ?? '';
  const status = row.dataset.status ?? 'active';

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
    editStatusInput.value = status === 'inactive' ? 'inactive' : 'active';
  }

  if (!editEmployeeModal) {
    return;
  }

  editEmployeeModal.classList.add('open');
  editEmployeeModal.setAttribute('aria-hidden', 'false');
  syncBodyModalState();
};

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    dashboard.classList.toggle('collapsed');
  });
}

if (searchInput) {
  searchInput.addEventListener('input', applyFilters);
}

if (statusFilter) {
  statusFilter.addEventListener('change', applyFilters);
}

if (employeeTableBody) {
  employeeTableBody.addEventListener('click', async (event) => {
    const locationButton = event.target.closest('.action-btn.location');
    if (locationButton) {
      const row = locationButton.closest('tr');
      if (!row) {
        return;
      }

      event.stopPropagation();
      openLocationModal(row);
      return;
    }

    const assignButton = event.target.closest('.action-btn.assign');
    if (assignButton) {
      const row = assignButton.closest('tr');
      if (!row) {
        return;
      }

      const employeeName = row.querySelector('.employee-cell h4')?.textContent?.trim() ?? 'this employee';
      const employeeEmail = getEmployeeIdentifier(row);

      if (!employeeEmail) {
        window.alert('Unable to update this employee. Missing email identifier.');
        return;
      }

      const shouldUnassign = window.confirm(`Unassign ${employeeName}? This will set the employee status to inactive.`);

      if (!shouldUnassign) {
        return;
      }

      assignButton.disabled = true;

      try {
        await persistEmployeeUpdate(employeeEmail, { status: false });
        row.dataset.previousStatus = row.dataset.status ?? 'active';
        updateEmployeeRowStatus(row, 'inactive');
        applyFilters();
      } catch (error) {
        console.error(error);
        window.alert('Failed to update employee status.');
      } finally {
        assignButton.disabled = false;
      }
      return;
    }

    const deleteButton = event.target.closest('.action-btn.delete');
    if (deleteButton) {
      const row = deleteButton.closest('tr');
      if (!row) {
        return;
      }

      const employeeName = row.querySelector('.employee-cell h4')?.textContent?.trim() ?? 'this employee';
      const employeeEmail = getEmployeeIdentifier(row);

      if (!employeeEmail) {
        window.alert('Unable to delete this employee. Missing email identifier.');
        return;
      }

      const shouldDelete = window.confirm(`Delete ${employeeName} permanently from the Employee table?`);

      if (!shouldDelete) {
        return;
      }

      deleteButton.disabled = true;

      try {
        await persistEmployeeDelete(employeeEmail);
        if (selectedRowForEdit === row) {
          closeEditModal();
        }
        row.remove();
        if (!getEmployeeRows().length) {
          renderEmptyState('No employees found.');
        } else {
          applyFilters();
        }
      } catch (error) {
        console.error(error);
        window.alert('Failed to delete employee.');
      } finally {
        deleteButton.disabled = false;
      }
      return;
    }

    const successButton = event.target.closest('.action-btn.success');
    if (successButton) {
      const row = successButton.closest('tr');
      if (!row) {
        return;
      }

      const employeeEmail = getEmployeeIdentifier(row);
      if (!employeeEmail) {
        window.alert('Unable to update this employee. Missing email identifier.');
        return;
      }

      successButton.disabled = true;

      const previousStatus = row.dataset.previousStatus;
      const restoredStatus = previousStatus && previousStatus !== 'inactive' ? previousStatus : 'active';

      try {
        await persistEmployeeUpdate(employeeEmail, { status: true });
        updateEmployeeRowStatus(row, restoredStatus);
        delete row.dataset.previousStatus;
        applyFilters();
      } catch (error) {
        console.error(error);
        window.alert('Failed to update employee status.');
      } finally {
        successButton.disabled = false;
      }
      return;
    }

    const editButton = event.target.closest('.action-btn.edit');

    if (!editButton) {
      return;
    }

    const row = editButton.closest('tr');
    if (!row) {
      return;
    }

    event.stopPropagation();
    openEditModal(row);
  });
}

if (editModalCloseBtn) {
  editModalCloseBtn.addEventListener('click', closeEditModal);
}

if (editCancelBtn) {
  editCancelBtn.addEventListener('click', closeEditModal);
}

if (editEmployeeForm) {
  editEmployeeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!selectedRowForEdit) {
      closeEditModal();
      return;
    }

    const updatedName = editFullNameInput?.value.trim() ?? '';
    const updatedEmail = editEmailInput?.value.trim() ?? '';
    const updatedPhone = editPhoneInput?.value.trim() ?? '';
    const updatedRole = editRoleInput?.value.trim() ?? '';
    const updatedStatus = editStatusInput?.value === 'inactive' ? 'inactive' : 'active';
    const identifierEmail = getEmployeeIdentifier(selectedRowForEdit);

    if (!identifierEmail || !updatedName || !updatedEmail || !updatedPhone) {
      window.alert('Full name, email, and phone are required.');
      return;
    }

    const submitButton = editEmployeeForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const updatedEmployee = await persistEmployeeUpdate(identifierEmail, {
        full_name: updatedName,
        email: updatedEmail,
        phone_number: Number(updatedPhone.replace(/\D/g, '')) || updatedPhone,
        role: updatedRole || 'Not Assigned',
        status: updatedStatus === 'active',
      });

      const rowName = selectedRowForEdit.querySelector('.employee-cell h4');
      const rowAvatar = selectedRowForEdit.querySelector('.employee-cell img');
      const rowEmail = selectedRowForEdit.querySelector('.employee-cell span');
      const rowRole = selectedRowForEdit.querySelector('td:nth-child(2)');
      const rowPhone = selectedRowForEdit.querySelector('td:nth-child(3)');
      const ratingValue = selectedRowForEdit.querySelector('.rating-cell span');
      const jobsDoneValue = selectedRowForEdit.querySelector('.rating-cell small');

      if (rowName) {
        rowName.textContent = updatedEmployee.full_name || updatedName;
      }

      if (rowAvatar) {
        const avatarName = updatedEmployee.full_name || updatedName;
        rowAvatar.alt = avatarName;
        rowAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=eff3ff&color=1e3a8a`;
      }

      if (rowEmail) {
        rowEmail.textContent = updatedEmployee.email || updatedEmail;
      }

      if (rowRole) {
        rowRole.textContent = updatedEmployee.role || updatedRole || 'Not Assigned';
      }

      if (rowPhone) {
        rowPhone.textContent = formatPhone(updatedEmployee.phone_number ?? updatedPhone);
      }

      if (ratingValue) {
        ratingValue.textContent = Number.isFinite(Number(updatedEmployee.performance_score))
          ? Number(updatedEmployee.performance_score).toFixed(1)
          : '0.0';
      }

      if (jobsDoneValue) {
        jobsDoneValue.textContent = `(${Number.isFinite(Number(updatedEmployee.jobs_completed)) ? Number(updatedEmployee.jobs_completed) : 0} jobs)`;
      }

      selectedRowForEdit.dataset.employeeId = updatedEmployee.email || updatedEmail;
      selectedRowForEdit.dataset.employeeEmail = updatedEmployee.email || updatedEmail;

      updateEmployeeRowStatus(selectedRowForEdit, normalizeStatus(updatedEmployee.status));
      applyFilters();

      closeEditModal();
    } catch (error) {
      console.error(error);
      window.alert('Failed to save employee changes.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

if (editEmployeeModal) {
  editEmployeeModal.addEventListener('click', (event) => {
    if (event.target === editEmployeeModal) {
      closeEditModal();
    }
  });
}

if (locationModalCloseBtn) {
  locationModalCloseBtn.addEventListener('click', closeLocationModal);
}

if (locationModal) {
  locationModal.addEventListener('click', (event) => {
    if (event.target === locationModal) {
      closeLocationModal();
    }
  });
}

if (addEmployeeBtn) {
  addEmployeeBtn.addEventListener('click', openAddModal);
}

if (addModalCloseBtn) {
  addModalCloseBtn.addEventListener('click', closeAddModal);
}

if (addCancelBtn) {
  addCancelBtn.addEventListener('click', closeAddModal);
}

if (addEmployeeModal) {
  addEmployeeModal.addEventListener('click', (event) => {
    if (event.target === addEmployeeModal) {
      closeAddModal();
    }
  });
}

if (addEmployeeForm) {
  addEmployeeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = addFullNameInput?.value.trim() ?? '';
    const email = addEmailInput?.value.trim() ?? '';
    const phone = addPhoneInput?.value.trim() ?? '';
    const role = addRoleInput?.value.trim() || 'Not Assigned';

    if (!employeeTableBody || !fullName || !email || !phone) {
      return;
    }

    const submitButton = addEmployeeForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const insertedEmployee = await persistEmployeeInsert({
        full_name: fullName,
        email: email,
        phone_number: Number(phone.replace(/\D/g, '')) || phone,
        role: role,
        password_hash: 'temp123',
        performance_score: 0,
        jobs_completed: 0,
        status: true,
      });

      const hasOnlyPlaceholder = !getEmployeeRows().length;
      if (hasOnlyPlaceholder) {
        employeeTableBody.innerHTML = '';
      }

      employeeTableBody.insertAdjacentHTML('afterbegin', buildEmployeeRowMarkup(insertedEmployee));
      addEmployeeForm.reset();
      closeAddModal();
      applyFilters();

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    } catch (error) {
      console.error(error);
      window.alert('Failed to add employee.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (locationModal?.classList.contains('open')) {
      closeLocationModal();
    }

    if (editEmployeeModal?.classList.contains('open')) {
      closeEditModal();
    }

    if (addEmployeeModal?.classList.contains('open')) {
      closeAddModal();
    }
  }
});

if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

fetchEmployees();
