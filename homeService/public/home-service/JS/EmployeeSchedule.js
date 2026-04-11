const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// Get logged-in employee
const authUser = JSON.parse(localStorage.getItem('hsAuthUser'));
if (!authUser || authUser.role !== 'employee') {
  window.location.href = 'Login.html';
}

// Fetch bookings for this employee
async function fetchBookings(email) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&employee_email=eq.${encodeURIComponent(email)}`,
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
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}

// Format time
function formatTime(timeStr) {
  if (!timeStr) return '';
  const time = new Date(`1970-01-01T${timeStr}`);
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

// Format date string for display
function formatDateShort(dateObj) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[dateObj.getMonth()]} ${dateObj.getDate()}`;
}

// Get week dates (Mon-Sun) with offset
function getWeekDates(offset) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const dates = [];
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push({
      key: days[i],
      name: dayNames[i],
      number: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      fullDate: `${dayNames[i]}, ${formatDateShort(d)}`,
      dateStr: formatDateShort(d),
      jsDate: d,
    });
  }
  return dates;
}

// Fetch bookings for this employee
async function fetchBookings(email) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&employee_email=eq.${encodeURIComponent(email)}`,
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
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}

// Update sidebar monthly earnings
const updateSidebarMonthlyEarnings = async () => {
  if (!authUser || !authUser.email) return;
  const bookings = await fetchBookings(authUser.email);
  const el = document.getElementById('sidebarMonthlyEarnings');
  if (!el) return;
  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();
  const completed = bookings.filter(b => b.status === 'completed');
  const thisMonth = completed.filter(b => { const d = new Date(b.completed_at || b.created_at || b.scheduled_date); return d.getMonth() === cm && d.getFullYear() === cy; });
  const total = thisMonth.reduce((s, b) => s + (b.price || 0), 0);
  el.textContent = total >= 1000 ? `৳${(total / 1000).toFixed(0)}k` : `৳${total}`;
};

// Group bookings by date within a week range
function groupBookingsByWeek(bookings, weekDates) {
  const grouped = {};
  weekDates.forEach(d => {
    grouped[d.key] = [];
  });

  bookings.forEach(b => {
    const dateVal = b.scheduled_date || b.created_at;
    if (!dateVal) return;

    const bookingDate = new Date(dateVal);
    weekDates.forEach(d => {
      if (
        bookingDate.getFullYear() === d.year &&
        bookingDate.getMonth() === d.month &&
        bookingDate.getDate() === d.number
      ) {
        grouped[d.key].push(b);
      }
    });
  });

  // Sort each day's bookings by start_time
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  });

  return grouped;
}

// State
let weekOffset = 0;
let currentSelectedDay = null;
let bookingsByWeek = {};
let allBookings = [];

// DOM Elements
let weekDaysRow, selectedDayTitle, jobCount, jobCards, weekRange, prevWeekBtn, nextWeekBtn;
let weekOverviewList, remindersList, logoutBtn, statusToggle, statusDot, statusLabel;
let addReminderBtn, reminderModalOverlay, reminderModalClose, reminderCancel, reminderForm;
let jobModalOverlay, jobModalClose, jobModalTitle, jobModalBody;

// Render week days row
function renderWeekDays(weekDates) {
  weekDaysRow.innerHTML = '';
  weekDates.forEach(date => {
    const dayEl = document.createElement('div');
    dayEl.className = `week-day ${currentSelectedDay === date.key ? 'selected' : ''}`;
    dayEl.dataset.day = date.key;
    dayEl.dataset.date = date.dateStr;
    dayEl.innerHTML = `
      <span class="day-name">${date.name}</span>
      <span class="day-number">${date.number}</span>
      <span class="day-dot"></span>
    `;
    if (bookingsByWeek[date.key] && bookingsByWeek[date.key].length > 0) {
      dayEl.classList.add('has-jobs');
    }
    weekDaysRow.appendChild(dayEl);
  });
}

// Render day schedule
function renderDaySchedule(dayKey, weekDates) {
  const dayData = weekDates.find(d => d.key === dayKey);
  if (!dayData) return;

  selectedDayTitle.textContent = dayData.fullDate;
  const dayBookings = bookingsByWeek[dayKey] || [];
  jobCount.textContent = dayBookings.length === 1 ? '1 job' : `${dayBookings.length} jobs`;

  jobCards.innerHTML = '';

  if (dayBookings.length === 0) {
    jobCards.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
        <p>No jobs scheduled for this day</p>
      </div>
    `;
    return;
  }

  dayBookings.forEach(booking => {
    const statusLabel = booking.status === 'completed' ? 'Completed' :
      booking.status === 'in_progress' ? 'In Progress' :
      booking.status === 'cancelled' ? 'Cancelled' : 'Scheduled';
    const statusClass = booking.status === 'completed' ? 'completed' :
      booking.status === 'in_progress' ? 'in-progress' :
      booking.status === 'cancelled' ? 'cancelled' : 'scheduled';

    const timeStr = formatTime(booking.start_time);
    const duration = calcDuration(booking.start_time, booking.end_time);

    const jobCard = document.createElement('div');
    jobCard.className = `job-card ${statusClass}`;
    jobCard.dataset.bookingId = booking.id;
    jobCard.innerHTML = `
      <div class="job-status-indicator">
        <span class="status-dot"></span>
        <span class="status-label">${statusLabel}</span>
      </div>
      <div class="job-info">
        <h4>${booking.service_name || 'Service'}</h4>
        <p>${booking.customer_name || 'Customer'}</p>
      </div>
      <div class="job-time">
        <span class="time">${timeStr || 'TBD'}</span>
        ${duration ? `<span class="duration">${duration}</span>` : ''}
      </div>
    `;

    jobCard.addEventListener('click', () => showJobDetail(booking));
    jobCards.appendChild(jobCard);
  });
}

