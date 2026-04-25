(() => {
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");
const scheduleTableBody = document.getElementById("scheduleTableBody");
const scheduleForm = document.querySelector(".schedule-modal__form");
const newScheduleButton = document.getElementById("newScheduleBtn");
const scheduleModalTitle = document.getElementById("scheduleModalTitle");
const scheduleBookingIdInput = document.getElementById("scheduleBookingId");
const scheduleCustomerInput = document.getElementById("scheduleCustomer");
const scheduleCustomerEmailInput = document.getElementById("scheduleCustomerEmail");
const scheduleServiceSelect = document.getElementById("scheduleService");
const scheduleEmployeeSelect = document.getElementById("scheduleEmployee");
const scheduleDateInput = document.getElementById("scheduleDate");
const scheduleTimeInput = document.getElementById("scheduleTime");
const bookingReference = document.querySelector(".booking-modal__meta strong");
const bookingCustomer = document.querySelector(".booking-modal__item:nth-child(1) strong");
const bookingEmployee = document.querySelector(".booking-modal__item:nth-child(2) strong");
const bookingService = document.querySelector(".booking-modal__item:nth-child(3) strong");
const bookingDateTime = document.querySelector(".booking-modal__item:nth-child(4) strong");
const bookingAddress = document.querySelector(".booking-modal__item--full strong");

const SUPABASE_URL = window.SUPABASE_URL || "https://erqqqovdprgpfgmueevj.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o";

let bookingRows = [];
let serviceOptions = [];
let employeeOptions = [];

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    dashboard.classList.toggle("collapsed");
  });
}

const supabaseRequest =
  window.supabaseRequest ||
  (async (path, options = {}) => {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Supabase request failed with status ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  });

const escapeHtml = (value) =>
  String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const getBookingStatus = (row) => {
  if (row?.status === "completed") return "completed";
  if (row?.status === "in_progress") return "in-progress";
  return "scheduled";
};

const getSafeStatusClass = (status) => {
  const normalizedStatus = String(status || "scheduled").trim().toLowerCase();
  return ["scheduled", "in-progress", "completed"].includes(normalizedStatus) ? normalizedStatus : "scheduled";
};

const formatDateAndTime = (dateStr, timeStr) => {
  const datePart = dateStr ? new Date(dateStr + "T00:00:00") : null;
  if (!datePart || Number.isNaN(datePart.getTime())) return "N/A";

  const formattedDate = datePart.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

  let formattedTime = "N/A";
  if (timeStr) {
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    formattedTime = `${hour12}:${m} ${period}`;
  }

  return `${formattedDate} • ${formattedTime}`;
};

const setFormValue = (field, value) => {
  if (!field) return;
  const safeValue = String(value ?? "").trim();

  if (field.tagName === "SELECT") {
    const hasOption = Array.from(field.options).some((option) => option.value === safeValue || option.textContent === safeValue);
    if (!hasOption && safeValue) {
      const option = document.createElement("option");
      option.value = safeValue;
      option.textContent = safeValue;
      field.appendChild(option);
    }
  }

  field.value = safeValue;
};

const renderEmptyState = (message) => {
  if (!scheduleTableBody) return;
  scheduleTableBody.innerHTML = `<tr><td colspan="7">${escapeHtml(message)}</td></tr>`;
};

const getBookingById = (id) => bookingRows.find((row) => String(row.id) === String(id)) || null;

const populateServiceOptions = (services = []) => {
  if (!scheduleServiceSelect) return;

  const uniqueServices = [...new Set(
    services.map((service) => String(service?.service_name ?? "").trim()).filter(Boolean)
  )];

  serviceOptions = uniqueServices;
  const currentValue = scheduleServiceSelect.value;

  scheduleServiceSelect.innerHTML = '<option value="">Select a service</option>';
  uniqueServices.forEach((serviceName) => {
    const option = document.createElement("option");
    option.value = serviceName;
    option.textContent = serviceName;
    scheduleServiceSelect.appendChild(option);
  });

  if (currentValue && uniqueServices.includes(currentValue)) {
    scheduleServiceSelect.value = currentValue;
  }
};

