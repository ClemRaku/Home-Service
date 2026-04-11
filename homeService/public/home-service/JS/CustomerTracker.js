const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// Get logged-in customer
const authUser = (() => {
  try { return JSON.parse(localStorage.getItem('hsAuthUser')); } catch { return null; }
})();

if (!authUser || authUser.role !== 'customer') {
  window.location.href = '../Html/Login.html';
}

// DOM Elements
const content = document.querySelector('.content');
const locationModal = document.getElementById('locationModal');
const callModal = document.getElementById('callModal');
const ratingModal = document.getElementById('ratingModal');

// Employee cache
const employeeCache = {};

// Fetch all employees once
const loadEmployees = async () => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=email,full_name,role`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (res.ok) {
      const emps = await res.json();
      emps.forEach(e => { employeeCache[e.email] = { name: e.full_name, role: e.role }; });
    }
  } catch (err) { console.warn('Could not load employees:', err); }
};

// Fetch bookings for this customer
const fetchBookings = async (email) => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&customer_email=eq.${encodeURIComponent(email)}&order=scheduled_date.desc,start_time.desc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) { console.error('Error fetching bookings:', err); return []; }
};

// Get initials
const initials = (name) => {
  if (!name) return '??';
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

// Format time
const formatTime12 = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${period}`;
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Status mapping
const getStatusInfo = (booking) => {
  switch (booking.status) {
    case 'upcoming':
      return { label: 'On the way', class: 'status--warning', section: 'active' };
    case 'in_progress':
      return { label: 'Working', class: 'status--success', section: 'active' };
    case 'completed':
      return { label: 'Completed', class: 'status--muted', section: 'completed' };
    case 'cancelled':
      return { label: 'Cancelled', class: 'status--muted', section: 'completed' };
    default:
      return { label: 'Scheduled', class: 'status--warning', section: 'active' };
  }
};

