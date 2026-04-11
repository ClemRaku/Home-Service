document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // ==================== Tab Switching ====================
  const tabs = document.querySelectorAll(".tab");
  const overviewTab = document.getElementById("overview-tab");
  const transactionsTab = document.getElementById("transactions-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      if (tab.textContent.trim() === "Overview") {
        overviewTab.classList.remove("hidden");
        transactionsTab.classList.add("hidden");
      } else {
        overviewTab.classList.add("hidden");
        transactionsTab.classList.remove("hidden");
      }
    });
  });

  // ==================== Export Report Dropdown ====================
  const exportBtn = document.getElementById("exportBtn");
  const exportDropdown = document.getElementById("exportDropdown");

  if (exportBtn && exportDropdown) {
    exportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exportDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!exportDropdown.contains(e.target) && e.target !== exportBtn) {
        exportDropdown.classList.add("hidden");
      }
    });

    exportDropdown.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const format = btn.dataset.format;
        exportDropdown.classList.add("hidden");
        handleExport(format);
      });
    });
  }

  function handleExport(format) {
    showToast(
      "success",
      "Export Started",
      `Your ${format.toUpperCase()} report is being generated...`
    );

    // Simulate export delay
    setTimeout(() => {
      showToast("success", "Export Complete", `${format.toUpperCase()} report downloaded successfully`);
    }, 2000);
  }

  // ==================== Status Toggle ====================
  const statusToggle = document.getElementById("statusToggle");
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");

  if (statusToggle) {
    statusToggle.addEventListener("change", () => {
      if (statusToggle.checked) {
        statusDot.style.background = "#4ade80";
        statusLabel.textContent = "Online";
        showToast("success", "Status Updated", "You are now online and available for jobs");
      } else {
        statusDot.style.background = "#ef4444";
        statusLabel.textContent = "Offline";
        showToast("info", "Status Updated", "You are now offline. You won't receive new job requests");
      }
    });
  }

  // ==================== Toast Notification System ====================
  function showToast(type, title, message) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";

    const iconMap = {
      success: "check-circle",
      info: "info",
      warning: "alert-triangle",
    };

    toast.innerHTML = `
      <span class="toast-icon ${type}">
        <i data-lucide="${iconMap[type]}"></i>
      </span>
      <div class="toast-content">
        <p>${title}</p>
        <span>${message}</span>
      </div>
    `;

    container.appendChild(toast);

    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          width: 14,
          height: 14,
        },
      });
    }

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.classList.add("toast-exit");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  // ==================== Stat Cards Detail Modals ====================
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");

  const statModalData = {
    "total-earnings": {
      title: "Total Earnings Breakdown",
      content: `
        <ul class="detail-list">
          <li><span class="label">Total Jobs</span><span class="value">342</span></li>
          <li><span class="label">Average Per Job</span><span class="value teal">৳1,450</span></li>
          <li><span class="label">Highest Single Job</span><span class="value teal">৳12,000</span></li>
          <li><span class="label">Lowest Single Job</span><span class="value">৳500</span></li>
          <li><span class="label">Member Since</span><span class="value">Jan 2022</span></li>
        </ul>
      `,
    },
    "month-earnings": {
      title: "This Month's Earnings",
      content: `
        <ul class="detail-list">
          <li><span class="label">Current Month</span><span class="value teal">৳32,400</span></li>
          <li><span class="label">Last Month</span><span class="value">৳28,750</span></li>
          <li><span class="label">Growth</span><span class="value green">+12.7%</span></li>
          <li><span class="label">Jobs This Month</span><span class="value">28</span></li>
          <li><span class="label">Pending</span><span class="value">৳6,200</span></li>
        </ul>
      `,
    },
    "week-earnings": {
      title: "This Week's Earnings",
      content: `
        <ul class="detail-list">
          <li><span class="label">Current Week</span><span class="value teal">৳8,900</span></li>
          <li><span class="label">Jobs Completed</span><span class="value">4</span></li>
          <li><span class="label">Average Per Job</span><span class="value teal">৳2,225</span></li>
          <li><span class="label">Last Week</span><span class="value">৳7,200</span></li>
          <li><span class="label">Growth</span><span class="value green">+23.6%</span></li>
        </ul>
      `,
    },
    "pending-payout": {
      title: "Pending Payout Details",
      content: `
        <ul class="detail-list">
          <li><span class="label">Total Pending</span><span class="value teal">৳6,200</span></li>
          <li><span class="label">Pending Jobs</span><span class="value">3</span></li>
          <li><span class="label">Oldest Pending</span><span class="value">Apr 10, 2024</span></li>
          <li><span class="label">Expected Payout</span><span class="value green">Apr 15, 2024</span></li>
        </ul>
      `,
    },
    "avg-per-job": {
      title: "Average Per Job Analysis",
      content: `
        <ul class="detail-list">
          <li><span class="label">Overall Average</span><span class="value teal">৳1,450</span></li>
          <li><span class="label">This Month Avg</span><span class="value teal">৳1,620</span></li>
          <li><span class="label">Highest Category Avg</span><span class="value">Smart Home - ৳3,200</span></li>
          <li><span class="label">Lowest Category Avg</span><span class="value">Generator - ৳900</span></li>
        </ul>
      `,
    },
    "best-month": {
      title: "Best Month Details",
      content: `
        <ul class="detail-list">
          <li><span class="label">Best Month</span><span class="value teal">March 2024</span></li>
          <li><span class="label">Earnings</span><span class="value teal">৳32,400</span></li>
          <li><span class="label">Jobs Completed</span><span class="value">31</span></li>
          <li><span class="label">Top Category</span><span class="value">AC Repair - ৳12,500</span></li>
        </ul>
      `,
    },
    "total-jobs": {
      title: "Total Jobs Statistics",
      content: `
        <ul class="detail-list">
          <li><span class="label">Total Jobs</span><span class="value teal">342</span></li>
          <li><span class="label">Completed</span><span class="value green">339</span></li>
          <li><span class="label">In Progress</span><span class="value">3</span></li>
          <li><span class="label">Cancelled</span><span class="value">0</span></li>
          <li><span class="label">Completion Rate</span><span class="value green">99.1%</span></li>
        </ul>
      `,
    },
  };

  document.querySelectorAll(".stat-card.clickable, .mini-card.clickable").forEach((card) => {
    card.addEventListener("click", () => {
      const modalKey = card.dataset.modal;
      const data = statModalData[modalKey];
      if (data) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        modalOverlay.classList.remove("hidden");
      }
    });

    // Keyboard accessibility
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Close stat modal
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modalOverlay.classList.add("hidden");
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.add("hidden");
      }
    });
  }

  // ==================== Chart Bar Tooltips ====================
  const chartTooltip = document.getElementById("chartTooltip");
  const tooltipMonth = document.getElementById("tooltipMonth");
  const tooltipValue = document.getElementById("tooltipValue");

  document.querySelectorAll(".chart-bars .bar").forEach((bar) => {
    bar.addEventListener("mouseenter", (e) => {
      const month = bar.dataset.month;
      const value = bar.dataset.tooltip;
      tooltipMonth.textContent = month;
      tooltipValue.textContent = value;
      chartTooltip.classList.add("visible");
    });

    bar.addEventListener("mousemove", (e) => {
      chartTooltip.style.left = e.clientX - 50 + "px";
      chartTooltip.style.top = e.clientY - 70 + "px";
    });

    bar.addEventListener("mouseleave", () => {
      chartTooltip.classList.remove("visible");
    });
  });

  // ==================== Category Click - Filter Transactions ====================
  const filterIndicator = document.getElementById("filterIndicator");
  const filterText = document.getElementById("filterText");
  const transactionCount = document.getElementById("transactionCount");
  const clearFilter = document.getElementById("clearFilter");

  document.querySelectorAll(".category-item.clickable").forEach((item) => {
    item.addEventListener("click", () => {
      const category = item.dataset.category;

      // Switch to transactions tab
      tabs.forEach((t) => t.classList.remove("active"));
      tabs[1].classList.add("active");
      overviewTab.classList.add("hidden");
      transactionsTab.classList.remove("hidden");

      // Filter the table
      const rows = document.querySelectorAll(".transaction-table tbody tr");
      let visibleCount = 0;

      rows.forEach((row) => {
        const rowCategory = row.dataset.category;
        if (rowCategory === category) {
          row.style.display = "";
          visibleCount++;
        } else {
          row.style.display = "none";
        }
      });

      // Update transaction count
      if (transactionCount) {
        transactionCount.textContent = `${visibleCount} transaction${visibleCount !== 1 ? "s" : ""}`;
      }

      // Show filter indicator
      if (filterIndicator && filterText) {
        filterIndicator.classList.add("active");
        filterText.textContent = category;
      }

      showToast("info", "Filter Applied", `Showing ${category} transactions only`);

      // Scroll to top of transactions
      transactionsTab.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Clear filter
  if (clearFilter) {
    clearFilter.addEventListener("click", () => {
      const rows = document.querySelectorAll(".transaction-table tbody tr");
      rows.forEach((row) => {
        row.style.display = "";
      });

      if (transactionCount) {
        transactionCount.textContent = "8 transactions";
      }

      if (filterIndicator) {
        filterIndicator.classList.remove("active");
      }

      showToast("info", "Filter Cleared", "Showing all transactions");
    });
  }

  // ==================== Transaction Row Click - Job Detail Modal ====================
  const jobModalOverlay = document.getElementById("jobModalOverlay");
  const jobModalTitle = document.getElementById("jobModalTitle");
  const jobModalBody = document.getElementById("jobModalBody");
  const jobModalClose = document.getElementById("jobModalClose");

  document.querySelectorAll(".clickable-row").forEach((row) => {
    row.addEventListener("click", () => {
      const jobName = row.querySelector(".job-name").textContent;
      const client = row.dataset.client;
      const category = row.dataset.category;
      const date = row.dataset.date;
      const amount = row.dataset.amount;
      const status = row.dataset.status;
      const description = row.dataset.description;

      const statusClass = status.toLowerCase() === "paid" ? "paid" : "pending";

      jobModalTitle.textContent = jobName;
      jobModalBody.innerHTML = `
        <div class="job-detail-grid">
          <div class="job-detail-item">
            <div class="detail-label">Client</div>
            <div class="detail-value">${client}</div>
          </div>
          <div class="job-detail-item">
            <div class="detail-label">Category</div>
            <div class="detail-value">${category}</div>
          </div>
          <div class="job-detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${date}</div>
          </div>
          <div class="job-detail-item">
            <div class="detail-label">Amount</div>
            <div class="detail-value" style="color: #0d9488">${amount}</div>
          </div>
        </div>
        <div style="margin-bottom: 16px;">
          <span class="status-badge ${statusClass}" style="font-size: 13px; padding: 6px 14px;">${status}</span>
        </div>
        <div class="job-description">
          <p>${description}</p>
        </div>
      `;

      jobModalOverlay.classList.remove("hidden");

      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  });

  // Close job modal
  if (jobModalClose) {
    jobModalClose.addEventListener("click", () => {
      jobModalOverlay.classList.add("hidden");
    });
  }

  if (jobModalOverlay) {
    jobModalOverlay.addEventListener("click", (e) => {
      if (e.target === jobModalOverlay) {
        jobModalOverlay.classList.add("hidden");
      }
    });
  }

  // ==================== Logout Confirmation ====================
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModalOverlay = document.getElementById("logoutModalOverlay");
  const logoutModalClose = document.getElementById("logoutModalClose");
  const logoutCancel = document.getElementById("logoutCancel");
  const logoutConfirm = document.getElementById("logoutConfirm");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutModalOverlay.classList.remove("hidden");
    });
  }

  function closeLogoutModal() {
    logoutModalOverlay.classList.add("hidden");
  }

  if (logoutModalClose) logoutModalClose.addEventListener("click", closeLogoutModal);
  if (logoutCancel) logoutCancel.addEventListener("click", closeLogoutModal);

  if (logoutModalOverlay) {
    logoutModalOverlay.addEventListener("click", (e) => {
      if (e.target === logoutModalOverlay) {
        closeLogoutModal();
      }
    });
  }

  if (logoutConfirm) {
    logoutConfirm.addEventListener("click", () => {
      showToast("info", "Logging Out", "Redirecting to login page...");
      setTimeout(() => {
        window.location.href = logoutBtn.href;
      }, 1000);
    });
  }

  // ==================== Keyboard Accessibility for Modals ====================
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modalOverlay?.classList.add("hidden");
      jobModalOverlay?.classList.add("hidden");
      logoutModalOverlay?.classList.add("hidden");
    }
  });
});