const populateEmployeeOptions = (employees = []) => {
  if (!scheduleEmployeeSelect) return;

  const uniqueEmployees = [...new Set(
    employees.map((employee) => String(employee?.full_name ?? "").trim()).filter(Boolean)
  )];

  employeeOptions = uniqueEmployees;
  const currentValue = scheduleEmployeeSelect.value;

  scheduleEmployeeSelect.innerHTML = '<option value="">Select an employee</option>';
  uniqueEmployees.forEach((employeeName) => {
    const option = document.createElement("option");
    option.value = employeeName;
    option.textContent = employeeName;
    scheduleEmployeeSelect.appendChild(option);
  });

  if (currentValue && uniqueEmployees.includes(currentValue)) {
    scheduleEmployeeSelect.value = currentValue;
  }
};

const loadServiceOptions = async () => {
  if (!scheduleServiceSelect) return;
  try {
    const services = await supabaseRequest("/rest/v1/services?select=service_name&order=service_name.asc", { method: "GET" });
    populateServiceOptions(Array.isArray(services) ? services : []);
  } catch (error) {
    console.error("Failed to load service options:", error);
    scheduleServiceSelect.innerHTML = '<option value="">Unable to load services</option>';
  }
};

const loadEmployeeOptions = async () => {
  if (!scheduleEmployeeSelect) return;
  try {
    const employees = await supabaseRequest("/rest/v1/employees?select=full_name,email&order=full_name.asc", { method: "GET" });
    employeeOptions = Array.isArray(employees) ? employees : [];
    const currentValue = scheduleEmployeeSelect.value;

    scheduleEmployeeSelect.innerHTML = '<option value="">Select an employee</option>';
    employeeOptions.forEach((emp) => {
      const option = document.createElement("option");
      option.value = emp.full_name || "";
      option.textContent = emp.full_name || "";
      option.dataset.email = emp.email || "";
      scheduleEmployeeSelect.appendChild(option);
    });

    if (currentValue && employeeOptions.some((e) => e.full_name === currentValue)) {
      scheduleEmployeeSelect.value = currentValue;
    }
  } catch (error) {
    console.error("Failed to load employee options:", error);
    scheduleEmployeeSelect.innerHTML = '<option value="">Unable to load employees</option>';
  }
};

