const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// Get logged-in employee
let authUser = null;
try {
  const raw = localStorage.getItem('hsAuthUser');
  authUser = raw ? JSON.parse(raw) : null;
} catch (e) { /* ignore */ }

if (!authUser || authUser.role !== 'employee') {
  window.location.href = '../Html/Login.html';
}

// Fetch bookings for this employee
async function fetchEmployeeBookings(email) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&employee_email=eq.${encodeURIComponent(email)}`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) { return []; }
}

// Update sidebar monthly earnings
const updateSidebarMonthlyEarnings = async () => {
  if (!authUser || !authUser.email) return;
  const bookings = await fetchEmployeeBookings(authUser.email);
  const el = document.getElementById('sidebarMonthlyEarnings');
  if (!el) return;
  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();
  const completed = bookings.filter(b => b.status === 'completed');
  const thisMonth = completed.filter(b => { const d = new Date(b.completed_at || b.created_at || b.scheduled_date); return d.getMonth() === cm && d.getFullYear() === cy; });
  const total = thisMonth.reduce((s, b) => s + (b.price || 0), 0);
  el.textContent = total >= 1000 ? `৳${(total / 1000).toFixed(0)}k` : `৳${total}`;
};

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  // Update sidebar monthly earnings
  updateSidebarMonthlyEarnings();

  // DOM Elements
  const statusToggle = document.getElementById("statusToggle");
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");
  const logoutBtn = document.getElementById("logoutBtn");
  const sidebarStatusDot = document.querySelector(".status-card .dot");
  const sidebarStatusLabel = document.querySelector(".status-card #statusLabel");

  // Availability
  const statusButtons = document.querySelectorAll(".status-btn");
  const dayButtons = document.querySelectorAll(".day-btn");
  const saveAvailability = document.getElementById("saveAvailability");
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");

  // Notifications
  const saveNotifications = document.getElementById("saveNotifications");

  // Payment
  const addPaymentBtn = document.querySelector(".add-payment-btn");
  const setPrimaryBtns = document.querySelectorAll(".set-primary-btn");

  // Security
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const signOutAllBtn = document.getElementById("signOutAllBtn");
  const signOutDeviceBtn = document.getElementById("signOutDevice");

  // Modals
  const passwordModalOverlay = document.getElementById("passwordModalOverlay");
  const passwordModalClose = document.getElementById("passwordModalClose");
  const passwordCancel = document.getElementById("passwordCancel");
  const passwordForm = document.getElementById("passwordForm");

  const paymentModalOverlay = document.getElementById("paymentModalOverlay");
  const paymentModalClose = document.getElementById("paymentModalClose");
  const paymentCancel = document.getElementById("paymentCancel");
  const paymentForm = document.getElementById("paymentForm");

  const logoutModalOverlay = document.getElementById("logoutModalOverlay");
  const logoutModalClose = document.getElementById("logoutModalClose");
  const logoutCancel = document.getElementById("logoutCancel");
  const logoutConfirm = document.getElementById("logoutConfirm");

  // ── Helpers ──

  // Determine effective status based on working hours and days
  const isWithinWorkingSchedule = () => {
    const now = new Date();
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDay = dayKeys[now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    // Parse working hours
    const [startH, startM] = (startTimeInput.value || '08:00').split(':').map(Number);
    const [endH, endM] = (endTimeInput.value || '20:00').split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Check if today is a working day
    const activeDays = [];
    dayButtons.forEach(btn => {
      if (btn.classList.contains('active')) activeDays.push(btn.dataset.day);
    });

    const isWorkingDay = activeDays.length === 0 ? true : activeDays.includes(currentDay);
    const isWithinHours = currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;

    return isWorkingDay && isWithinHours;
  };

  // Update UI based on availability value
  const updateAvailabilityUI = (availability) => {
    statusButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.status === availability);
    });

    const isOnline = availability === 'available';
    if (sidebarStatusDot && sidebarStatusLabel) {
      sidebarStatusDot.style.background = isOnline ? '#4ade80' : '#ef4444';
      sidebarStatusLabel.textContent = isOnline ? 'Online' : 'Offline';
    }
    if (statusToggle) statusToggle.checked = isOnline;
  };

  // Persist availability to database
  const persistAvailability = async (availability) => {
    if (!authUser || !authUser.email) return false;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/employees?email=eq.${encodeURIComponent(authUser.email)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ availability }),
        }
      );
      return res.ok;
    } catch (err) {
      console.error('Failed to persist availability:', err);
      return false;
    }
  };

  // ── Status buttons click ──
  statusButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      statusButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // ── Day toggles ──
  dayButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  // ── Load employee settings ──
  const loadEmployeeSettings = async () => {
    if (!authUser || !authUser.email) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/employees?select=availability,working_hours,working_days&email=eq.${encodeURIComponent(authUser.email)}`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.length) return;

      const emp = data[0];
      let availability = emp.availability || 'available';

      // Restore working hours
      if (emp.working_hours) {
        try {
          const wh = typeof emp.working_hours === 'string' ? JSON.parse(emp.working_hours) : emp.working_hours;
          if (wh.start) startTimeInput.value = wh.start;
          if (wh.end) endTimeInput.value = wh.end;
        } catch (e) { /* ignore */ }
      }

      // Restore working days
      if (Array.isArray(emp.working_days) && emp.working_days.length > 0) {
        dayButtons.forEach((btn) => {
          btn.classList.toggle('active', emp.working_days.includes(btn.dataset.day));
        });
      }

      // Enforce: if outside working schedule, force offline
      if (!isWithinWorkingSchedule()) {
        availability = 'offline';
        // Persist to database if different
        if (emp.availability !== 'offline') {
          await persistAvailability('offline');
        }
      }

      updateAvailabilityUI(availability);
    } catch (err) {
      console.warn('Could not load employee settings:', err);
    }
  };

  // ── Save Availability ──
  saveAvailability.addEventListener("click", async () => {
    const activeBtn = document.querySelector(".status-btn.active");
    const selectedAvailability = activeBtn ? activeBtn.dataset.status : 'available';

    const workingHours = {
      start: startTimeInput.value || '08:00',
      end: endTimeInput.value || '20:00',
    };

    const workingDays = [];
    dayButtons.forEach((btn) => {
      if (btn.classList.contains('active')) workingDays.push(btn.dataset.day);
    });

    if (!authUser || !authUser.email) return;

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/employees?email=eq.${encodeURIComponent(authUser.email)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            availability: selectedAvailability,
            working_hours: workingHours,
            working_days: workingDays,
          }),
        }
      );

      if (res.ok) {
        updateAvailabilityUI(selectedAvailability);
        showToast("Availability settings saved!", "success");
      } else {
        throw new Error(`Failed (${res.status})`);
      }
    } catch (err) {
      console.error('Failed to save availability:', err);
      showToast("Failed to save availability.", "warning");
    }
  });

  // ── Save Notifications ──
  saveNotifications.addEventListener("click", () => {
    showToast("Notification preferences saved!", "success");
  });

  // ── Payment ──
  addPaymentBtn.addEventListener("click", () => {
    paymentModalOverlay.classList.remove("hidden");
  });

  setPrimaryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const paymentItem = btn.closest(".payment-item");
      document.querySelectorAll(".payment-item").forEach((item) => {
        item.classList.remove("primary");
        const badge = item.querySelector(".payment-badge");
        if (badge) badge.remove();
        const existingBtn = item.querySelector(".set-primary-btn");
        if (existingBtn) existingBtn.style.display = "";
      });
      paymentItem.classList.add("primary");
      const badge = document.createElement("span");
      badge.className = "payment-badge";
      badge.textContent = "Primary";
      btn.replaceWith(badge);
      showToast("Payment method set as primary", "success");
    });
  });

  // ── Password ──
  changePasswordBtn.addEventListener("click", () => {
    passwordModalOverlay.classList.remove("hidden");
  });

  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPw = document.getElementById("currentPassword").value;
    const newPw = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (!currentPw || !newPw || !confirm) {
      showToast("Please fill in all fields", "warning");
      return;
    }
    if (newPw !== confirm) {
      showToast("New passwords do not match", "warning");
      return;
    }
    if (newPw.length < 6) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }

    // Verify current password against Supabase
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/employees?select=password_hash&email=eq.${encodeURIComponent(authUser.email)}`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      if (!data || !data.length) {
        showToast("Employee not found", "warning");
        return;
      }

      const storedPassword = data[0].password_hash || '';
      if (currentPw !== storedPassword) {
        showToast("Current password is incorrect", "warning");
        return;
      }

      // Update password in Supabase
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/employees?email=eq.${encodeURIComponent(authUser.email)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ password_hash: newPw }),
        }
      );

      if (!updateRes.ok) throw new Error(`Failed to update (${updateRes.status})`);

      passwordModalOverlay.classList.add("hidden");
      passwordForm.reset();
      showToast("Password updated successfully!", "success");
    } catch (err) {
      console.error('Password change failed:', err);
      showToast("Failed to update password. Please try again.", "warning");
    }
  });

  // ── Payment form ──
  paymentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = document.getElementById("paymentType").value;
    const name = document.getElementById("accountName").value;
    const number = document.getElementById("accountNumber").value;

    if (!type || !name || !number) {
      showToast("Please fill in all fields", "warning");
      return;
    }

    const paymentList = document.querySelector(".payment-list");
    const addBtn = document.querySelector(".add-payment-btn");
    const newItem = document.createElement("div");
    newItem.className = "payment-item";

    const typeLabels = { bkash: "bKash", nagad: "Nagad", rocket: "Rocket", bank: "Bank Transfer" };
    const iconClass = type === "bank" ? "bank" : "bkash";
    const iconName = type === "bank" ? "building-2" : "smartphone";

    newItem.innerHTML = `
      <div class="payment-info">
        <div class="payment-icon ${iconClass}"><i data-lucide="${iconName}"></i></div>
        <div>
          <span class="payment-name">${typeLabels[type]}</span>
          <span class="payment-type">${typeLabels[type]}</span>
          <span class="payment-detail">${name} · ${number}</span>
        </div>
      </div>
      <button type="button" class="set-primary-btn">Set Primary</button>
    `;

    paymentList.insertBefore(newItem, addBtn);
    newItem.querySelector(".set-primary-btn").addEventListener("click", function () {
      setPrimaryBtns.forEach((b) => { if (b.closest(".payment-item") === newItem) b.click(); });
    });

    lucide.createIcons();
    paymentModalOverlay.classList.add("hidden");
    paymentForm.reset();
    showToast("Payment method added!", "success");
  });

  // ── Security ──
  signOutAllBtn.addEventListener("click", () => showToast("All other sessions signed out", "success"));

  signOutDeviceBtn.addEventListener("click", () => {
    const device = signOutDeviceBtn.closest(".session-device");
    device.style.transition = "all 0.3s ease";
    device.style.opacity = "0";
    device.style.transform = "translateX(-10px)";
    setTimeout(() => device.remove(), 300);
    showToast("Device signed out", "success");
  });

  // ── Status toggle (sidebar) ──
  if (statusToggle) {
    statusToggle.addEventListener("change", () => {
      if (statusToggle.checked) {
        if (isWithinWorkingSchedule()) {
          statusButtons.forEach((b) => b.classList.toggle("active", b.dataset.status === "available"));
          if (sidebarStatusDot) sidebarStatusDot.style.background = "#4ade80";
          if (sidebarStatusLabel) sidebarStatusLabel.textContent = "Online";
          showToast("You are now Online", "success");
        } else {
          statusToggle.checked = false;
          showToast("Cannot go online outside working hours/days", "warning");
        }
      } else {
        statusButtons.forEach((b) => b.classList.toggle("active", b.dataset.status === "offline"));
        if (sidebarStatusDot) sidebarStatusDot.style.background = "#ef4444";
        if (sidebarStatusLabel) sidebarStatusLabel.textContent = "Offline";
        showToast("You are now Offline", "warning");
      }
    });
  }

  // ── Logout ──
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutModalOverlay.classList.remove("hidden");
    });
  }

  // ── Modal helpers ──
  function setupModalClose(overlay, closeBtn) {
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.add("hidden"); });
    if (closeBtn) closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));
  }

  setupModalClose(passwordModalOverlay, passwordModalClose);
  setupModalClose(paymentModalOverlay, paymentModalClose);
  setupModalClose(logoutModalOverlay, logoutModalClose);

  passwordCancel.addEventListener("click", () => passwordModalOverlay.classList.add("hidden"));
  paymentCancel.addEventListener("click", () => paymentModalOverlay.classList.add("hidden"));
  logoutCancel.addEventListener("click", () => logoutModalOverlay.classList.add("hidden"));
  logoutConfirm.addEventListener("click", () => {
    logoutModalOverlay.classList.add("hidden");
    showToast("Logging out...", "info");
    setTimeout(() => { window.location.href = "../Html/Login.html"; }, 1000);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      passwordModalOverlay.classList.add("hidden");
      paymentModalOverlay.classList.add("hidden");
      logoutModalOverlay.classList.add("hidden");
    }
  });

  // ── Toast ──
  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = "toast";
    const icons = { success: "check-circle", info: "info", warning: "alert-circle" };
    toast.innerHTML = `<div class="toast-icon ${type}"><i data-lucide="${icons[type] || "info"}"></i></div><div class="toast-content"><p>${message}</p></div>`;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => { toast.classList.add("toast-exit"); setTimeout(() => toast.remove(), 300); }, 3000);
  }

  function createToastContainer() {
    const c = document.createElement("div");
    c.id = "toastContainer";
    c.className = "toast-container";
    document.body.appendChild(c);
    return c;
  }

  // ── Init ──
  loadEmployeeSettings();

  // ── Auto-check every 30 seconds: force offline if outside working schedule ──
  setInterval(async () => {
    const withinSchedule = isWithinWorkingSchedule();
    const activeBtn = document.querySelector('.status-btn.active');
    const currentStatus = activeBtn ? activeBtn.dataset.status : 'available';

    if (!withinSchedule && currentStatus !== 'offline') {
      // Force offline in UI
      updateAvailabilityUI('offline');
      // Persist to database
      await persistAvailability('offline');
      showToast('Outside working hours/days — status set to Offline', 'info');
    }
  }, 30000);
});
