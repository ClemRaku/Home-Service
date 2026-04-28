// Supabase configuration
const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// DOM elements
const nav = document.querySelector('.navbar');
const filterButtons = document.querySelectorAll('.filter-pill');
const offersGrid = document.querySelector('#offersGrid');
const loadingOverlay = document.querySelector('#loadingOverlay');

// Booking Modal Elements
const bookingModalOverlay = document.querySelector('#bookingModalOverlay');
const bookingCloseBtn = document.querySelector('#bookingCloseBtn');
const bookingCancelBtn = document.querySelector('#bookingCancelBtn');
const bookingForm = document.querySelector('#bookingForm');

const bookingFullName = document.querySelector('#bookingFullName');
const bookingEmail = document.querySelector('#bookingEmail');
const bookingPhone = document.querySelector('#bookingPhone');
const bookingAddress = document.querySelector('#bookingAddress');
const bookingDate = document.querySelector('#bookingDate');
const bookingTime = document.querySelector('#bookingTime');
const bookingDetails = document.querySelector('#bookingDetails');

// Store data for filtering and booking
let allOffers = [];
let allServices = [];
let allPackages = [];
let selectedOffer = null;

console.log('[Offers] Initialization checking DOM elements:', {
  offersGrid: !!offersGrid,
  loadingOverlay: !!loadingOverlay,
  bookingModalOverlay: !!bookingModalOverlay,
  bookingForm: !!bookingForm
});

const hideLoading = () => {
  console.log('[Offers] Hiding loading overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 500);
  }
};

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

  console.log('[Offers] Filling form for user:', authUser.email);
  if (bookingFullName) bookingFullName.value = authUser.name || '';
  if (bookingEmail) bookingEmail.value = authUser.email || '';

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
    console.warn('[Offers] Could not fetch customer details:', err);
  }
};

const openBookingModal = async (offerTitle) => {
  console.log('[Offers] openBookingModal called for:', offerTitle);
  
  if (!bookingModalOverlay) {
    console.error('[Offers] ERROR: bookingModalOverlay element NOT found!');
    return;
  }

  selectedOffer = allOffers.find(o => o.offer_title === offerTitle);
  if (!selectedOffer) {
    console.error('[Offers] ERROR: Offer not found in allOffers array:', offerTitle);
    return;
  }

  console.log('[Offers] Selected offer details:', selectedOffer);

  const bookingTitle = document.querySelector('#bookingTitle');
  if (bookingTitle) {
    bookingTitle.textContent = `Book: ${selectedOffer.offer_title}`;
  }

  await fillBookingFormFromCustomer();

  if (bookingDate) bookingDate.value = '';
  if (bookingTime) bookingTime.value = '';
  if (bookingDetails) {
    bookingDetails.value = `Promo Code: ${selectedOffer.promo_code || 'N/A'}`;
  }

  bookingModalOverlay.classList.add('active');
  bookingModalOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  console.log('[Offers] Modal classes added. Modal should be visible.');
};

const closeBookingModal = () => {
  console.log('[Offers] Closing modal');
  if (!bookingModalOverlay) return;

  bookingModalOverlay.classList.remove('active');
  bookingModalOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  selectedOffer = null;
};

// Event Delegation for "Book This Offer" buttons
if (offersGrid) {
  offersGrid.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('offer-btn')) {
      const card = e.target.closest('.offer-card');
      const title = card?.querySelector('h3')?.textContent.trim() || '';
      console.log('[Offers] Click detected on Book button for:', title);
      openBookingModal(title);
    }
  });
}

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

bookingForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selectedOffer) return;

  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) {
    alert('Please sign in to book an offer.');
    closeBookingModal();
    return;
  }

  const date = bookingDate?.value || '';
  const time = bookingTime?.value || '';
  const details = bookingDetails?.value || '';

  if (!date || !time) {
    alert('Please select date and time.');
    return;
  }

  // Find price from fresh data or allData
  let originalPrice = 0;
  const targetServiceName = selectedOffer.service_name || '';
  const targetPackageName = selectedOffer.package_name || '';
  const offerTitle = selectedOffer.offer_title || '';
  
  console.log('[Offers] Searching price for:', { service: targetServiceName, package: targetPackageName, title: offerTitle });

  // 1. Try Service Match
  if (targetServiceName) {
    const srv = allServices.find(s => 
      normalizeText(s.service_name) === normalizeText(targetServiceName) ||
      normalizeText(s.service_name).includes(normalizeText(targetServiceName)) ||
      normalizeText(targetServiceName).includes(normalizeText(s.service_name))
    );
    if (srv) {
      originalPrice = Number(srv.price) || 0;
      console.log('[Offers] Matched Service:', srv.service_name, 'Price:', originalPrice);
    }
  }

  // 2. Try Package Match if no service price
  if (originalPrice === 0 && targetPackageName) {
    const pkg = allPackages.find(p => 
      normalizeText(p.package_name) === normalizeText(targetPackageName) ||
      normalizeText(p.package_name).includes(normalizeText(targetPackageName)) ||
      normalizeText(targetPackageName).includes(normalizeText(p.package_name))
    );
    if (pkg) {
      originalPrice = Number(pkg.price) || 0;
      console.log('[Offers] Matched Package:', pkg.package_name, 'Price:', originalPrice);
    }
  }

  // 3. Fallback: Search EVERYTHING for title match
  if (originalPrice === 0) {
    const fallbackTerm = normalizeText(offerTitle);
    const fallback = [...allServices, ...allPackages].find(i => {
      const name = normalizeText(i.service_name || i.package_name || '');
      return name.includes(fallbackTerm) || fallbackTerm.includes(name);
    });
    if (fallback) {
      originalPrice = Number(fallback.price) || 0;
      console.log('[Offers] Title Fallback Match:', fallback.service_name || fallback.package_name, 'Price:', originalPrice);
    }
  }

  const discountPercent = Number(selectedOffer.discount) || 0;
  let finalPrice = originalPrice * (1 - (discountPercent / 100));
  
  // FINAL SAFETY: Force to valid number
  if (typeof finalPrice !== 'number' || isNaN(finalPrice) || !isFinite(finalPrice)) {
    finalPrice = 0;
  }

  // Parse start/end time
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
    customer_name: bookingFullName?.value || authUser.name || '',
    service_name: targetServiceName || targetPackageName || offerTitle,
    scheduled_date: date,
    start_time: startTime || '09:00:00',
    end_time: endTime || '11:00:00',
    address: bookingAddress?.value || 'N/A',
    price: Number(finalPrice.toFixed(2)),
    status: 'unassigned',
    additional_details: `Offer: ${offerTitle}. Promo: ${selectedOffer.promo_code || 'N/A'}. ${details}`.trim(),
  };

  console.log('[Offers] Final Payload:', payload);

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

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(errTxt);
    }

    alert('Booking request submitted successfully!');
    closeBookingModal();
  } catch (err) {
    console.error('[Offers] Error submitting booking:', err);
    alert(`Failed to submit booking: ${err.message}`);
  }
});

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
  const filterCategory = mapServiceToFilter(offer.service_name || offer.package_name || '');
  const isActive = isOfferActive(offer);

  return `
    <article
      class="offer-card"
      data-category="${filterCategory}"
      data-active="${isActive}"
      ${isActive ? '' : 'hidden aria-hidden="true" style="display: none;"'}
    >
      <div class="discount-badge">Active</div>
      <div class="offer-body">
        <h3>${offer.offer_title || 'Special Offer'}</h3>
        <p class="offer-desc">${offer.discount || 0}% OFF</p>
        <div class="offer-terms">
          <ul>
            <li><i data-lucide="wrench"></i> Service: ${offer.service_name || offer.package_name || 'N/A'}</li>
            <li><i data-lucide="ticket"></i> Code: ${offer.promo_code || 'N/A'}</li>
            <li><i data-lucide="calendar"></i> Valid until: ${formatDate(offer.valid_until) || 'N/A'}</li>
            <li><i data-lucide="user"></i> Used: ${offer.times_used || 0} times</li>
          </ul>
        </div>
        <button class="offer-btn" type="button">Book This Offer</button>
      </div>
    </article>
  `;
};

// Render offers
const renderOffers = (offers) => {
  console.log('[Offers] Rendering offers to grid');
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

// Load offers, services, and packages from Supabase
const loadData = async () => {
  if (!offersGrid) return;
  offersGrid.innerHTML = '<p class="offers-status">Loading offers...</p>';

  try {
    console.log('[Offers] Fetching data from Supabase...');
    const [offRes, srvRes, pkgRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/offers?select=*&order=offer_title.asc`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      }),
      fetch(`${SUPABASE_URL}/rest/v1/services?select=service_name,price`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      }),
      fetch(`${SUPABASE_URL}/rest/v1/packages?select=package_name,price`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      })
    ]);

    if (!offRes.ok) throw new Error(`Failed to fetch offers (${offRes.status})`);
    
    const offers = await offRes.json();
    allOffers = Array.isArray(offers) ? offers : [];
    console.log('[Offers] Successfully loaded offers:', allOffers.length);
    
    if (srvRes.ok) allServices = await srvRes.json();
    if (pkgRes.ok) allPackages = await pkgRes.json();

    renderOffers(allOffers);
    applyFilters();
  } catch (error) {
    console.error('[Offers] Error loading data:', error);
    offersGrid.innerHTML =
      '<p class="offers-status">Could not load offers. Please check your connection and try again.</p>';
  } finally {
    hideLoading();
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

// Expose openBookingModal to global scope for debugging
window.openBookingModal = openBookingModal;

// Load data on page load
loadData();
