document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  // DOM Elements
  const weekDaysRow = document.getElementById("weekDaysRow");
  const selectedDayTitle = document.getElementById("selectedDayTitle");
  const jobCount = document.getElementById("jobCount");
  const jobCards = document.getElementById("jobCards");
  const weekRange = document.getElementById("weekRange");
  const prevWeekBtn = document.getElementById("prevWeek");
  const nextWeekBtn = document.getElementById("nextWeek");
  const addReminderBtn = document.querySelector(".add-reminder-btn");
  const reminderModalOverlay = document.getElementById("reminderModalOverlay");
  const reminderModalClose = document.getElementById("reminderModalClose");
  const reminderCancel = document.getElementById("reminderCancel");
  const reminderForm = document.getElementById("reminderForm");
  const remindersList = document.querySelector(".reminders-list");
  const statusToggle = document.getElementById("statusToggle");
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModalOverlay = document.getElementById("logoutModalOverlay");
  const logoutModalClose = document.getElementById("logoutModalClose");
  const logoutCancel = document.getElementById("logoutCancel");
  const logoutConfirm = document.getElementById("logoutConfirm");
  const jobModalOverlay = document.getElementById("jobModalOverlay");
  const jobModalClose = document.getElementById("jobModalClose");
  const jobModalTitle = document.getElementById("jobModalTitle");
  const jobModalBody = document.getElementById("jobModalBody");
  const weekOverviewList = document.getElementById("weekOverviewList");

  // Week data
  const weekData = {
    mon: {
      date: "Apr 8",
      fullDate: "Mon, Apr 8",
      jobs: [
        {
          id: "full-house-wiring",
          title: "Full House Wiring Check",
          client: "Jamal Hossain",
          time: "10:00 AM",
          duration: "3h",
          status: "completed",
          description: "Complete wiring check for 3-bedroom house in Gulshan. Tested all circuits and replaced faulty switches.",
          location: "House 45, Road 12, Gulshan, Dhaka",
          phone: "+880 1712-345678",
          price: "৳4,500",
        },
      ],
    },
    tue: {
      date: "Apr 9",
      fullDate: "Tue, Apr 9",
      jobs: [],
    },
    wed: {
      date: "Apr 10",
      fullDate: "Wed, Apr 10",
      jobs: [
        {
          id: "ac-repair",
          title: "AC Repair & Servicing",
          client: "Fatima Begum",
          time: "10:00 AM",
          duration: "2h",
          status: "in-progress",
          description: "AC unit not cooling properly. Diagnosed refrigerant leak and recharged system.",
          location: "Flat 3B, Building A, Dhanmondi, Dhaka",
          phone: "+880 1812-987654",
          price: "৳1,200",
        },
        {
          id: "fan-installation",
          title: "Fan Installation",
          client: "Karim Ahmed",
          time: "2:00 PM",
          duration: "1.5h",
          status: "scheduled",
          description: "Install 3 ceiling fans in living room and bedrooms.",
          location: "House 12, Road 5, Banani, Dhaka",
          phone: "+880 1912-456789",
          price: "৳1,800",
        },
      ],
    },
    thu: {
      date: "Apr 11",
      fullDate: "Thu, Apr 11",
      jobs: [
        {
          id: "circuit-breaker",
          title: "Circuit Breaker Replacement",
          client: "Nasreen Akter",
          time: "9:00 AM",
          duration: "2h",
          status: "scheduled",
          description: "Replace faulty circuit breaker in main distribution board.",
          location: "House 78, Road 22, Uttara, Dhaka",
          phone: "+880 1612-111222",
          price: "৳2,500",
        },
      ],
    },
    fri: {
      date: "Apr 12",
      fullDate: "Fri, Apr 12",
      jobs: [
        {
          id: "led-lighting",
          title: "LED Lighting Installation",
          client: "Rafiq Islam",
          time: "11:00 AM",
          duration: "2.5h",
          status: "scheduled",
          description: "LED lighting installation for living room and kitchen including dimmer switches.",
          location: "House 33, Road 8, Mirpur, Dhaka",
          phone: "+880 1512-333444",
          price: "৳3,200",
        },
      ],
    },
    sat: {
      date: "Apr 13",
      fullDate: "Sat, Apr 13",
      jobs: [],
    },
    sun: {
      date: "Apr 14",
      fullDate: "Sun, Apr 14",
      jobs: [
        {
          id: "smart-home-wiring",
          title: "Smart Home Wiring",
          client: "Sumaiya Rahman",
          time: "10:00 AM",
          duration: "4h",
          status: "scheduled",
          description: "Smart home setup including smart switches, motion sensors, and automated lighting system.",
          location: "House 56, Road 15, Baridhara, Dhaka",
          phone: "+880 1412-555666",
          price: "৳12,000",
        },
      ],
    },
  };

  // Reminders data
  let reminders = [
    { id: 1, title: "Circuit Breaker Replacement", client: "Nasreen Akter", date: "Apr 11", time: "9:00 AM", icon: "zap", iconClass: "circuit" },
    { id: 2, title: "LED Lighting Installation", client: "Rafiq Islam", date: "Apr 12", time: "11:00 AM", icon: "zap", iconClass: "led" },
    { id: 3, title: "Monthly Safety Inspection", client: "Self", date: "Apr 15", time: "8:00 AM", icon: "user", iconClass: "safety" },
    { id: 4, title: "Smart Home Wiring", client: "Sumaiya Rahman", date: "Apr 14", time: "10:00 AM", icon: "zap", iconClass: "smart" },
  ];

  let currentSelectedDay = "wed";

  // Week navigation state
  let weekOffset = 0;

  function getWeekDates(offset) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);

    const dates = [];
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push({
        key: days[i],
        name: dayNames[i],
        number: d.getDate(),
        month: months[d.getMonth()],
        fullDate: `${dayNames[i]}, ${months[d.getMonth()]} ${d.getDate()}`,
        dateStr: `${months[d.getMonth()]} ${d.getDate()}`,
      });
    }
    return dates;
  }

  function updateWeekDisplay() {
    const dates = getWeekDates(weekOffset);
    const firstDate = dates[0];
    const lastDate = dates[6];
    weekRange.textContent = `Week of ${firstDate.dateStr} – ${lastDate.dateStr}, ${lastDate.number > firstDate.number || firstDate.month !== lastDate.month ? lastDate.month : ""} ${lastDate.number > 30 ? "" : "2024"}`;

    document.querySelectorAll(".week-day").forEach((dayEl, index) => {
      const date = dates[index];
      dayEl.setAttribute("data-day", date.key);
      dayEl.setAttribute("data-date", date.dateStr);
      dayEl.querySelector(".day-name").textContent = date.name;
      dayEl.querySelector(".day-number").textContent = date.number;

      // Mark days with jobs
      if (weekData[date.key] && weekData[date.key].jobs.length > 0) {
        dayEl.classList.add("has-jobs");
      } else {
        dayEl.classList.remove("has-jobs");
      }
    });

    // Update week overview
    updateWeekOverview(dates);
  }

  function updateWeekOverview(dates) {
    weekOverviewList.innerHTML = "";

    dates.forEach((date) => {
      const dayData = weekData[date.key];
      const item = document.createElement("div");
      item.className = "overview-item";

      let badgesHtml = "";
      if (dayData && dayData.jobs.length > 0) {
        badgesHtml = dayData.jobs.map((job) =>
          `<span class="overview-badge" data-job="${job.id}" data-day="${date.key}">${job.time} · ${job.title}</span>`
        ).join("");
      } else {
        badgesHtml = `<span class="overview-badge free" data-day="${date.key}">Free</span>`;
      }

      item.innerHTML = `
        <span class="overview-day">${date.name} ${date.number}</span>
        <div class="overview-badges">${badgesHtml}</div>
      `;

      weekOverviewList.appendChild(item);
    });

    // Add click handlers for overview badges
    weekOverviewList.querySelectorAll(".overview-badge:not(.free)").forEach((badge) => {
      badge.addEventListener("click", () => {
        const dayKey = badge.getAttribute("data-day");
        const jobId = badge.getAttribute("data-job");
        selectDayAndShowJob(dayKey, jobId);
      });
    });

    // Click on free day selects that day
    weekOverviewList.querySelectorAll(".overview-badge.free").forEach((badge) => {
      badge.addEventListener("click", () => {
        const dayKey = badge.getAttribute("data-day");
        selectDay(dayKey);
      });
    });
  }

  function selectDay(dayKey) {
    updateDaySelection(dayKey);
    renderDaySchedule(dayKey);
  }

  function selectDayAndShowJob(dayKey, jobId) {
    updateDaySelection(dayKey);
    renderDaySchedule(dayKey);
    // Highlight the specific job card
    setTimeout(() => {
      const jobCard = document.querySelector(`.job-card[data-job="${jobId}"]`);
      if (jobCard) {
        jobCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        jobCard.style.outline = "2px solid #0d9488";
        jobCard.style.outlineOffset = "2px";
        setTimeout(() => {
          jobCard.style.outline = "";
          jobCard.style.outlineOffset = "";
        }, 2000);
      }
    }, 100);
  }

  function updateDaySelection(dayKey) {
    document.querySelectorAll(".week-day").forEach((day) => {
      day.classList.remove("selected");
    });
    const selectedDay = document.querySelector(`[data-day="${dayKey}"]`);
    if (selectedDay) {
      selectedDay.classList.add("selected");
    }
    currentSelectedDay = dayKey;
  }

  function renderDaySchedule(dayKey) {
    const day = weekData[dayKey];
    if (!day) return;

    selectedDayTitle.textContent = day.fullDate;
    jobCount.textContent = day.jobs.length === 1 ? "1 job" : `${day.jobs.length} jobs`;

    jobCards.innerHTML = "";

    if (day.jobs.length === 0) {
      jobCards.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
          <p>No jobs scheduled for this day</p>
        </div>
      `;
      return;
    }

    day.jobs.forEach((job) => {
      const jobCard = document.createElement("div");
      jobCard.className = `job-card ${job.status}`;
      jobCard.setAttribute("data-job", job.id);

      const statusLabel = job.status === "completed"
        ? "Completed"
        : job.status === "in-progress"
        ? "In Progress"
        : "Scheduled";

      jobCard.innerHTML = `
        <div class="job-status-indicator">
          <span class="status-dot"></span>
          <span class="status-label">${statusLabel}</span>
        </div>
        <div class="job-info">
          <h4>${job.title}</h4>
          <p>${job.client}</p>
        </div>
        <div class="job-time">
          <span class="time">${job.time}</span>
          <span class="duration">${job.duration}</span>
        </div>
      `;

      jobCard.addEventListener("click", () => showJobDetail(job));
      jobCards.appendChild(jobCard);
    });

    lucide.createIcons();
  }

  function showJobDetail(job) {
    jobModalTitle.textContent = job.title;

    const statusLabel = job.status === "completed"
      ? "Completed"
      : job.status === "in-progress"
      ? "In Progress"
      : "Scheduled";

    const statusClass = job.status === "completed"
      ? "paid"
      : job.status === "in-progress"
      ? "pending"
      : "pending";

    jobModalBody.innerHTML = `
      <div class="job-detail-content">
        <div class="job-detail-row">
          <span class="job-detail-label">Status</span>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="job-detail-row">
          <span class="job-detail-label">Client</span>
          <span>${job.client}</span>
        </div>
        <div class="job-detail-row">
          <span class="job-detail-label">Time</span>
          <span>${job.time} · ${job.duration}</span>
        </div>
        <div class="job-detail-row">
          <span class="job-detail-label">Location</span>
          <span>${job.location || "N/A"}</span>
        </div>
        <div class="job-detail-row">
          <span class="job-detail-label">Phone</span>
          <span>${job.phone || "N/A"}</span>
        </div>
        <div class="job-detail-row">
          <span class="job-detail-label">Price</span>
          <span class="job-price">${job.price || "N/A"}</span>
        </div>
        ${job.description ? `
        <div class="job-detail-description">
          <span class="job-detail-label">Description</span>
          <p>${job.description}</p>
        </div>
        ` : ""}
      </div>
    `;

    jobModalOverlay.classList.remove("hidden");
    lucide.createIcons();
  }

  function renderReminders() {
    remindersList.innerHTML = "";

    if (reminders.length === 0) {
      remindersList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #9ca3af;">
          <p>No reminders yet</p>
        </div>
      `;
      return;
    }

    reminders.forEach((reminder) => {
      const item = document.createElement("div");
      item.className = "reminder-item";
      item.setAttribute("data-reminder-id", reminder.id);

      item.innerHTML = `
        <div class="reminder-icon ${reminder.iconClass}">
          <i data-lucide="${reminder.icon}"></i>
        </div>
        <div class="reminder-info">
          <h4>${reminder.title}</h4>
          <p>${reminder.client}</p>
          <span>${reminder.date}, ${reminder.time}</span>
        </div>
      `;

      item.addEventListener("click", () => {
        showToast(`Reminder: ${reminder.title} on ${reminder.date} at ${reminder.time}`, "info");
      });

      remindersList.appendChild(item);
    });

    lucide.createIcons();
  }

  function openReminderModal() {
    reminderModalOverlay.classList.remove("hidden");
    document.getElementById("reminderTitle").value = "";
    document.getElementById("reminderClient").value = "";
    document.getElementById("reminderDate").value = "";
    document.getElementById("reminderTime").value = "";
    document.getElementById("reminderTitle").focus();
  }

  function closeReminderModal() {
    reminderModalOverlay.classList.add("hidden");
  }

  function addReminder(title, client, date, time) {
    const newReminder = {
      id: Date.now(),
      title,
      client: client || "Self",
      date,
      time,
      icon: "zap",
      iconClass: "smart",
    };

    reminders.push(newReminder);
    renderReminders();
    closeReminderModal();
    showToast("Reminder added successfully!", "success");
  }

  function openLogoutModal() {
    logoutModalOverlay.classList.remove("hidden");
  }

  function closeLogoutModal() {
    logoutModalOverlay.classList.add("hidden");
  }

  function performLogout() {
    closeLogoutModal();
    showToast("Logging out...", "info");
    setTimeout(() => {
      window.location.href = "../Html/Login.html";
    }, 1000);
  }

  // Toast notification
  function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer") || createToastContainer();

    const toast = document.createElement("div");
    toast.className = "toast";

    const iconMap = {
      success: "check-circle",
      info: "info",
      warning: "alert-circle",
    };

    toast.innerHTML = `
      <div class="toast-icon ${type}">
        <i data-lucide="${iconMap[type] || "info"}"></i>
      </div>
      <div class="toast-content">
        <p>${message}</p>
      </div>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function createToastContainer() {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
    return container;
  }

  // Close modals on overlay click
  function setupModalClose(overlay, closeBtn) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));
    }
  }

  // Event Listeners

  // Day selection
  weekDaysRow.addEventListener("click", (e) => {
    const dayElement = e.target.closest(".week-day");
    if (!dayElement) return;
    const dayKey = dayElement.getAttribute("data-day");
    selectDay(dayKey);
  });

  // Week navigation
  prevWeekBtn.addEventListener("click", () => {
    weekOffset--;
    updateWeekDisplay();
    showToast("Showing previous week", "info");
  });

  nextWeekBtn.addEventListener("click", () => {
    weekOffset++;
    updateWeekDisplay();
    showToast("Showing next week", "info");
  });

  // Add reminder
  if (addReminderBtn) {
    addReminderBtn.addEventListener("click", openReminderModal);
  }

  // Reminder form
  if (reminderForm) {
    reminderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("reminderTitle").value.trim();
      const client = document.getElementById("reminderClient").value.trim();
      const dateVal = document.getElementById("reminderDate").value;
      const timeVal = document.getElementById("reminderTime").value;

      if (!title || !dateVal || !timeVal) {
        showToast("Please fill in all required fields", "warning");
        return;
      }

      // Format date for display
      const dateObj = new Date(dateVal);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}`;

      // Format time for display
      const [hours, minutes] = timeVal.split(":");
      const h = parseInt(hours);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHours = h % 12 || 12;
      const formattedTime = `${displayHours}:${minutes} ${ampm}`;

      addReminder(title, client, formattedDate, formattedTime);
    });
  }

  // Reminder modal close
  setupModalClose(reminderModalOverlay, reminderModalClose);
  if (reminderCancel) {
    reminderCancel.addEventListener("click", closeReminderModal);
  }

  // Job modal close
  setupModalClose(jobModalOverlay, jobModalClose);

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openLogoutModal();
    });
  }

  setupModalClose(logoutModalOverlay, logoutModalClose);
  if (logoutCancel) {
    logoutCancel.addEventListener("click", closeLogoutModal);
  }
  if (logoutConfirm) {
    logoutConfirm.addEventListener("click", performLogout);
  }

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

  // Keyboard support: Escape to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      reminderModalOverlay.classList.add("hidden");
      jobModalOverlay.classList.add("hidden");
      logoutModalOverlay.classList.add("hidden");
    }
  });

  // Initialize
  updateWeekDisplay();
  selectDay(currentSelectedDay);
  renderReminders();
});