const persistBookingUpdate = async (bookingId, payload) => {
  const updatedRows = await supabaseRequest(`/rest/v1/bookings?id=eq.${bookingId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!updatedRows?.length) {
    throw new Error("No rows were updated. RLS may be blocking UPDATE.");
  }

  return updatedRows[0];
};

const persistBookingInsert = async (payload) => {
  const insertedRows = await supabaseRequest("/rest/v1/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!insertedRows?.length) {
    throw new Error("No row was inserted. RLS may be blocking INSERT.");
  }

  return insertedRows[0];
};

const renderBookingRows = (rows) => {
  if (!scheduleTableBody) return;

  if (!Array.isArray(rows) || !rows.length) {
    renderEmptyState("No booking data found.");
    return;
  }

  scheduleTableBody.innerHTML = rows.map((row) => {
    const bookingId = escapeHtml(row.booking_number || "N/A");
    const customerName = escapeHtml(row.customer_name || "N/A");
    const customerEmail = escapeHtml(row.customer_email || "N/A");
    const serviceType = escapeHtml(row.service_name || "N/A");
    const employeeName = escapeHtml(row.employee_name || "Unassigned");
    const status = getSafeStatusClass(getBookingStatus(row));
    const formattedDateTime = escapeHtml(formatDateAndTime(row.scheduled_date, row.start_time));

    return `
      <tr data-booking-id="${escapeHtml(row.id)}">
        <td>${bookingId}</td>
        <td>
          ${customerName}
          <div class="muted">${customerEmail}</div>
        </td>
        <td>${serviceType}</td>
        <td>${employeeName}</td>
        <td>${formattedDateTime}</td>
        <td><span class="status ${status}">${escapeHtml(status)}</span></td>
        <td>
          <div class="actions">
            <button class="action-btn view" type="button" aria-label="View booking details">
              <i data-lucide="eye"></i>
            </button>
            <button class="action-btn edit" type="button" aria-label="Edit booking">
              <i data-lucide="pencil"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (typeof lucide !== "undefined") lucide.createIcons();
};

const loadBookings = async () => {
  try {
    const rows = await supabaseRequest("/rest/v1/bookings?select=*&order=scheduled_date.asc,start_time.asc", { method: "GET" });
    bookingRows = Array.isArray(rows) ? rows : [];

    // Fetch customer names for bookings where customer_name is missing
    const missingEmails = [...new Set(
      bookingRows
        .filter(row => !row.customer_name && row.customer_email)
        .map(row => row.customer_email)
    )];

    if (missingEmails.length > 0) {
      const emailFilters = missingEmails.map(email => `email=eq.${encodeURIComponent(email)}`).join('&');
      try {
        const customers = await supabaseRequest(`/rest/v1/customers?select=full_name,email&${emailFilters}`, { method: "GET" });
        const customerMap = {};
        if (Array.isArray(customers)) {
          customers.forEach(c => { customerMap[c.email] = c.full_name; });
        }
        bookingRows = bookingRows.map(row => {
          if (!row.customer_name && row.customer_email && customerMap[row.customer_email]) {
            return { ...row, customer_name: customerMap[row.customer_email] };
          }
          return row;
        });
      } catch (err) {
        console.warn("Could not fetch customer names:", err);
      }
    }

    // Fetch employee names for bookings where employee_name is missing
    const missingEmployeeEmails = [...new Set(
      bookingRows
        .filter(row => !row.employee_name && row.employee_email)
        .map(row => row.employee_email)
    )];

    if (missingEmployeeEmails.length > 0) {
      const empFilters = missingEmployeeEmails.map(email => `email=eq.${encodeURIComponent(email)}`).join('&');
      try {
        const employees = await supabaseRequest(`/rest/v1/employees?select=full_name,email&${empFilters}`, { method: "GET" });
        const employeeMap = {};
        if (Array.isArray(employees)) {
          employees.forEach(e => { employeeMap[e.email] = e.full_name; });
        }
        bookingRows = bookingRows.map(row => {
          if (!row.employee_name && row.employee_email && employeeMap[row.employee_email]) {
            return { ...row, employee_name: employeeMap[row.employee_email] };
          }
          return row;
        });
      } catch (err) {
        console.warn("Could not fetch employee names:", err);
      }
    }

    renderBookingRows(bookingRows);
  } catch (error) {
    console.error("Failed to load bookings:", error);
    renderEmptyState("Unable to load booking data from Supabase.");
  }
};

const scheduleModal = document.getElementById("scheduleModal");
const modalCloseTriggers = document.querySelectorAll("[data-modal-close]");
const bookingModal = document.getElementById("bookingModal");
const bookingCloseTriggers = document.querySelectorAll("[data-booking-close]");
const bookingStatusBadge = document.querySelector("[data-booking-status]");
const bookingProgressButton = document.querySelector("[data-booking-action='progress']");
const bookingActionLabel = document.querySelector("[data-booking-action-label]");
const bookingActions = document.querySelector(".booking-modal__actions");
let bookingActionStep = "scheduled";
let activeBookingRow = null;
let activeBookingRecord = null;

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

const resetScheduleForm = () => {
  setFormValue(scheduleBookingIdInput, "");
  setFormValue(scheduleCustomerInput, "");
  setFormValue(scheduleCustomerEmailInput, "");
  setFormValue(scheduleServiceSelect, "");
  setFormValue(scheduleEmployeeSelect, "");
  setFormValue(scheduleDateInput, "");
  setFormValue(scheduleTimeInput, "");

  if (scheduleForm) {
    delete scheduleForm.dataset.bookingId;
    scheduleForm.dataset.mode = "create";
  }

  if (scheduleModalTitle) scheduleModalTitle.textContent = "New Booking";

  const submitButton = scheduleForm?.querySelector(".modal-btn.save");
  if (submitButton) submitButton.textContent = "Create Booking";
};

const openCreateScheduleModal = () => {
  resetScheduleForm();
  openScheduleModal();
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
  activeBookingRecord = null;
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

  if (activeBookingRecord) {
    activeBookingRecord.status = status === "in-progress" ? "in_progress" : status;
  }
};

const populateScheduleModal = (record) => {
  if (!record) return;

  setFormValue(scheduleBookingIdInput, record.booking_number || "");
  setFormValue(scheduleCustomerInput, record.customer_name || "");
  setFormValue(scheduleCustomerEmailInput, record.customer_email || "");
  setFormValue(scheduleServiceSelect, record.service_name || "");
  setFormValue(scheduleEmployeeSelect, record.employee_name || "");
  setFormValue(scheduleDateInput, record.scheduled_date || "");

  if (record.start_time) {
    const timeParts = String(record.start_time).split(":");
    setFormValue(scheduleTimeInput, timeParts.slice(0, 2).join(":"));
  } else {
    setFormValue(scheduleTimeInput, "");
  }

  if (scheduleForm) {
    scheduleForm.dataset.mode = "edit";
    scheduleForm.dataset.bookingId = record.id || "";
  }

  if (scheduleModalTitle) scheduleModalTitle.textContent = "Edit Booking";

  const submitButton = scheduleForm?.querySelector(".modal-btn.save");
  if (submitButton) submitButton.textContent = "Save Changes";
};

const populateBookingModal = (record) => {
  if (!record) return;

  if (bookingReference) bookingReference.textContent = `#${record.booking_number || "N/A"}`;
  if (bookingCustomer) bookingCustomer.textContent = record.customer_name || "N/A";
  if (bookingEmployee) bookingEmployee.textContent = record.employee_name || "Unassigned";
  if (bookingService) bookingService.textContent = record.service_name || "N/A";
  if (bookingDateTime) bookingDateTime.textContent = formatDateAndTime(record.scheduled_date, record.start_time);
  if (bookingAddress) bookingAddress.textContent = record.address || record.additional_details || "No additional details available";
};

const syncBookingRowInState = (updatedRecord) => {
  if (!updatedRecord?.id) return;
  bookingRows = bookingRows.map((row) => (String(row.id) === String(updatedRecord.id) ? { ...row, ...updatedRecord } : row));
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

  bookingActionLabel.textContent = "Continue";
  bookingProgressButton.classList.remove("primary");
  bookingProgressButton.classList.add("ghost");
  bookingActions?.classList.add("single", "completed-only");
};

modalCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeScheduleModal);
});

