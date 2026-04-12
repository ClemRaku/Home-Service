const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const getStoredAuthUser = () => {
  try {
    const raw = localStorage.getItem('hsAuthUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const iconByService = {
  'electric': 'zap',
  'plumb': 'droplet',
  'clean': 'sparkles',
  'carpenter': 'hammer',
  'paint': 'paint-roller',
  'pest': 'bug',
  'maid': 'home-heart',
  'hvac': 'wind',
  'moving': 'truck',
  'security': 'shield-check',
  'garden': 'leaf',
  'applianc': 'settings',
  'wiring': 'zap',
  'leak': 'droplet',
  'drain': 'droplet',
  'water heater': 'flame',
  'faucet': 'droplet',
  'lighting': 'lightbulb',
  'generator': 'zap',
  'solar': 'sun',
  'interior paint': 'paint-roller',
  'exterior paint': 'paint-brush',
  'home cleaning': 'sparkles',
  'sofa': 'armchair',
  'mattress': 'bed',
  'kitchen': 'utensils',
  'bathroom': 'bath',
  'pipe': 'wrench',
};

const getIconForService = (serviceName) => {
  const lower = serviceName.toLowerCase();
  for (const [key, icon] of Object.entries(iconByService)) {
    if (lower.includes(key)) return icon;
  }
  return 'briefcase';
};

const getColorClass = (serviceName) => {
  const lower = serviceName.toLowerCase();
  if (lower.includes('electric') || lower.includes('wiring') || lower.includes('lighting') || lower.includes('generator') || lower.includes('solar')) return 'yellow';
  if (lower.includes('plumb') || lower.includes('leak') || lower.includes('drain') || lower.includes('faucet') || lower.includes('water heater') || lower.includes('pipe') || lower.includes('bathroom')) return 'mint';
  if (lower.includes('carpenter') || lower.includes('paint') || lower.includes('interior') || lower.includes('exterior')) return 'lavender';
  if (lower.includes('clean') || lower.includes('maid') || lower.includes('sofa') || lower.includes('mattress') || lower.includes('kitchen')) return 'mint';
  return 'yellow';
};

const formatTime12 = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const statusLabels = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  in_progress: 'In Progress',
  cancelled: 'Cancelled',
};

const bookingsGrid = document.getElementById('bookingsGrid');
const tabs = document.querySelectorAll('.tab');
const modal = document.getElementById('detailsModal');
const modalCloseButtons = document.querySelectorAll('.modal-close, #modalCloseBtn');
const modalBookingId = document.getElementById('modalBookingId');
const modalServiceName = document.getElementById('modalServiceName');
const modalStatus = document.getElementById('modalStatus');
const modalWorker = document.getElementById('modalWorker');
const modalDate = document.getElementById('modalDate');
const modalTime = document.getElementById('modalTime');
const modalLocation = document.getElementById('modalLocation');
const modalDetails = document.getElementById('modalDetails');
const modalPrice = document.getElementById('modalPrice');
const modalIcon = document.getElementById('modalIcon');
const modalIconSymbol = document.getElementById('modalIconSymbol');

let allBookings = [];
let employeeNames = {};
let servicePrices = {};

const loadServicePrices = async () => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/services?select=service_name,price`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (res.ok) {
      const services = await res.json();
      services.forEach((s) => {
        servicePrices[s.service_name] = Number(s.price) || 0;
      });
    }
  } catch (err) { console.warn('Could not load service prices:', err); }
};

const loadEmployeeNames = async () => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=email,full_name`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (response.ok) {
      const employees = await response.json();
      employees.forEach((emp) => {
        employeeNames[emp.email] = emp.full_name;
      });
    }
  } catch (error) {
    console.warn('Could not load employee names:', error);
  }
};

const loadBookings = async () => {
  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) {
    if (bookingsGrid) bookingsGrid.innerHTML = '<p class="no-bookings">Please sign in to view your bookings.</p>';
    return;
  }

  try {
    await loadEmployeeNames();
    await loadServicePrices();

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&customer_email=eq.${encodeURIComponent(authUser.email)}&order=scheduled_date.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) throw new Error(`Failed to fetch bookings (${response.status})`);

    allBookings = await response.json();
    renderBookings(allBookings);
  } catch (error) {
    console.error('Error loading bookings:', error);
    if (bookingsGrid) bookingsGrid.innerHTML = '<p class="no-bookings">Could not load bookings. Please try again later.</p>';
  }
};

