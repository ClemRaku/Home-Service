// Supabase configuration
const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// DOM elements
const nav = document.querySelector('.navbar');
const filterButtons = document.querySelectorAll('.filter-pill');
const offersGrid = document.querySelector('#offersGrid');

// Store offers data for filtering
let allOffers = [];

// Normalize text for category matching
const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Map database service to filter category
const mapServiceToFilter = (service) => {
  const normalized = normalizeText(service);

  if (normalized.includes('cleaning')) return 'cleaning';
  if (normalized.includes('plumbing')) return 'plumbing';
  if (normalized.includes('electrical')) return 'electrical';
  if (normalized.includes('painting') || normalized.includes('renovation')) return 'painting';
  if (normalized.includes('pest')) return 'pest';
  if (normalized.includes('appliance')) return 'appliance';
  if (normalized.includes('hvac')) return 'hvac';

  return 'all';
};

const isOfferActive = (offer = {}) => {
  const statusValue = offer.status ?? offer.Status ?? true;

  if (typeof statusValue === 'string') {
    return statusValue.trim().toLowerCase() === 'true';
  }

  return statusValue !== false;
};

// Format date to readable format
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return dateString;
  }
};

// Create offer card HTML
const createOfferCard = (offer) => {
  const filterCategory = mapServiceToFilter(offer.Service || '');
  const isActive = isOfferActive(offer);

  return `
    <article
      class="offer-card"
      data-category="${filterCategory}"
      data-active="${isActive}"
      ${isActive ? '' : 'hidden aria-hidden="true" style="display: none;"'}
    >
      <div class="offer-image">
        <span class="discount-badge">Active</span>
      </div>
      <div class="offer-body">
        <h3>${offer['Offer Title'] || 'Special Offer'}</h3>
        <p class="offer-desc">${offer.Discount || 0}% OFF</p>
        <div class="offer-terms">
          <ul>
            <li><i data-lucide="wrench"></i> Service: ${offer.Service || 'N/A'}</li>
            <li><i data-lucide="layers"></i> Category: ${offer.Service || 'N/A'}</li>
            <li><i data-lucide="ticket"></i> Code: ${offer['Promo Code'] || 'N/A'}</li>
            <li><i data-lucide="calendar"></i> Valid until: ${formatDate(offer['Valid Until']) || 'N/A'}</li>
            <li><i data-lucide="user"></i> Used: ${offer.Used || 0} times</li>
          </ul>
        </div>
        <button class="offer-btn">Book This Offer</button>
      </div>
    </article>
  `;
};

// Render offers
const renderOffers = (offers) => {
  if (!offers || offers.length === 0) {
    offersGrid.innerHTML = '<p class="offers-status">No offers available at the moment.</p>';
    return;
  }

  offersGrid.innerHTML = offers.map(createOfferCard).join('');
  
  // Re-initialize lucide icons for new cards
  if (window.lucide) {
    lucide.createIcons();
  }
};

// Load offers from Supabase
const loadOffers = async () => {
  offersGrid.innerHTML = '<p class="offers-status">Loading offers...</p>';

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/Offer?select=Offer%20Title,Service,Discount,"Promo Code","Valid Until",Used,status&order=Offer%20Title.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch offers (${response.status})`);
    }

    const offers = await response.json();
    allOffers = Array.isArray(offers) ? offers : [];
    renderOffers(allOffers);
    applyFilters();
  } catch (error) {
    console.error('Error loading offers:', error);
    offersGrid.innerHTML =
      '<p class="offers-status">Could not load offers. Please check your connection and try again.</p>';
  }
};

// Set active filter button
const setActiveFilter = (targetButton) => {
  filterButtons.forEach((button) => button.classList.remove('active'));
  targetButton.classList.add('active');
};

// Filter and display offers
const filterOffers = (category) => {
  const offerCards = document.querySelectorAll('.offer-card');
  offerCards.forEach((card) => {
    const isActive = card.dataset.active !== 'false';
    const matches = category === 'all' || card.dataset.category === category;
    const shouldShow = isActive && matches;

    card.classList.toggle('hidden', !shouldShow);
    card.style.display = shouldShow ? '' : 'none';
    card.hidden = !shouldShow;
    card.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  });
};

// Apply filters
const applyFilters = () => {
  const activeFilter = document.querySelector('.filter-pill.active');
  if (activeFilter) {
    filterOffers(activeFilter.dataset.filter);
  }
};

// Filter button event listeners
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const { filter } = button.dataset;
    setActiveFilter(button);
    filterOffers(filter);
  });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
  if (!nav) return;
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// Load offers on page load
loadOffers();