if (newScheduleButton) {
  newScheduleButton.addEventListener("click", () => {
    openCreateScheduleModal();
  });
}

if (scheduleTableBody) {
  scheduleTableBody.addEventListener("click", (event) => {
    const actionButton = event.target.closest(".action-btn");
    if (!actionButton) return;
    event.preventDefault();

    activeBookingRow = actionButton.closest("tr");
    const internalId = activeBookingRow?.dataset.bookingId || "";
    const record = getBookingById(internalId);
    if (!record) return;

    activeBookingRecord = record;

    if (actionButton.classList.contains("edit")) {
      populateScheduleModal(record);
      openScheduleModal();
      return;
    }

    if (actionButton.classList.contains("view")) {
      const currentStatus = getSafeStatusClass(getBookingStatus(record));
      populateBookingModal(record);
      setBookingStatus(currentStatus);

      if (currentStatus === "completed") setActionState("completed");
      else if (currentStatus === "in-progress") setActionState("in-progress");
      else setActionState("scheduled");

      openBookingModal();
    }
  });
}

bookingCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeBookingModal);
});

if (bookingProgressButton) {
  bookingProgressButton.addEventListener("click", async () => {
    if (!activeBookingRecord?.id) {
      closeBookingModal();
      return;
    }

    const originalLabel = bookingActionLabel?.textContent || "Continue";

    try {
      bookingProgressButton.disabled = true;
      if (bookingActionLabel) bookingActionLabel.textContent = "Updating...";

      if (bookingActionStep === "scheduled") {
        const updatedRecord = await persistBookingUpdate(activeBookingRecord.id, { status: "in_progress" });
        syncBookingRowInState(updatedRecord);
        activeBookingRecord = getBookingById(updatedRecord.id);
        setBookingStatus("in-progress");
        renderBookingRows(bookingRows);
        activeBookingRow = scheduleTableBody?.querySelector(`tr[data-booking-id="${CSS.escape(String(updatedRecord.id))}"]`) || null;
        setActionState("in-progress");
        return;
      }

      if (bookingActionStep === "in-progress") {
        const updatedRecord = await persistBookingUpdate(activeBookingRecord.id, { status: "completed" });
        syncBookingRowInState(updatedRecord);
        activeBookingRecord = getBookingById(updatedRecord.id);
        setBookingStatus("completed");
        renderBookingRows(bookingRows);
        activeBookingRow = scheduleTableBody?.querySelector(`tr[data-booking-id="${CSS.escape(String(updatedRecord.id))}"]`) || null;
        setActionState("completed");
        return;
      }

      closeBookingModal();
    } catch (error) {
      console.error("Failed to update booking status:", error);
      window.alert(error?.message || "Unable to update booking status. Please try again.");
      setActionState(bookingActionStep);
    } finally {
      bookingProgressButton.disabled = false;
      if (bookingActionLabel && bookingActionStep === "completed") {
        bookingActionLabel.textContent = "Continue";
      } else if (bookingActionLabel?.textContent === "Updating...") {
        bookingActionLabel.textContent = originalLabel;
      }
    }
  });
}

