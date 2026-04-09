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
const bookingCustomer = document.querySelector(
  ".booking-modal__item:nth-child(1) strong"
);
const bookingEmployee = document.querySelector(
  ".booking-modal__item:nth-child(2) strong"
);
const bookingService = document.querySelector(
  ".booking-modal__item:nth-child(3) strong"
);
const bookingDateTime = document.querySelector(
  ".booking-modal__item:nth-child(4) strong"
);
const bookingAddress = document.querySelector(
  ".booking-modal__item--full strong"
);

const SUPABASE_URL =
  window.SUPABASE_URL || "https://erqqqovdprgpfgmueevj.supabase.co";
const SUPABASE_ANON_KEY =
  window.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o";

let scheduleRows = [];
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
      throw new Error(
        errorText || `Supabase request failed with status ${response.status}`
      );
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  });

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getStatusFromRow = (row) => {
  if (row?.is_completed) {
    return "completed";
  }

  if (row?.is_in_progress) {
    return "in-progress";
  }

  if (row?.is_scheduled) {
    return "scheduled";
  }

  return row?.status || "scheduled";
};

const getSafeStatusClass = (status) => {
  const normalizedStatus = String(status || "scheduled").trim().toLowerCase();
  return ["scheduled", "in-progress", "completed"].includes(normalizedStatus)
    ? normalizedStatus
    : "scheduled";
};

const formatScheduleDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });

  return `${formattedDate} • ${formattedTime}`;
};

const setFormValue = (field, value) => {
  if (!field) {
    return;
  }

  const safeValue = String(value ?? "").trim();

  if (field.tagName === "SELECT") {
    const hasOption = Array.from(field.options).some(
      (option) => option.value === safeValue || option.textContent === safeValue
    );

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
  if (!scheduleTableBody) {
    return;
  }

  scheduleTableBody.innerHTML = `
    <tr>
      <td colspan="7">${escapeHtml(message)}</td>
    </tr>
  `;
};

const getScheduleByBookingId = (bookingId) =>
  scheduleRows.find((row) => row.booking_id === bookingId) || null;

const buildScheduledAtValue = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) {
    return null;
  }

  return `${dateValue}T${timeValue}:00+00:00`;
};

