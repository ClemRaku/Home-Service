document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  // DOM Elements
  const statusToggle = document.getElementById("statusToggle");
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");
  const logoutBtn = document.getElementById("logoutBtn");

  // Availability
  const statusButtons = document.querySelectorAll(".status-btn");
  const dayButtons = document.querySelectorAll(".day-btn");
  const saveAvailability = document.getElementById("saveAvailability");

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

  // Status buttons
  statusButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      statusButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Day toggles
  dayButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
    });
  });

  // Save Availability
  saveAvailability.addEventListener("click", () => {
    showToast("Availability settings saved!", "success");
  });

  // Save Notifications
  saveNotifications.addEventListener("click", () => {
    showToast("Notification preferences saved!", "success");
  });

  // Add Payment Method
  addPaymentBtn.addEventListener("click", () => {
    paymentModalOverlay.classList.remove("hidden");
  });

  // Set Primary
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

  // Change Password
  changePasswordBtn.addEventListener("click", () => {
    passwordModalOverlay.classList.remove("hidden");
  });

  // Password form
  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const current = document.getElementById("currentPassword").value;
    const newPw = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (!current || !newPw || !confirm) {
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

    passwordModalOverlay.classList.add("hidden");
    passwordForm.reset();
    showToast("Password updated successfully!", "success");
  });

  // Payment form
  paymentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const type = document.getElementById("paymentType").value;
    const name = document.getElementById("accountName").value;
    const number = document.getElementById("accountNumber").value;

    if (!type || !name || !number) {
      showToast("Please fill in all fields", "warning");
      return;
    }

    // Add new payment method
    const paymentList = document.querySelector(".payment-list");
    const addBtn = document.querySelector(".add-payment-btn");
    const newItem = document.createElement("div");
    newItem.className = "payment-item";

    const typeLabels = { bkash: "bKash", nagad: "Nagad", rocket: "Rocket", bank: "Bank Transfer" };
    const iconClass = type === "bank" ? "bank" : "bkash";
    const iconName = type === "bank" ? "building-2" : "smartphone";

    newItem.innerHTML = `
      <div class="payment-info">
        <div class="payment-icon ${iconClass}">
          <i data-lucide="${iconName}"></i>
        </div>
        <div>
          <span class="payment-name">${typeLabels[type]}</span>
          <span class="payment-type">${typeLabels[type]}</span>
          <span class="payment-detail">${name} · ${number}</span>
        </div>
      </div>
      <button type="button" class="set-primary-btn">Set Primary</button>
    `;

    paymentList.insertBefore(newItem, addBtn);

    // Bind set primary for new item
    const newSetPrimary = newItem.querySelector(".set-primary-btn");
    newSetPrimary.addEventListener("click", () => {
      setPrimaryBtns.forEach((btn) => {
        if (btn.closest(".payment-item") === newItem) {
          btn.click();
        }
      });
    });

    lucide.createIcons();
    paymentModalOverlay.classList.add("hidden");
    paymentForm.reset();
    showToast("Payment method added!", "success");
  });

  // Sign Out All
  signOutAllBtn.addEventListener("click", () => {
    showToast("All other sessions signed out", "success");
  });

  // Sign Out Device
  signOutDeviceBtn.addEventListener("click", () => {
    const device = signOutDeviceBtn.closest(".session-device");
    device.style.transition = "all 0.3s ease";
    device.style.opacity = "0";
    device.style.transform = "translateX(-10px)";
    setTimeout(() => device.remove(), 300);
    showToast("Device signed out", "success");
  });

  // Status toggle
  if (statusToggle) {
    statusToggle.addEventListener("change", () => {
      if (statusToggle.checked) {
        statusDot.style.background = "#4ade80";
        statusLabel.textContent = "Online";
        showToast("You are now Online", "success");
      } else {
        statusDot.style.background = "#ef4444";
        statusLabel.textContent = "Offline";
        showToast("You are now Offline", "warning");
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutModalOverlay.classList.remove("hidden");
    });
  }

  // Modal close handlers
  function setupModalClose(overlay, closeBtn) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("hidden");
    });
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

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      passwordModalOverlay.classList.add("hidden");
      paymentModalOverlay.classList.add("hidden");
      logoutModalOverlay.classList.add("hidden");
    }
  });

  // Toast
  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = "toast";
    const icons = { success: "check-circle", info: "info", warning: "alert-circle" };
    toast.innerHTML = `
      <div class="toast-icon ${type}">
        <i data-lucide="${icons[type] || "info"}"></i>
      </div>
      <div class="toast-content"><p>${message}</p></div>
    `;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => {
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function createToastContainer() {
    const c = document.createElement("div");
    c.id = "toastContainer";
    c.className = "toast-container";
    document.body.appendChild(c);
    return c;
  }
});
