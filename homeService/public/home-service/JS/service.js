const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const navbar = document.querySelector('.navbar');
const filterPanel = document.querySelector('.filters');
const serviceGrid = document.querySelector('#serviceGrid');
const bookingModalOverlay = document.querySelector('#bookingModalOverlay');
const bookingCloseBtn = document.querySelector('#bookingCloseBtn');
const bookingCancelBtn = document.querySelector('#bookingCancelBtn');
const bookingServiceType = document.querySelector('#bookingServiceType');

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
  const activeValue = service.active ?? service.Active ?? true;

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

const openBookingModal = (serviceTypeText = '') => {
  if (!bookingModalOverlay) return;

  bookingModalOverlay.classList.add('active');
  bookingModalOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  if (bookingServiceType && serviceTypeText) {
    const hasOption = Array.from(bookingServiceType.options).some(
      (option) => option.textContent.trim() === serviceTypeText,
    );

    bookingServiceType.value = hasOption ? serviceTypeText : '';
  }
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

const renderCards = (services) => {
  if (!serviceGrid) return;

  if (!services.length) {
    serviceGrid.innerHTML = '<p class="services-status">No services found in the Service table.</p>';
    return;
  }

  serviceGrid.innerHTML = services
    .map((service) => {
      const category = formatCategory(service.Category);
      const icon = iconByCategory[normalizeCategory(service.Category)] || 'briefcase';
      const price = Number(service.Price);
      const duration = Number(service.Duration);
      const point = Number(service.Point);
      const isActive = isServiceActive(service);

      return `
        <article
          class="card"
          data-service-type="${inferServiceType(service['Service Name'], category)}"
          data-active="${isActive}"
          ${isActive ? '' : 'hidden aria-hidden="true" style="display: none;"'}
        >
          <div class="icon-chip"><i data-lucide="${icon}"></i></div>
          <h3>${service['Service Name']}</h3>
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
      const serviceTypeText = card?.querySelector('p')?.textContent.trim() || '';
      openBookingModal(serviceTypeText);
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
      `${SUPABASE_URL}/rest/v1/Service?select=Service%20Name,Category,Price,Duration,Point,active&order=Service%20Name.asc`,
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
      '<p class="services-status">Could not load services. Please check Supabase access for the Service table.</p>';
  }
};

loadServices();