if (scheduleForm) {
  scheduleForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formMode = scheduleForm.dataset.mode || "edit";
    const bookingInternalId = scheduleForm.dataset.bookingId || "";

    if (!scheduleCustomerInput?.value.trim() || !scheduleServiceSelect?.value.trim() || !scheduleDateInput?.value) {
      window.alert("Customer, service, and date are required.");
      return;
    }

    // Look up employee_email from employee_name
    const selectedEmployeeName = scheduleEmployeeSelect?.value.trim() || "";
    let employeeEmail = null;
    if (selectedEmployeeName) {
      const empMatch = employeeOptions.find((emp) => emp.full_name === selectedEmployeeName);
      if (empMatch) employeeEmail = empMatch.email || null;
    }

    const payload = {
      customer_name: scheduleCustomerInput.value.trim(),
      customer_email: scheduleCustomerEmailInput?.value.trim() || null,
      service_name: scheduleServiceSelect.value.trim(),
      employee_email: employeeEmail || null,
      employee_name: selectedEmployeeName || null,
      scheduled_date: scheduleDateInput.value,
      start_time: scheduleTimeInput?.value ? `${scheduleTimeInput.value}:00` : null,
      end_time: scheduleTimeInput?.value ? (() => {
        const [h, m] = scheduleTimeInput.value.split(":").map(Number);
        const endH = h + 2;
        return `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
      })() : null,
    };

    const submitButton = scheduleForm.querySelector(".modal-btn.save");
    const originalButtonText = submitButton?.textContent || (formMode === "create" ? "Create Booking" : "Save Changes");

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = formMode === "create" ? "Creating..." : "Saving...";
      }

      if (formMode === "create") {
        payload.status = (payload.employee_email && payload.employee_name) ? "upcoming" : "unassigned";
        payload.address = "";
        payload.price = 0;
        payload.additional_details = "";
        const insertedRecord = await persistBookingInsert(payload);
        bookingRows = [...bookingRows, insertedRecord].sort((a, b) => {
          const first = new Date(a?.scheduled_date || 0).getTime();
          const second = new Date(b?.scheduled_date || 0).getTime();
          return first - second;
        });
      } else {
        const updateData = {
          customer_name: payload.customer_name,
          customer_email: payload.customer_email,
          service_name: payload.service_name,
          employee_email: payload.employee_email,
          employee_name: payload.employee_name,
          scheduled_date: payload.scheduled_date,
          start_time: payload.start_time,
        };
        if (payload.employee_email && payload.employee_name) {
          updateData.status = 'upcoming';
        }
        const updatedRecord = await persistBookingUpdate(bookingInternalId, updateData);
        syncBookingRowInState(updatedRecord);
        activeBookingRow = scheduleTableBody?.querySelector(`tr[data-booking-id="${CSS.escape(String(updatedRecord.id))}"]`) || null;
        activeBookingRecord = getBookingById(updatedRecord.id);
      }

      renderBookingRows(bookingRows);
      closeScheduleModal();
      resetScheduleForm();
    } catch (error) {
      console.error("Failed to save booking:", error);
      window.alert(error?.message || "Unable to save changes. Please try again.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeScheduleModal();
    closeBookingModal();
  }
});

if (typeof lucide !== "undefined") lucide.createIcons();

resetScheduleForm();
loadServiceOptions();
loadEmployeeOptions();
loadBookings();
})();
