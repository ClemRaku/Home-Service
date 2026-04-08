(() => {
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");
const scheduleTableBody = document.getElementById("scheduleTableBody");
const scheduleForm = document.querySelector(".schedule-modal__form");
const scheduleCustomerInput = document.getElementById("scheduleCustomer");
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

  setFormValue(scheduleCustomerInput, record.customer_name || "");
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
    scheduleForm.dataset.bookingId = record.booking_id || "";
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

  bookingActionLabel.textContent = "Cancel";
  bookingProgressButton.classList.remove("primary");
  bookingProgressButton.classList.add("ghost");
  bookingProgressButton.classList.remove("in-progress", "completed");
  bookingActions?.classList.add("single", "completed-only");
};

modalCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeScheduleModal);
});

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

if (scheduleForm) {
  scheduleForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const bookingId = scheduleForm.dataset.bookingId || "";
    if (!bookingId) {
      return;
    }

    const payload = {
      customer_name: scheduleCustomerInput?.value.trim() || null,
      service_type: scheduleServiceSelect?.value.trim() || null,
      employee_name: scheduleEmployeeSelect?.value.trim() || null,
      scheduled_at: buildScheduledAtValue(
        scheduleDateInput?.value,
        scheduleTimeInput?.value
      ),
    };

    const submitButton = scheduleForm.querySelector(".modal-btn.save");
    const originalButtonText = submitButton?.textContent || "Save Changes";

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Saving...";
      }

      const updatedRecord = await persistScheduleUpdate(bookingId, payload);
      syncScheduleRowInState(updatedRecord);
      renderScheduleRows(scheduleRows);

      activeBookingRow = scheduleTableBody?.querySelector(
        `tr[data-booking-id="${CSS.escape(updatedRecord.booking_id)}"]`
      ) || null;
      activeScheduleRecord = getScheduleByBookingId(updatedRecord.booking_id);

      closeScheduleModal();
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

loadSchedules();
})();