// Get employee name
const getEmployeeName = (email) => {
  if (!email) return 'Unassigned';
  return employeeCache[email]?.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Get employee role
const getEmployeeRole = (email) => {
  if (!email) return 'Service Worker';
  return employeeCache[email]?.role || 'Service Worker';
};

// Render the entire tracker page
const renderTracker = async () => {
  if (!authUser?.email) return;
  await loadEmployees();
  const bookings = await fetchBookings(authUser.email);

  const activeBookings = bookings.filter(b => ['upcoming', 'in_progress'].includes(b.status));
  const completedBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const activeHTML = activeBookings.map(b => {
    const empName = getEmployeeName(b.employee_email);
    const empRole = getEmployeeRole(b.employee_email);
    const status = getStatusInfo(b);
    const timeStr = b.start_time ? formatTime12(b.start_time) : '';
    const dateStr = formatDate(b.scheduled_date);
    const location = b.address || 'Location TBD';

    return `
      <div class="card">
        <div class="card__profile">
          <div class="avatar avatar--warning">${initials(empName)}</div>
          <div>
            <div class="card__name">
              ${empName}
              <span class="status ${status.class}">${status.label}</span>
            </div>
            <div class="card__role">${empRole}${b.service_name ? ` — ${b.service_name}` : ''}</div>
            <div class="card__meta">
              ${dateStr ? `<span><i data-lucide="calendar"></i> ${dateStr}</span>` : ''}
              ${timeStr ? `<span><i data-lucide="clock"></i> ${timeStr}</span>` : ''}
              <span><i data-lucide="map-pin"></i> ${location}</span>
            </div>
          </div>
        </div>
        <div class="card__actions">
          <button class="icon-btn call-btn" type="button" aria-label="Call"
            data-name="${empName}" data-role="${empRole}" data-status="Connected"
            data-avatar="">
            <i data-lucide="phone"></i>
          </button>
          <button class="primary-btn location-btn" type="button"
            data-name="${empName}" data-status="${status.label}"
            data-status-class="${status.class}" data-eta="${timeStr || 'TBD'}"
            data-distance="—” data-location="${location}"
            data-map="" data-map-link="">
            View Location
          </button>
        </div>
      </div>
    `;
  }).join('');

  const completedHTML = completedBookings.map(b => {
    const empName = getEmployeeName(b.employee_email);
    const empRole = getEmployeeRole(b.employee_email);
    const status = getStatusInfo(b);

    return `
      <div class="card card--completed">
        <div class="card__profile">
          <div class="avatar avatar--muted">${initials(empName)}</div>
          <div>
            <div class="card__name">
              ${empName}
              <span class="status ${status.class}">${status.label}</span>
            </div>
            <div class="card__role">${empRole}${b.service_name ? ` — ${b.service_name}` : ''}</div>
          </div>
        </div>
        <div class="card__actions">
          <button class="ghost-btn rate-btn" type="button"
            data-name="${empName}" data-role="${empRole}" data-avatar="">
            ☆ Rate Service
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Replace the sections
  const activeSection = document.querySelector('.section');
  const completedSection = document.querySelector('.section--completed');

  if (activeSection) {
    const title = activeSection.querySelector('.section__title');
    if (title) {
      title.innerHTML = `<span class="section__dot"></span> Active Services (${activeBookings.length})`;
    }
    // Remove old cards, keep title
    activeSection.querySelectorAll('.card').forEach(c => c.remove());
    if (activeHTML) {
      activeSection.insertAdjacentHTML('beforeend', activeHTML);
    } else {
      activeSection.insertAdjacentHTML('beforeend', '<p style="color:#9ca3af;text-align:center;padding:20px;">No active services.</p>');
    }
  }

  if (completedSection) {
    const title = completedSection.querySelector('.section__title');
    if (title) {
      title.innerHTML = `<span class="section__dot section__dot--muted"></span> Completed Today (${completedBookings.length})`;
    }
    completedSection.querySelectorAll('.card').forEach(c => c.remove());
    if (completedHTML) {
      completedSection.insertAdjacentHTML('beforeend', completedHTML);
    } else {
      completedSection.insertAdjacentHTML('beforeend', '<p style="color:#9ca3af;text-align:center;padding:20px;">No completed services yet.</p>');
    }
  }

  // Re-initialize lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Re-bind modal handlers
  bindModalHandlers();
};

// ── Modal Handlers ──

const openModal = (el) => { el?.classList.add('is-visible'); el?.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
const closeModal = (el) => { el?.classList.remove('is-visible'); el?.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };

let selectedRating = 0;

const bindModalHandlers = () => {
  // Location modal
  const locationModal = document.getElementById('locationModal');
  document.querySelectorAll('.location-btn').forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name || '';
      const status = btn.dataset.status || '';
      const statusClass = btn.dataset.statusClass || '';
      const eta = btn.dataset.eta || '';
      const location = btn.dataset.location || '';

      const modalTitle = document.getElementById('locationModalTitle');
      const modalStatus = document.getElementById('locationModalStatus');
      const modalEta = document.getElementById('locationModalEta');
      const modalAddress = document.getElementById('locationModalAddress');
      const modalAvatar = document.getElementById('locationModalAvatar');

      if (modalTitle) modalTitle.textContent = name;
      if (modalStatus) {
        modalStatus.textContent = status;
        modalStatus.className = `status location-modal__status-pill ${statusClass}`;
      }
      if (modalEta) modalEta.innerHTML = `<i data-lucide="clock"></i> ${eta}`;
      if (modalAddress) modalAddress.innerHTML = `<i data-lucide="map-pin"></i> ${location}`;
      if (modalAvatar) modalAvatar.textContent = initials(name);

      if (typeof lucide !== 'undefined') lucide.createIcons();
      openModal(locationModal);
    };
  });

  locationModal?.querySelector('.location-modal__close')?.addEventListener('click', () => closeModal(locationModal));
  locationModal?.addEventListener('click', (e) => { if (e.target === locationModal) closeModal(locationModal); });

  // Call modal
  const callModal = document.getElementById('callModal');
  document.querySelectorAll('.call-btn').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('callModalName').textContent = btn.dataset.name || '';
      document.getElementById('callModalRole').textContent = btn.dataset.role || '';
      document.getElementById('callModalStatus').textContent = btn.dataset.status || 'Connected';
      openModal(callModal);
    };
  });

  callModal?.querySelector('.call-modal__end')?.addEventListener('click', () => closeModal(callModal));
  callModal?.addEventListener('click', (e) => { if (e.target === callModal) closeModal(callModal); });

  // Rating modal
  const ratingModal = document.getElementById('ratingModal');
  document.querySelectorAll('.rate-btn').forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name || '';
      const role = btn.dataset.role || '';
      document.getElementById('ratingModalName').textContent = name;
      document.getElementById('ratingModalRole').textContent = role;
      document.getElementById('ratingModalQuestion').textContent = `How was your experience with ${name}?`;
      selectedRating = 0;
      ratingModal?.querySelectorAll('.rating-star').forEach(s => s.classList.remove('is-active', 'is-hover'));
      openModal(ratingModal);
    };
  });

  ratingModal?.querySelectorAll('.rating-star').forEach(star => {
    star.onclick = () => {
      selectedRating = Number(star.dataset.value);
      ratingModal?.querySelectorAll('.rating-star').forEach(s => {
        s.classList.toggle('is-active', Number(s.dataset.value) <= selectedRating);
      });
    };
  });

  ratingModal?.querySelector('.rating-modal__submit')?.addEventListener('click', () => {
    if (selectedRating > 0) {
      closeModal(ratingModal);
      selectedRating = 0;
    }
  });

  ratingModal?.querySelector('.rating-modal__cancel')?.addEventListener('click', () => {
    closeModal(ratingModal);
    selectedRating = 0;
  });

  ratingModal?.addEventListener('click', (e) => {
    if (e.target === ratingModal) {
      closeModal(ratingModal);
      selectedRating = 0;
    }
  });
};

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(document.getElementById('locationModal'));
    closeModal(document.getElementById('callModal'));
    closeModal(document.getElementById('ratingModal'));
  }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderTracker();
});