function calcDuration(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

// Show job detail modal
function showJobDetail(booking) {
  jobModalTitle.textContent = booking.service_name || 'Job Details';

  const statusLabel = booking.status === 'completed' ? 'Completed' :
    booking.status === 'in_progress' ? 'In Progress' :
    booking.status === 'cancelled' ? 'Cancelled' : 'Scheduled';

  const timeStr = formatTime(booking.start_time);
  const duration = calcDuration(booking.start_time, booking.end_time);

  jobModalBody.innerHTML = `
    <div class="job-detail-content">
      <div class="job-detail-row">
        <span class="job-detail-label">Status</span>
        <span class="status-badge ${booking.status === 'completed' ? 'paid' : 'pending'}">${statusLabel}</span>
      </div>
      <div class="job-detail-row">
        <span class="job-detail-label">Client</span>
        <span>${booking.customer_name || 'Unknown'}</span>
      </div>
      <div class="job-detail-row">
        <span class="job-detail-label">Time</span>
        <span>${timeStr || 'TBD'}${duration ? ` · ${duration}` : ''}</span>
      </div>
      <div class="job-detail-row">
        <span class="job-detail-label">Location</span>
        <span>${booking.address || 'N/A'}</span>
      </div>
      <div class="job-detail-row">
        <span class="job-detail-label">Price</span>
        <span class="job-price">৳${booking.price || 0}</span>
      </div>
      ${booking.additional_details ? `
      <div class="job-detail-description">
        <span class="job-detail-label">Description</span>
        <p>${booking.additional_details}</p>
      </div>
      ` : ''}
    </div>
  `;

  jobModalOverlay.classList.remove('hidden');
}

// Render week overview
function renderWeekOverview(weekDates) {
  weekOverviewList.innerHTML = '';

  weekDates.forEach(date => {
    const dayBookings = bookingsByWeek[date.key] || [];
    const item = document.createElement('div');
    item.className = 'overview-item';

    let badgesHtml = '';
    if (dayBookings.length > 0) {
      badgesHtml = dayBookings.map(booking => {
        const timeStr = formatTime(booking.start_time) || 'TBD';
        return `<span class="overview-badge" data-booking-id="${booking.id}" data-day="${date.key}">${timeStr} · ${booking.service_name}</span>`;
      }).join('');
    } else {
      badgesHtml = `<span class="overview-badge free" data-day="${date.key}">Free</span>`;
    }

    item.innerHTML = `
      <span class="overview-day">${date.name} ${date.number}</span>
      <div class="overview-badges">${badgesHtml}</div>
    `;

    weekOverviewList.appendChild(item);
  });

  // Click handlers for overview badges
  weekOverviewList.querySelectorAll('.overview-badge:not(.free)').forEach(badge => {
    badge.addEventListener('click', () => {
      const dayKey = badge.dataset.day;
      selectDay(dayKey, weekDates);
    });
  });

  weekOverviewList.querySelectorAll('.overview-badge.free').forEach(badge => {
    badge.addEventListener('click', () => {
      const dayKey = badge.dataset.day;
      selectDay(dayKey, weekDates);
    });
  });
}

// Render week stats
function renderWeekStats(weekDates) {
  let totalJobs = 0, completed = 0, scheduled = 0, freeDays = 0;

  weekDates.forEach(date => {
    const dayBookings = bookingsByWeek[date.key] || [];
    totalJobs += dayBookings.length;
    dayBookings.forEach(b => {
      if (b.status === 'completed') completed++;
      else if (b.status === 'upcoming' || b.status === 'scheduled') scheduled++;
    });
    if (dayBookings.length === 0) freeDays++;
  });

  const statsValues = document.querySelectorAll('.week-stat-value');
  if (statsValues.length >= 4) {
    statsValues[0].textContent = totalJobs;
    statsValues[1].textContent = completed;
    statsValues[2].textContent = scheduled;
    statsValues[3].textContent = freeDays;
  }
}

// Render reminders (from bookings)
function renderReminders(weekDates) {
  remindersList.innerHTML = '';

  const upcomingBookings = [];
  weekDates.forEach(date => {
    const dayBookings = bookingsByWeek[date.key] || [];
    dayBookings.forEach(b => {
      if (b.status !== 'completed' && b.status !== 'cancelled') {
        const timeStr = formatTime(b.start_time) || 'TBD';
        upcomingBookings.push({
          title: b.service_name,
          client: b.customer_name || 'Unknown',
          date: date.fullDate,
          time: timeStr,
        });
      }
    });
  });

  if (upcomingBookings.length === 0) {
    remindersList.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #9ca3af;">
        <p>No upcoming reminders</p>
      </div>
    `;
    return;
  }

  upcomingBookings.forEach(reminder => {
    const item = document.createElement('div');
    item.className = 'reminder-item';
    item.innerHTML = `
      <div class="reminder-icon smart">
        <i data-lucide="zap"></i>
      </div>
      <div class="reminder-info">
        <h4>${reminder.title}</h4>
        <p>${reminder.client}</p>
        <span>${reminder.date}, ${reminder.time}</span>
      </div>
    `;
    remindersList.appendChild(item);
  });
}

// Select day
function selectDay(dayKey, weekDates) {
  document.querySelectorAll('.week-day').forEach(day => day.classList.remove('selected'));
  const selectedDay = document.querySelector(`[data-day="${dayKey}"]`);
  if (selectedDay) selectedDay.classList.add('selected');
  currentSelectedDay = dayKey;
  renderDaySchedule(dayKey, weekDates);
}

// Full week display update
async function updateWeekDisplay() {
  const weekDates = getWeekDates(weekOffset);
  bookingsByWeek = groupBookingsByWeek(allBookings, weekDates);

  // Week range text
  const firstDate = weekDates[0];
  const lastDate = weekDates[6];
  weekRange.textContent = `Week of ${firstDate.dateStr} – ${lastDate.dateStr}, ${lastDate.year}`;

  renderWeekDays(weekDates);
  renderWeekOverview(weekDates);
  renderWeekStats(weekDates);
  renderReminders(weekDates);

  // Select today or first day with jobs
  const today = new Date();
  const todayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()];
  const todayInWeek = weekDates.find(d => d.key === todayKey);

  if (todayInWeek && currentSelectedDay !== todayKey) {
    selectDay(todayKey, weekDates);
  } else if (!currentSelectedDay) {
    const firstWithJobs = weekDates.find(d => bookingsByWeek[d.key] && bookingsByWeek[d.key].length > 0);
    selectDay(firstWithJobs ? firstWithJobs.key : 'mon', weekDates);
  } else {
    renderDaySchedule(currentSelectedDay, weekDates);
  }
}

// Toast notification
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon ${type}"><i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i></div>
    <div class="toast-content"><p>${message}</p></div>
  `;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  // Update sidebar monthly earnings
  await updateSidebarMonthlyEarnings();

  // Get DOM elements
  weekDaysRow = document.getElementById('weekDaysRow');
  selectedDayTitle = document.getElementById('selectedDayTitle');
  jobCount = document.getElementById('jobCount');
  jobCards = document.getElementById('jobCards');
  weekRange = document.getElementById('weekRange');
  prevWeekBtn = document.getElementById('prevWeek');
  nextWeekBtn = document.getElementById('nextWeek');
  weekOverviewList = document.getElementById('weekOverviewList');
  remindersList = document.querySelector('.reminders-list');
  logoutBtn = document.getElementById('logoutBtn');
  statusToggle = document.getElementById('statusToggle');
  statusDot = document.getElementById('statusDot');
  statusLabel = document.getElementById('statusLabel');
  addReminderBtn = document.querySelector('.add-reminder-btn');
  reminderModalOverlay = document.getElementById('reminderModalOverlay');
  reminderModalClose = document.getElementById('reminderModalClose');
  reminderCancel = document.getElementById('reminderCancel');
  reminderForm = document.getElementById('reminderForm');
  jobModalOverlay = document.getElementById('jobModalOverlay');
  jobModalClose = document.getElementById('jobModalClose');
  jobModalTitle = document.getElementById('jobModalTitle');
  jobModalBody = document.getElementById('jobModalBody');

  // Fetch bookings
  if (authUser && authUser.email) {
    allBookings = await fetchBookings(authUser.email);
  }

  // Initial render
  await updateWeekDisplay();

  // Week navigation
  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', () => {
      weekOffset--;
      updateWeekDisplay();
      showToast('Showing previous week', 'info');
    });
  }

  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', () => {
      weekOffset++;
      updateWeekDisplay();
      showToast('Showing next week', 'info');
    });
  }

  // Day selection
  if (weekDaysRow) {
    weekDaysRow.addEventListener('click', (e) => {
      const dayElement = e.target.closest('.week-day');
      if (!dayElement) return;
      const dayKey = dayElement.dataset.day;
      const weekDates = getWeekDates(weekOffset);
      selectDay(dayKey, weekDates);
    });
  }

  // Job modal close
  if (jobModalClose) {
    jobModalClose.addEventListener('click', () => jobModalOverlay.classList.add('hidden'));
  }
  if (jobModalOverlay) {
    jobModalOverlay.addEventListener('click', (e) => {
      if (e.target === jobModalOverlay) jobModalOverlay.classList.add('hidden');
    });
  }

  // Status toggle
  if (statusToggle) {
    statusToggle.addEventListener('change', () => {
      if (statusToggle.checked) {
        statusDot.style.background = '#4ade80';
        statusLabel.textContent = 'Online';
        showToast('You are now Online', 'success');
      } else {
        statusDot.style.background = '#ef4444';
        statusLabel.textContent = 'Offline';
        showToast('You are now Offline', 'warning');
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '../Html/Login.html';
    });
  }

  // Keyboard: Escape to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      jobModalOverlay?.classList.add('hidden');
    }
  });
});
