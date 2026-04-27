const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// Get logged-in employee from localStorage
const authUser = JSON.parse(localStorage.getItem('hsAuthUser'));

if (!authUser || authUser.role !== 'employee') {
  window.location.href = 'Login.html';
}

// Fetch employee data from Supabase
async function fetchEmployeeData(email) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=*&email=eq.${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch employee data');

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return null;
  }
}

// Fetch bookings for this employee
async function fetchEmployeeBookings(email) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&employee_email=eq.${encodeURIComponent(email)}&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch bookings');

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

// Sync sidebar status from availability database column
async function syncSidebarStatus(email) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=availability&email=eq.${encodeURIComponent(email)}`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.length) return;
    const availability = data[0].availability || 'available';
    const isOnline = availability === 'available';
    const dot = document.getElementById('statusDot');
    const label = document.getElementById('statusLabel');
    const toggle = document.getElementById('statusToggle');
    if (dot) dot.style.background = isOnline ? '#4ade80' : '#ef4444';
    if (label) label.textContent = isOnline ? 'Online' : 'Offline';
    if (toggle) toggle.checked = isOnline;
  } catch (err) { console.warn('Could not sync sidebar status:', err); }
}

// Update sidebar with employee info
function updateSidebar(employee, bookings = []) {
  const workerAvatar = document.querySelector('.worker-avatar');
  const workerRole = document.querySelector('.worker-card h2');

  if (workerAvatar && employee.full_name) {
    workerAvatar.textContent = employee.full_name.charAt(0).toUpperCase();
  }
  if (workerRole && employee.role) {
    workerRole.textContent = employee.role;
  }

  // Update monthly earnings in sidebar
  const sidebarMonthlyEarnings = document.getElementById('sidebarMonthlyEarnings');
  if (sidebarMonthlyEarnings) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const thisMonthBookings = completedBookings.filter(b => {
      const d = new Date(b.completed_at || b.created_at || b.scheduled_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthEarnings = thisMonthBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    if (monthEarnings >= 1000) {
      sidebarMonthlyEarnings.textContent = `৳${(monthEarnings / 1000).toFixed(0)}k`;
    } else {
      sidebarMonthlyEarnings.textContent = `৳${monthEarnings}`;
    }
  }
}

// Format date helpers
function formatDate(dateStr, timeStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  let dateLabel;
  if (isToday) dateLabel = 'Today';
  else if (isTomorrow) dateLabel = 'Tomorrow';
  else dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (timeStr) {
    const time = new Date(`1970-01-01T${timeStr}`);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${dateLabel}, ${displayHours}:${displayMinutes} ${ampm}`;
  }

  return dateLabel;
}