const populateServiceOptions = (services = []) => {
  if (!scheduleServiceSelect) {
    return;
  }

  const uniqueServices = [...new Set(
    services
      .map((service) => service?.["Service Name"] ?? service?.service_name ?? "")
      .map((name) => String(name).trim())
      .filter(Boolean)
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
  if (!scheduleEmployeeSelect) {
    return;
  }

  const uniqueEmployees = [...new Set(
    employees
      .map((employee) => employee?.["Full Name"] ?? employee?.full_name ?? "")
      .map((name) => String(name).trim())
      .filter(Boolean)
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
  if (!scheduleServiceSelect) {
    return;
  }

  try {
    const services = await supabaseRequest(
      "/rest/v1/Service?select=Service%20Name&order=Service%20Name.asc",
      {
        method: "GET",
      }
    );

    populateServiceOptions(Array.isArray(services) ? services : []);
  } catch (error) {
    console.error("Failed to load service options:", error);
    scheduleServiceSelect.innerHTML =
      '<option value="">Unable to load services</option>';
  }
};

const loadEmployeeOptions = async () => {
  if (!scheduleEmployeeSelect) {
    return;
  }

  try {
    const employees = await supabaseRequest(
      "/rest/v1/Employee?select=Full%20Name&order=Full%20Name.asc",
      {
        method: "GET",
      }
    );

    populateEmployeeOptions(Array.isArray(employees) ? employees : []);
  } catch (error) {
    console.error("Failed to load employee options:", error);
    scheduleEmployeeSelect.innerHTML =
      '<option value="">Unable to load employees</option>';
  }
};

const persistScheduleUpdate = async (bookingId, payload) => {
  const encodedBookingId = encodeURIComponent(bookingId);
  const updatedRows = await supabaseRequest(
    `/rest/v1/schedule?booking_id=eq.${encodedBookingId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!updatedRows?.length) {
    throw new Error(
      "No rows were updated. This usually means Supabase Row Level Security (RLS) is blocking UPDATE on the schedule table."
    );
  }

  return updatedRows[0];
};

const persistScheduleInsert = async (payload) => {
  const insertedRows = await supabaseRequest("/rest/v1/schedule", {
    method: "POST",
    body: JSON.stringify([payload]),
  });

  if (!insertedRows?.length) {
    throw new Error(
      "No row was inserted. This usually means Supabase Row Level Security (RLS) is blocking INSERT on the schedule table."
    );
  }

  return insertedRows[0];
};

const persistScheduleStatusUpdate = async (bookingId, status) => {
  const normalizedStatus = getSafeStatusClass(status);

  return persistScheduleUpdate(bookingId, {
    is_scheduled: normalizedStatus === "scheduled",
    is_in_progress: normalizedStatus === "in-progress",
    is_completed: normalizedStatus === "completed",
  });
};

const renderScheduleRows = (rows) => {
  if (!scheduleTableBody) {
    return;
  }

  if (!Array.isArray(rows) || !rows.length) {
    renderEmptyState("No schedule data found.");
    return;
  }

  scheduleTableBody.innerHTML = rows
    .map((row) => {
      const bookingId = escapeHtml(row.booking_id || "N/A");
      const customerName = escapeHtml(row.customer_name || "N/A");
      const customerEmail = escapeHtml(row.customer_email || "N/A");
      const serviceType = escapeHtml(row.service_type || "N/A");
      const employeeName = escapeHtml(row.employee_name || "N/A");
      const status = getSafeStatusClass(getStatusFromRow(row));
      const formattedDateTime = escapeHtml(
        formatScheduleDateTime(row.scheduled_at)
      );

      return `
        <tr data-booking-id="${bookingId}">
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
    })
    .join("");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};

const loadSchedules = async () => {
  try {
    const rows = await supabaseRequest(
      "/rest/v1/schedule?select=*&order=scheduled_at.asc",
      {
        method: "GET",
      }
    );

    scheduleRows = Array.isArray(rows) ? rows : [];
    renderScheduleRows(scheduleRows);
  } catch (error) {
    console.error("Failed to load schedule rows:", error);
    renderEmptyState("Unable to load schedule data from Supabase.");
  }
};

const scheduleModal = document.getElementById("scheduleModal");
const modalCloseTriggers = document.querySelectorAll("[data-modal-close]");
const bookingModal = document.getElementById("bookingModal");
const bookingCloseTriggers = document.querySelectorAll("[data-booking-close]");
const bookingStatusBadge = document.querySelector("[data-booking-status]");
const bookingProgressButton = document.querySelector(
  "[data-booking-action='progress']"
);
const bookingActionLabel = document.querySelector("[data-booking-action-label]");
const bookingActions = document.querySelector(".booking-modal__actions");
let bookingActionStep = "scheduled";
let activeBookingRow = null;
let activeScheduleRecord = null;

const openScheduleModal = () => {
  if (!scheduleModal) {
    return;
  }

  scheduleModal.classList.add("active");
  scheduleModal.setAttribute("aria-hidden", "false");
};

const closeScheduleModal = () => {
  if (!scheduleModal) {
    return;
  }

  scheduleModal.classList.remove("active");
  scheduleModal.setAttribute("aria-hidden", "true");
};

const resetScheduleForm = () => {
  setFormValue(scheduleBookingIdInput, "");
  setFormValue(scheduleCustomerInput, "");
  setFormValue(scheduleCustomerEmailInput, "");
  populateServiceOptions(serviceOptions.map((name) => ({ "Service Name": name })));
  setFormValue(scheduleServiceSelect, "");
  populateEmployeeOptions(employeeOptions.map((name) => ({ "Full Name": name })));
  setFormValue(scheduleEmployeeSelect, "");
  setFormValue(scheduleDateInput, "");
  setFormValue(scheduleTimeInput, "");

  if (scheduleForm) {
    delete scheduleForm.dataset.bookingId;
    scheduleForm.dataset.mode = "create";
  }

  if (scheduleModalTitle) {
    scheduleModalTitle.textContent = "New Schedule";
  }

  const submitButton = scheduleForm?.querySelector(".modal-btn.save");
  if (submitButton) {
    submitButton.textContent = "Create Schedule";
  }
};

const openCreateScheduleModal = () => {
  resetScheduleForm();
  openScheduleModal();
};

const openBookingModal = () => {
  if (!bookingModal) {
    return;
  }

  bookingModal.classList.add("active");
  bookingModal.setAttribute("aria-hidden", "false");
};

const closeBookingModal = () => {
  if (!bookingModal) {
    return;
  }

  bookingModal.classList.remove("active");
  bookingModal.setAttribute("aria-hidden", "true");
  activeBookingRow = null;
  activeScheduleRecord = null;
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

  if (activeScheduleRecord) {
    activeScheduleRecord.status = status;
    activeScheduleRecord.is_scheduled = status === "scheduled";
    activeScheduleRecord.is_in_progress = status === "in-progress";
    activeScheduleRecord.is_completed = status === "completed";
  }
};

const populateScheduleModal = (record) => {
  if (!record) {
    return;
  }

  const scheduleDate = record.scheduled_at
    ? new Date(record.scheduled_at)
    : null;

  setFormValue(scheduleBookingIdInput, record.booking_id || "");
  setFormValue(scheduleCustomerInput, record.customer_name || "");
  setFormValue(scheduleCustomerEmailInput, record.customer_email || "");
  setFormValue(scheduleServiceSelect, record.service_type || "");
  setFormValue(scheduleEmployeeSelect, record.employee_name || "");

  if (scheduleDate && !Number.isNaN(scheduleDate.getTime())) {
    const isoString = new Date(record.scheduled_at).toISOString();
    setFormValue(scheduleDateInput, isoString.slice(0, 10));
    setFormValue(scheduleTimeInput, isoString.slice(11, 16));
  } else {
    setFormValue(scheduleDateInput, "");
    setFormValue(scheduleTimeInput, "");
  }

  if (scheduleForm) {
    scheduleForm.dataset.mode = "edit";
    scheduleForm.dataset.bookingId = record.booking_id || "";
  }

  if (scheduleModalTitle) {
    scheduleModalTitle.textContent = "Edit Schedule";
  }

  const submitButton = scheduleForm?.querySelector(".modal-btn.save");
  if (submitButton) {
    submitButton.textContent = "Save Changes";
  }
};

const populateBookingModal = (record) => {
  if (!record) {
    return;
  }

  if (bookingReference) {
    bookingReference.textContent = record.booking_id || "N/A";
  }

  if (bookingCustomer) {
    bookingCustomer.textContent = record.customer_name || "N/A";
  }

  if (bookingEmployee) {
    bookingEmployee.textContent = record.employee_name || "N/A";
  }

  if (bookingService) {
    bookingService.textContent = record.service_type || "N/A";
  }

  if (bookingDateTime) {
    bookingDateTime.textContent = formatScheduleDateTime(record.scheduled_at);
  }

  if (bookingAddress) {
    bookingAddress.textContent = record.customer_email || "No additional details available";
  }
};

const syncScheduleRowInState = (updatedRecord) => {
  if (!updatedRecord?.booking_id) {
    return;
  }

  scheduleRows = scheduleRows.map((row) =>
    row.booking_id === updatedRecord.booking_id ? { ...row, ...updatedRecord } : row
  );
};

const insertScheduleRowInState = (newRecord) => {
  if (!newRecord?.booking_id) {
    return;
  }

  scheduleRows = [...scheduleRows, newRecord].sort((a, b) => {
    const first = new Date(a?.scheduled_at || 0).getTime();
    const second = new Date(b?.scheduled_at || 0).getTime();
    return first - second;
  });
};

const setActionState = (state) => {
  bookingActionStep = state;
  if (!bookingProgressButton || !bookingActionLabel) {
    return;
  }

  bookingProgressButton.classList.remove("in-progress", "completed");

  bookingActions?.classList.remove("single", "completed-only");
  bookingProgressButton.style.display = "inline-flex";

  if (state === "scheduled") {
    bookingActionLabel.textContent = "Mark In Progress";
    bookingProgressButton.classList.remove("ghost");
    bookingProgressButton.classList.add("primary");
    bookingProgressButton.classList.remove("in-progress", "completed");
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
  bookingProgressButton.classList.remove("in-progress", "completed");
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
    if (!actionButton) {
      return;
    }

    event.preventDefault();

    activeBookingRow = actionButton.closest("tr");
    const bookingId = activeBookingRow?.dataset.bookingId || "";
    const record = getScheduleByBookingId(bookingId);

    if (!record) {
      return;
    }

    activeScheduleRecord = record;

    if (actionButton.classList.contains("edit")) {
      populateScheduleModal(record);
      openScheduleModal();
      return;
    }

    if (actionButton.classList.contains("view")) {
      const currentStatus = getSafeStatusClass(getStatusFromRow(record));
      populateBookingModal(record);
      setBookingStatus(currentStatus);

      if (currentStatus === "completed") {
        setActionState("completed");
      } else if (currentStatus === "in-progress") {
        setActionState("in-progress");
      } else {
        setActionState("scheduled");
      }

      openBookingModal();
    }
  });
}

bookingCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeBookingModal);
});

