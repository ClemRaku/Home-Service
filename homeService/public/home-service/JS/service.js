const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const navbar = document.querySelector('.navbar');
const filterPanel = document.querySelector('.filters');
const serviceGrid = document.querySelector('#serviceGrid');
const bookingModalOverlay = document.querySelector('#bookingModalOverlay');
const bookingCloseBtn = document.querySelector('#bookingCloseBtn');
const bookingCancelBtn = document.querySelector('#bookingCancelBtn');
const bookingForm = document.querySelector('#bookingForm');

// Booking form fields
const bookingFullName = document.querySelector('#bookingFullName');
const bookingEmail = document.querySelector('#bookingEmail');
const bookingPhone = document.querySelector('#bookingPhone');
const bookingAddress = document.querySelector('#bookingAddress');
const bookingDate = document.querySelector('#bookingDate');
const bookingTime = document.querySelector('#bookingTime');
const bookingDetails = document.querySelector('#bookingDetails');

const getStoredAuthUser = () => {
  try {
    const raw = localStorage.getItem('hsAuthUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const fillBookingFormFromCustomer = async () => {
  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) return;

  // Fill what we know from localStorage
  if (bookingFullName) bookingFullName.value = authUser.name || '';
  if (bookingEmail) bookingEmail.value = authUser.email || '';

  // Fetch full customer record from Supabase
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/customers?select=full_name,email,phone_number,address&email=eq.${encodeURIComponent(authUser.email)}`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (res.ok) {
      const rows = await res.json();
      if (rows.length) {
        const c = rows[0];
        if (bookingFullName) bookingFullName.value = c.full_name || '';
        if (bookingEmail) bookingEmail.value = c.email || '';
        if (bookingPhone) bookingPhone.value = c.phone_number || '';
        if (bookingAddress) bookingAddress.value = c.address || '';
      }
    }
  } catch (err) {
    console.warn('Could not fetch customer details for booking form:', err);
  }
};

const iconByCategory = {
  'cleaning services': 'brush-cleaning',
  'plumbing services': 'wrench',
  'electrical services': 'zap',
  'painting & renovation services': 'paint-roller',
  'appliance repair services': 'settings',
  'pest control services': 'bug-off',
  'home improvement & maintenance services': 'hammer',
  'gardening & landscaping services': 'trees',
  'moving & logistics services': 'truck',
  'home security services': 'shield-check',
  'healthcare services': 'heart-pulse',
};

window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeCategory = (value = '') => {
  const text = normalizeText(value)
    .replace('applience', 'appliance')
    .replace('planting & renovation', 'painting & renovation')
    .replace('health & care', 'healthcare');

  if (text.includes('cleaning')) return 'cleaning services';
  if (text.includes('plumbing')) return 'plumbing services';
  if (text.includes('electrical')) return 'electrical services';
  if (text.includes('painting') || text.includes('renovation')) return 'painting & renovation services';
  if (text.includes('appliance')) return 'appliance repair services';
  if (text.includes('pest')) return 'pest control services';
  if (text.includes('home improvement') || text.includes('maintenance')) return 'home improvement & maintenance services';
  if (text.includes('gardening') || text.includes('landscaping')) return 'gardening & landscaping services';
  if (text.includes('moving') || text.includes('logistics')) return 'moving & logistics services';
  if (text.includes('security') || text.includes('alarm')) return 'home security services';
  if (text.includes('healthcare') || text.includes('nursing') || text.includes('physiotherapy') || text.includes('medical')) return 'healthcare services';

  return text;
};

const titleCase = (value = '') =>
  String(value)
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const formatCategory = (value = '') => titleCase(normalizeCategory(value));

const isServiceActive = (service = {}) => {
  const activeValue = service.is_active ?? service.active ?? service.Active ?? true;

  if (typeof activeValue === 'string') {
    return activeValue.trim().toLowerCase() === 'true';
  }

  return activeValue !== false;
};

const inferServiceType = (title, category) => {
  const titleText = normalizeText(title);
  const categoryText = normalizeCategory(category);

  if (
    titleText.includes('repair') ||
    titleText.includes('leak') ||
    titleText.includes('drain') ||
    titleText.includes('lock')
  ) {
    return 'emergency';
  }

  if (
    categoryText.includes('cleaning') ||
    categoryText.includes('gardening') ||
    categoryText.includes('healthcare')
  ) {
    return 'recurring';
  }

  return 'one-time';
};

const getPriceRange = (priceValue) => {
  const price = Number(priceValue);
  if (Number.isNaN(price)) return null;
  return { min: price, max: price };
};

const matchesPrice = (cardRange, selectedRange) => {
  if (!selectedRange || selectedRange === 'all') return true;
  if (!cardRange) return false;

  if (selectedRange === '500-1500tk') return cardRange.min >= 500 && cardRange.max <= 1500;
  if (selectedRange === '1500-5000tk') return cardRange.min >= 1500 && cardRange.max <= 5000;
  if (selectedRange === '5000tk+') return cardRange.max >= 5000;
  return true;
};

const matchesPoints = (points, selected) => {
  if (!selected || selected === 'all points') return true;
  if (Number.isNaN(points)) return false;
  if (selected === '10-20') return points >= 10 && points <= 20;
  if (selected === '20-30') return points >= 20 && points <= 30;
  if (selected === '30+') return points >= 30;
  return true;
};

let selectedServiceName = '';

const openBookingModal = async (serviceName = '') => {
  if (!bookingModalOverlay) return;

  selectedServiceName = serviceName;
  const bookingTitle = document.querySelector('#bookingTitle');
  if (bookingTitle) {
    bookingTitle.textContent = serviceName ? `Book ${serviceName}` : 'Book Your Service';
  }

  // Auto-fill from customer data
  await fillBookingFormFromCustomer();

  // Reset editable fields
  if (bookingDate) bookingDate.value = '';
  if (bookingTime) bookingTime.value = '';
  if (bookingDetails) bookingDetails.value = '';

  bookingModalOverlay.classList.add('active');
  bookingModalOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
};

const closeBookingModal = () => {
  if (!bookingModalOverlay) return;

  bookingModalOverlay.classList.remove('active');
  bookingModalOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

bookingCloseBtn?.addEventListener('click', closeBookingModal);
bookingCancelBtn?.addEventListener('click', closeBookingModal);

bookingModalOverlay?.addEventListener('click', (event) => {
  if (event.target === bookingModalOverlay) {
    closeBookingModal();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && bookingModalOverlay?.classList.contains('active')) {
    closeBookingModal();
  }
});

// ── Booking form submission ──
bookingForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) {
    alert('Please sign in to book a service.');
    closeBookingModal();
    return;
  }

  const date = bookingDate?.value || '';
  const time = bookingTime?.value || '';
  const details = bookingDetails?.value || '';

  console.log('Booking attempt:', {
    authUser: authUser.email,
    serviceName: selectedServiceName,
    date,
    time,
    address: bookingAddress?.value,
  });

  if (!date || !time) {
    alert('Please select date and time.');
    return;
  }

  if (!selectedServiceName) {
    alert('Please click "Book Now" on a service first.');
    return;
  }

  // Parse start/end time from the time slot (e.g. "08:00 AM - 10:00 AM")
  const timeMatch = time.match(/(\d{2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{2}):(\d{2})\s*(AM|PM)/i);
  let startTime = null;
  let endTime = null;
  if (timeMatch) {
    const to24h = (h, m, period) => {
      let hour = parseInt(h);
      const min = m || '00';
      if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
      return `${String(hour).padStart(2, '0')}:${min}:00`;
    };
    startTime = to24h(timeMatch[1], timeMatch[2], timeMatch[3]);
    endTime = to24h(timeMatch[4], timeMatch[5], timeMatch[6]);
  }

  const payload = {
    customer_email: authUser.email,
    service_name: selectedServiceName,
    scheduled_date: date,
    start_time: startTime,
    end_time: endTime,
    address: bookingAddress?.value || '',
    price: 0,
    status: 'upcoming',
    additional_details: details,
  };

  console.log('Sending payload:', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status:', res.status);

    if (!res.ok) {
      const txt = await res.text();
      console.error('Supabase error:', txt);
      throw new Error(txt);
    }

    alert('Booking request submitted successfully!');
    closeBookingModal();
  } catch (err) {
    console.error('Booking error:', err);
    alert(`Failed to submit booking: ${err.message}`);
  }
});

const renderCards = (services) => {
  if (!serviceGrid) return;

  if (!services.length) {
    serviceGrid.innerHTML = '<p class="services-status">No services found in the services table.</p>';
    return;
  }

  serviceGrid.innerHTML = services
    .map((service) => {
      const category = formatCategory(service.category);
      const icon = iconByCategory[normalizeCategory(service.category)] || 'briefcase';
      const price = Number(service.price);
      const duration = Number(service.duration);
      const point = Number(service.points);
      const isActive = isServiceActive(service);

      return `
        <article
          class="card"
          data-service-type="${inferServiceType(service.service_name, category)}"
          data-active="${isActive}"
          ${isActive ? '' : 'hidden aria-hidden="true" style="display: none;"'}
        >
          <div class="icon-chip"><i data-lucide="${icon}"></i></div>
          <h3>${service.service_name}</h3>
          <p>${category}</p>
          <div class="point-info">
            <span class="stars">★ ${point}</span>
          </div>
          <div class="card-meta">
            <div class="price-info">
              <span class="label">Price</span>
              <span class="value">${price}tk</span>
            </div>
            <div class="duration-info">
              <span class="label">Duration</span>
              <span class="value">${duration} ${duration === 1 ? 'hour' : 'hours'}</span>
            </div>
          </div>
          <button class="book-btn" type="button">Book Now</button>
        </article>
      `;
    })
    .join('');

  serviceGrid.querySelectorAll('.book-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.card');
      const serviceName = card?.querySelector('h3')?.textContent.trim() || '';
      openBookingModal(serviceName);
    });
  });

  window.lucide?.createIcons();
};

const applyFilters = () => {
  if (!filterPanel || !serviceGrid) return;

  const selects = filterPanel.querySelectorAll('select');
  const selectedType = normalizeText(selects[0]?.value || 'all services');
  const selectedCategory = normalizeCategory(selects[1]?.value || 'all services');
  const selectedPrice = normalizeText(selects[2]?.value || 'all');
  const selectedPoints = normalizeText(selects[3]?.value || 'all points');

  serviceGrid.querySelectorAll('.card').forEach((card) => {
    const isActive = card.dataset.active !== 'false';
    const title = card.querySelector('h3')?.textContent || '';
    const category = card.querySelector('p')?.textContent || '';
    const pointsText = card.querySelector('.point-info .stars')?.textContent || '';
    const priceText = card.querySelector('.price-info .value')?.textContent || '';

    const cardType = card.dataset.serviceType || inferServiceType(title, category);
    const cardCategory = normalizeCategory(category);
    const cardPoints = parseInt(pointsText.replace(/[^\d]/g, ''), 10);
    const cardPriceRange = getPriceRange(priceText.replace(/[^\d.]/g, ''));

    const typePass = selectedType === 'all services' || selectedType === cardType;
    const categoryPass = selectedCategory === 'all services' || selectedCategory === cardCategory;
    const pricePass = matchesPrice(cardPriceRange, selectedPrice);
    const pointsPass = matchesPoints(cardPoints, selectedPoints);

    const shouldShow = isActive && typePass && categoryPass && pricePass && pointsPass;

    card.style.display = shouldShow ? '' : 'none';
    card.hidden = !shouldShow;
    card.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  });
};

filterPanel?.querySelector('.filter-btn')?.addEventListener('click', applyFilters);

const loadServices = async () => {
  if (!serviceGrid) return;

  serviceGrid.innerHTML = '<p class="services-status">Loading services...</p>';

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/services?select=service_name,category,price,duration,points,is_active&order=service_name.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch services (${response.status})`);
    }

    const services = await response.json();
    renderCards(Array.isArray(services) ? services : []);
    applyFilters();
  } catch (error) {
    console.error('Error loading services:', error);
    serviceGrid.innerHTML =
      '<p class="services-status">Could not load services. Please check Supabase access for the services table.</p>';
  }
};

loadServices();