const renderBookings = (bookings) => {
  if (!bookingsGrid) return;

  if (!bookings.length) {
    bookingsGrid.innerHTML = '<p class="no-bookings">No bookings found.</p>';
    return;
  }

  bookingsGrid.innerHTML = bookings
    .map((booking) => {
      const icon = getIconForService(booking.service_name);
      const colorClass = getColorClass(booking.service_name);
      const statusLabel = statusLabels[booking.status] || booking.status;
      const timeRange = `${formatTime12(booking.start_time)} - ${formatTime12(booking.end_time)}`;
      const workerName = employeeNames[booking.employee_email] || booking.employee_email?.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Unassigned';
      const servicePrice = servicePrices[booking.service_name] || 0;

      return `
        <article class="booking-card" data-status="${booking.status}" data-booking-id="${booking.id}">
          <div class="card-top">
            <div class="service-meta">
              <div class="service-icon ${colorClass}"><i data-lucide="${icon}"></i></div>
              <div>
                <h3>${booking.service_name}</h3>
                <p>Booking #${booking.booking_number}</p>
              </div>
            </div>
            <span class="status-pill ${booking.status}">${statusLabel}</span>
          </div>
          <div class="details">
            <p><i data-lucide="user"></i><strong>Worker:</strong> ${workerName}</p>
            <p><i data-lucide="calendar"></i><strong>Date:</strong> ${formatDate(booking.scheduled_date)}</p>
            <p><i data-lucide="clock"></i><strong>Time:</strong> ${timeRange}</p>
            <p><i data-lucide="map-pin"></i><strong>Location:</strong> ${booking.address}</p>
          </div>
          <div class="card-bottom">
            <div class="price">$${servicePrice.toFixed(2)}</div>
            <div class="actions">
              <button class="chat-btn" aria-label="Message"><i data-lucide="message-circle"></i></button>
              <button class="details-btn">View Details</button>
              ${booking.status === 'upcoming' ? `<button class="delete-btn" data-delete-id="${booking.id}" aria-label="Delete booking"><i data-lucide="trash-2"></i></button>` : ''}
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  attachCardEvents();
};

const attachCardEvents = () => {
  const cards = document.querySelectorAll('.booking-card');

  cards.forEach((card) => {
    const bookingId = card.dataset.bookingId;
    const booking = allBookings.find((b) => b.id === bookingId);

    const detailsBtn = card.querySelector('.details-btn');
    detailsBtn?.addEventListener('click', () => {
      const serviceName = card.querySelector('.service-meta h3')?.textContent?.trim() || '';
      const bookingLabel = card.querySelector('.service-meta p')?.textContent?.trim() || '';
      const statusText = card.querySelector('.status-pill')?.textContent?.trim() || '';
      const workerText = card.querySelector('.details p:nth-child(1)')?.textContent || '';
      const dateText = card.querySelector('.details p:nth-child(2)')?.textContent || '';
      const timeText = card.querySelector('.details p:nth-child(3)')?.textContent || '';
      const locationText = card.querySelector('.details p:nth-child(4)')?.textContent || '';
      const priceText = card.querySelector('.price')?.textContent?.trim() || '';
      const statusKey = card.querySelector('.status-pill')?.classList[1] || 'upcoming';
      const cardIcon = card.querySelector('.service-icon')?.classList[1] || 'yellow';
      const iconSymbol = card.querySelector('.service-icon i')?.getAttribute('data-lucide') || 'briefcase';

      if (modalBookingId) modalBookingId.textContent = bookingLabel;
      if (modalServiceName) modalServiceName.textContent = serviceName;
      if (modalStatus) {
        modalStatus.textContent = statusText;
        modalStatus.className = `status-pill ${statusKey}`;
      }
      if (modalWorker) modalWorker.textContent = workerText.replace('Worker:', '').trim();
      if (modalDate) modalDate.textContent = dateText.replace('Date:', '').trim();
      if (modalTime) modalTime.textContent = timeText.replace('Time:', '').trim();
      if (modalLocation) modalLocation.textContent = locationText.replace('Location:', '').trim();
      if (modalDetails) modalDetails.textContent = (booking && booking.additional_details) || 'No additional details provided.';
      if (modalPrice) modalPrice.textContent = `$${((booking && servicePrices[booking.service_name]) || 0).toFixed(2)}`;
      if (modalIcon) modalIcon.className = `modal-icon ${cardIcon}`;
      if (modalIconSymbol) modalIconSymbol.setAttribute('data-lucide', iconSymbol);

      openModal();
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    });

    // Delete button handler (only for upcoming bookings)
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn?.addEventListener('click', async () => {
      const bookingId = deleteBtn.dataset.deleteId;
      if (!bookingId) return;

      const serviceName = card.querySelector('.service-meta h3')?.textContent?.trim() || 'this booking';
      if (!confirm(`Delete booking "${serviceName}"?`)) return;

      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}`,
          {
            method: 'DELETE',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              Prefer: 'return=minimal',
            },
          }
        );

        if (!res.ok) throw new Error(`Failed (${res.status})`);

        card.remove();
        allBookings = allBookings.filter((b) => b.id !== bookingId);

        if (!document.querySelectorAll('.booking-card').length) {
          if (bookingsGrid) bookingsGrid.innerHTML = '<p class="no-bookings">No bookings found.</p>';
        }
      } catch (err) {
        console.error('Delete error:', err);
        window.alert('Failed to delete booking.');
      }
    });
  });
};

const openModal = () => {
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
};

// Tab filtering
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;
    const cards = document.querySelectorAll('.booking-card');

    cards.forEach((card) => {
      const status = card.dataset.status;
      const show = filter === 'all' || status === filter;
      card.classList.toggle('hidden', !show);
    });
  });
});

// Modal close
modalCloseButtons.forEach((button) => {
  button.addEventListener('click', closeModal);
});

modal?.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.classList.contains('active')) {
    closeModal();
  }
});

// Init
loadBookings();