if (bookingProgressButton) {
  bookingProgressButton.addEventListener("click", async () => {
    if (!activeScheduleRecord?.booking_id) {
      closeBookingModal();
      return;
    }

    const originalLabel = bookingActionLabel?.textContent || "Continue";

    try {
      bookingProgressButton.disabled = true;
      if (bookingActionLabel) {
        bookingActionLabel.textContent = "Updating...";
      }

      if (bookingActionStep === "scheduled") {
        const updatedRecord = await persistScheduleStatusUpdate(
          activeScheduleRecord.booking_id,
          "in-progress"
        );
        syncScheduleRowInState(updatedRecord);
        activeScheduleRecord = getScheduleByBookingId(updatedRecord.booking_id);
        setBookingStatus("in-progress");
        renderScheduleRows(scheduleRows);
        activeBookingRow = scheduleTableBody?.querySelector(
          `tr[data-booking-id="${CSS.escape(updatedRecord.booking_id)}"]`
        ) || null;
        setActionState("in-progress");
        return;
      }

      if (bookingActionStep === "in-progress") {
        const updatedRecord = await persistScheduleStatusUpdate(
          activeScheduleRecord.booking_id,
          "completed"
        );
        syncScheduleRowInState(updatedRecord);
        activeScheduleRecord = getScheduleByBookingId(updatedRecord.booking_id);
        setBookingStatus("completed");
        renderScheduleRows(scheduleRows);
        activeBookingRow = scheduleTableBody?.querySelector(
          `tr[data-booking-id="${CSS.escape(updatedRecord.booking_id)}"]`
        ) || null;
        setActionState("completed");
        return;
      }

      closeBookingModal();
    } catch (error) {
      console.error("Failed to update booking status:", error);
      window.alert(
        error?.message || "Unable to update booking status. Please try again."
      );
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
    const bookingId = scheduleBookingIdInput?.value.trim() || scheduleForm.dataset.bookingId || "";

    if (!bookingId) {
      window.alert("Booking ID is required.");
      return;
    }

    if (
      !scheduleCustomerInput?.value.trim() ||
      !scheduleServiceSelect?.value.trim() ||
      !scheduleEmployeeSelect?.value.trim() ||
      !scheduleDateInput?.value ||
      !scheduleTimeInput?.value
    ) {
      window.alert("Please fill in all required schedule fields.");
      return;
    }

    const payload = {
      booking_id: bookingId,
      customer_name: scheduleCustomerInput?.value.trim() || null,
      customer_email: scheduleCustomerEmailInput?.value.trim() || null,
      service_type: scheduleServiceSelect?.value.trim() || null,
      employee_name: scheduleEmployeeSelect?.value.trim() || null,
      scheduled_at: buildScheduledAtValue(
        scheduleDateInput?.value,
        scheduleTimeInput?.value
      ),
    };

    const submitButton = scheduleForm.querySelector(".modal-btn.save");
    const originalButtonText =
      submitButton?.textContent ||
      (formMode === "create" ? "Create Schedule" : "Save Changes");

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent =
          formMode === "create" ? "Creating..." : "Saving...";
      }

      if (formMode === "create") {
        const existingRecord = getScheduleByBookingId(bookingId);
        if (existingRecord) {
          throw new Error("A schedule with this Booking ID already exists.");
        }

        const insertedRecord = await persistScheduleInsert({
          ...payload,
          is_scheduled: true,
          is_in_progress: false,
          is_completed: false,
        });

        insertScheduleRowInState(insertedRecord);
      } else {
        const updatedRecord = await persistScheduleUpdate(bookingId, {
          customer_name: payload.customer_name,
          customer_email: payload.customer_email,
          service_type: payload.service_type,
          employee_name: payload.employee_name,
          scheduled_at: payload.scheduled_at,
        });
        syncScheduleRowInState(updatedRecord);
        activeBookingRow = scheduleTableBody?.querySelector(
          `tr[data-booking-id="${CSS.escape(updatedRecord.booking_id)}"]`
        ) || null;
        activeScheduleRecord = getScheduleByBookingId(updatedRecord.booking_id);
      }

      renderScheduleRows(scheduleRows);

      closeScheduleModal();
      resetScheduleForm();
    } catch (error) {
      console.error("Failed to update schedule record:", error);
      window.alert(
        error?.message ||
          "Unable to save schedule changes. Please try again."
      );
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

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

resetScheduleForm();
loadServiceOptions();
loadEmployeeOptions();
loadSchedules();
})();