function calcDuration(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0 && minutes > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${minutes} min`;
}

// Generate job card HTML from booking
function renderJobCards(bookings) {
  const jobsList = document.querySelector('.jobs-list');
  if (!jobsList) return;

  // Clear static cards
  jobsList.innerHTML = '';

  if (bookings.length === 0) {
    jobsList.innerHTML = '<p style="text-align:center;color:#5a6675;padding:40px;">No jobs assigned yet.</p>';
    updateFilterCounts({});
    updateStatsCounts({});
    return;
  }

  const statusMap = {
    'upcoming': 'scheduled',
    'in_progress': 'in-progress',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };

  const priorityLabels = { high: 'High', normal: 'Normal' };
  const priorityMap = { high: 'high', in_progress: 'normal', scheduled: 'normal', completed: 'normal', cancelled: 'normal' };

  bookings.forEach(booking => {
    const status = statusMap[booking.status] || 'scheduled';
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
    const priority = booking.status === 'upcoming' || booking.status === 'in_progress' ? 'high' : 'normal';
    const priorityLabel = priorityLabels[priority];
    const dateLabel = formatDate(booking.scheduled_date, booking.start_time);
    const duration = calcDuration(booking.start_time, booking.end_time);

    const card = document.createElement('article');
    card.className = 'job-card';
    card.dataset.status = status;
    card.dataset.bookingId = booking.id;

    const showDetailsButton = status === 'scheduled' ? `
      <button class="btn outline view-details"
        data-state="${status}"
        data-title="${booking.service_name || 'Service'}"
        data-client="${booking.customer_name || 'Customer'}"
        data-status="${status}"
        data-status-label="${statusLabel}"
        data-priority="${priority}"
        data-priority-label="${priorityLabel}"
        data-date="${dateLabel}"
        data-duration="${duration || '-'}"
        data-distance="-"
        data-location="${booking.address || '-'}"
        data-price="৳${booking.price || 0}"
        data-service="${booking.service_name || '-'}"
        data-phone="-"
        data-note="${booking.additional_details || 'No notes.'}">
        View Details
      </button>
    ` : '';

    const markDoneButton = status === 'in-progress' ? `
      <button class="btn primary status-toggle" data-state="in-progress">Mark Done</button>
    ` : '';

    const actionButton = markDoneButton || showDetailsButton;

    // Status edit dropdown
    const statusEditDropdown = `
      <select class="status-edit" data-booking-id="${booking.id}" data-current-status="${status}">
        <option value="in-progress" ${status === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="scheduled" ${status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
        <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
        <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
    `;

    card.innerHTML = `
      <div class="job-main">
        <div class="avatar-placeholder">${(booking.customer_name || 'C').charAt(0).toUpperCase()}</div>
        <div class="job-info">
          <h3>${booking.service_name || 'Service'}</h3>
          <span class="job-client">${booking.customer_name || 'Customer'}</span>
          <ul class="job-meta">
            <li><i data-lucide="map-pin"></i>${booking.address || '-'}</li>
            <li><i data-lucide="calendar"></i>${dateLabel}</li>
            ${duration ? `<li><i data-lucide="clock"></i>${duration}</li>` : ''}
          </ul>
        </div>
      </div>
      <div class="job-actions">
        <div class="badges">
          <span class="badge ${priority}">${priorityLabel}</span>
          <span class="badge ${status}">${statusLabel}</span>
        </div>
        <div class="price">
          ৳${booking.price || 0}
          <span>${booking.service_name || 'Service'}</span>
        </div>
        ${actionButton}
        <div class="status-edit-wrap">
          ${statusEditDropdown}
        </div>
      </div>
    `;

    jobsList.appendChild(card);
  });

  // Reinitialize lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Update counts
  updateFilterCounts(bookings, statusMap);
  updateStatsCounts(bookings, statusMap);
}

function updateFilterCounts(bookings, statusMap) {
  const counts = { all: 0, 'in-progress': 0, scheduled: 0, completed: 0, cancelled: 0 };
  Object.values(statusMap || {}).forEach(s => { if (counts[s] !== undefined) counts[s] = 0; });

  bookings.forEach(b => {
    const s = statusMap[b.status] || 'scheduled';
    counts.all++;
    if (counts[s] !== undefined) counts[s]++;
  });

  document.querySelectorAll('.filter-pill').forEach(pill => {
    const filter = pill.dataset.filter;
    const span = pill.querySelector('span');
    if (span && counts[filter] !== undefined) {
      span.textContent = counts[filter];
    }
  });
}

function updateStatsCounts(bookings, statusMap) {
  const counts = { total: 0, 'in-progress': 0, scheduled: 0, completed: 0 };
  bookings.forEach(b => {
    const s = statusMap ? statusMap[b.status] : b.status;
    counts.total++;
    if (counts[s] !== undefined) counts[s]++;
  });

  const statCards = document.querySelectorAll('.summary-card h2');
  if (statCards.length >= 4) {
    statCards[0].textContent = counts.total;
    statCards[1].textContent = counts['in-progress'];
    statCards[2].textContent = counts.scheduled;
    statCards[3].textContent = counts.completed;
  }
}

// Attach event listeners after dynamic render
function attachJobEvents() {
  const filterButtons = document.querySelectorAll(".filter-pill");
  const modal = document.getElementById("jobModal");
  const modalClose = document.querySelector(".modal-close");
  const modalSecondary = document.querySelector(".modal-secondary");
  const modalTitle = document.getElementById("modalTitle");
  const modalClient = document.getElementById("modalClient");
  const modalDate = document.getElementById("modalDate");
  const modalDuration = document.getElementById("modalDuration");
  const modalDistance = document.getElementById("modalDistance");
  const modalService = document.getElementById("modalService");
  const modalLocation = document.getElementById("modalLocation");
  const modalPhone = document.getElementById("modalPhone");
  const modalPrice = document.getElementById("modalPrice");
  const modalPriority = document.getElementById("modalPriority");
  const modalPriorityText = document.getElementById("modalPriorityText");
  const modalStatus = document.getElementById("modalStatus");
  const modalNote = document.getElementById("modalNote");
  const modalPrimary = document.querySelector(".modal-primary");
  let activeJobButton = null;

  const setBadgeStyles = (badge, type) => {
    badge.className = "badge";
    if (type) badge.classList.add(type);
  };

  const openModal = (button) => {
    activeJobButton = button;
    modalTitle.textContent = button.dataset.title || "Job Details";
    modalClient.textContent = button.dataset.client || "";
    modalDate.textContent = button.dataset.date || "-";
    modalDuration.textContent = button.dataset.duration || "-";
    modalDistance.textContent = button.dataset.distance || "-";
    modalService.textContent = button.dataset.service || "-";
    modalLocation.textContent = button.dataset.location || "-";
    modalPhone.textContent = button.dataset.phone || "-";
    modalPrice.textContent = button.dataset.price || "-";
    modalNote.textContent = button.dataset.note || "-";

    const priorityType = button.dataset.priority || "normal";
    const priorityLabel = button.dataset.priorityLabel || "Normal";
    const statusType = button.dataset.status || "scheduled";
    const statusLabel = button.dataset.statusLabel || "Scheduled";

    modalPriority.textContent = priorityLabel;
    modalPriorityText.textContent = priorityLabel;
    modalStatus.textContent = statusLabel;

    setBadgeStyles(modalPriority, priorityType);
    setBadgeStyles(modalStatus, statusType);

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    if (modalPrimary) {
      const state = button.dataset.state || "scheduled";
      if (state === "completed") {
        modalPrimary.textContent = "Completed";
        modalPrimary.disabled = true;
      } else {
        modalPrimary.disabled = false;
        modalPrimary.textContent = state === "in-progress" ? "Mark Done" : "Start Job";
      }
    }
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  let servicePrices = {};
  let packageData = {};

  const loadPriceData = async () => {
    try {
      const sRes = await fetch(`${SUPABASE_URL}/rest/v1/services?select=service_name,price`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      });
      const services = await sRes.json();
      if (Array.isArray(services)) {
        services.forEach(s => { servicePrices[s.service_name] = s.price; });
      }

      const pkgRes = await fetch(`${SUPABASE_URL}/rest/v1/packages?select=package_name,price`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      });
      const pkgs = await pkgRes.json();

      const psRes = await fetch(`${SUPABASE_URL}/rest/v1/package_services?select=package_name,service_name`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      });
      const ps = await psRes.json();

      const serviceCounts = {};
      ps.forEach(item => {
        serviceCounts[item.package_name] = (serviceCounts[item.package_name] || 0) + 1;
      });

      if (Array.isArray(pkgs)) {
        pkgs.forEach(pkg => {
          pkg.serviceCount = serviceCounts[pkg.package_name] || 1;
          packageData[pkg.package_name] = pkg;
        });
      }
    } catch (err) { console.warn("Could not load price data:", err); }
  };

  const calculateBookingPrice = (booking) => {
    if (booking.price > 0) return booking.price;
    const details = booking.additional_details || '';
    const packageMatch = details.match(/Package:\s*([^.]+)/i);
    if (packageMatch) {
      const pkgName = packageMatch[1].trim();
      const pkg = packageData[pkgName];
      if (pkg) return pkg.price / pkg.serviceCount;
    }
    return servicePrices[booking.service_name] || 0;
  };

  const deductCustomerWallet = async (customerEmail, amount) => {
    if (!customerEmail || amount <= 0) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=wallet_balance&email=eq.${encodeURIComponent(customerEmail)}`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      });
      const customers = await res.json();
      if (!customers || !customers.length) return;
      const newBalance = (customers[0].wallet_balance || 0) - amount;
      await fetch(`${SUPABASE_URL}/rest/v1/customers?email=eq.${encodeURIComponent(customerEmail)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ wallet_balance: newBalance })
      });
      console.log(`Deducted ৳${amount} from ${customerEmail}`);
    } catch (err) { console.error("Wallet deduction failed:", err); }
  };

  const updateJobCard = async ({
    status,
    statusLabel,
    badgeClass,
    buttonText,
    buttonClass,
  }) => {
    if (!activeJobButton) return;
    const card = activeJobButton.closest(".job-card");
    const bookingId = card?.dataset.bookingId;
    const statusBadge = card?.querySelector(".badge.scheduled, .badge.in-progress, .badge.completed");

    // Update UI
    if (statusBadge) {
      statusBadge.textContent = statusLabel;
      statusBadge.className = `badge ${badgeClass}`;
    }
    if (card) card.dataset.status = status;

    // Update booking status in Supabase
    if (bookingId) {
      const dbStatus = { 'completed': 'completed', 'in-progress': 'in_progress', 'scheduled': 'upcoming', 'cancelled': 'cancelled' }[status] || status;
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}&select=*`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              Prefer: 'return=representation'
            },
            body: JSON.stringify({ status: dbStatus }),
          }
        );

        if (dbStatus === 'completed') {
          const rows = await response.json();
          if (rows && rows.length > 0) {
            const booking = rows[0];
            const price = calculateBookingPrice(booking);
            if (booking.customer_email && price > 0) {
              await deductCustomerWallet(booking.customer_email, price);
            }
          }
        }
      } catch (err) {
        console.error('Failed to update booking status:', err);
      }
    }

    modalStatus.textContent = statusLabel;
    setBadgeStyles(modalStatus, badgeClass);
    if (modalPrimary) {
      modalPrimary.textContent = buttonText;
      modalPrimary.disabled = status === "completed";
    }
  };
  // Filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const filter = button.dataset.filter;
      document.querySelectorAll(".job-card").forEach((card) => {
        const status = card.dataset.status;
        if (filter === "all" || status === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // View Details buttons
  document.querySelectorAll(".view-details").forEach((button) => {
    button.addEventListener("click", () => {
      const state = button.dataset.state || "scheduled";
      if (state === "in-progress") {
        activeJobButton = button;
        updateJobCard({
          status: "completed",
          statusLabel: "Completed",
          badgeClass: "completed",
          buttonText: "Completed",
          buttonClass: "outline",
        });
        return;
      }
      if (state === "completed") return;
      openModal(button);
    });
  });

  // Mark Done buttons
  document.querySelectorAll(".status-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      activeJobButton = button;
      updateJobCard({
        status: "completed",
        statusLabel: "Completed",
        badgeClass: "completed",
        buttonText: "Completed",
        buttonClass: "outline",
      });
    });
  });

  // Status edit dropdowns
  document.querySelectorAll(".status-edit").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const newStatus = e.target.value;
      const bookingId = e.target.dataset.bookingId;
      const card = e.target.closest(".job-card");
      const statusBadge = card?.querySelector(".badges .badge:last-child");

      const statusLabels = {
        'in-progress': 'In Progress',
        'scheduled': 'Scheduled',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      };

      // Update badge
      if (statusBadge) {
        statusBadge.textContent = statusLabels[newStatus];
        statusBadge.className = `badge ${newStatus}`;
      }
      if (card) card.dataset.status = newStatus;

      // Update Supabase
      if (bookingId) {
        const dbStatus = { 'completed': 'completed', 'in-progress': 'in_progress', 'scheduled': 'upcoming', 'cancelled': 'cancelled' }[newStatus] || newStatus;
        try {
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}&select=*`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                Prefer: 'return=representation'
              },
              body: JSON.stringify({ status: dbStatus }),
            }
          );

          if (dbStatus === 'completed') {
            const rows = await response.json();
            if (rows && rows.length > 0) {
              const booking = rows[0];
              const price = calculateBookingPrice(booking);
              if (booking.customer_email && price > 0) {
                await deductCustomerWallet(booking.customer_email, price);
              }
            }
          }
          // Refresh stats
          const bookings = await fetchEmployeeBookings(authUser.email);
          const statusMap = { 'upcoming': 'scheduled', 'in_progress': 'in-progress', 'completed': 'completed', 'cancelled': 'cancelled' };
          updateFilterCounts(bookings, statusMap);
          updateStatsCounts(bookings, statusMap);
        } catch (err) {
          console.error('Failed to update booking status:', err);
          alert('Failed to update status. Please try again.');
        }
      }
    });
  });

  // Modal close
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalSecondary) modalSecondary.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
  }

  // Modal primary button (Start Job / Mark Done)
  if (modalPrimary) {
    modalPrimary.addEventListener("click", async () => {
      if (!activeJobButton) return;
      const currentState = activeJobButton.dataset.state || "scheduled";

      if (currentState === "scheduled") {
        await updateJobCard({
          status: "in-progress",
          statusLabel: "In Progress",
          badgeClass: "in-progress",
          buttonText: "Mark Done",
          buttonClass: "primary",
        });
        closeModal();
      } else if (currentState === "in-progress") {
        await updateJobCard({
          status: "completed",
          statusLabel: "Completed",
          badgeClass: "completed",
          buttonText: "Completed",
          buttonClass: "outline",
        });
        closeModal();
      }
    });
  }
}

// Main init
document.addEventListener("DOMContentLoaded", async () => {
  await loadPriceData();
  let bookings = [];
  if (authUser && authUser.email) {
    await syncSidebarStatus(authUser.email);
    const employee = await fetchEmployeeData(authUser.email);
    bookings = await fetchEmployeeBookings(authUser.email);
    if (employee) {
      updateSidebar(employee, bookings);
      console.log('Employee data loaded:', employee);
    } else {
      console.error('Employee not found in database');
    }

    // Fetch and render bookings
    renderJobCards(bookings);
    console.log('Bookings loaded:', bookings);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Attach modal and filter events to dynamic cards
  attachJobEvents();
});
