const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const nav = document.querySelector('.navbar');
const filterButtons = document.querySelectorAll('.filter-pill');
const offersGrid = document.querySelector('.offers-grid');
let activeFilter = 'all';

const imageByCategory = {
  cleaning: '../Image/home-1.jpg',
  plumbing: '../Image/home-0.png',
  electrical: '../Image/home-1.jpg',
  painting: '../Image/home-0.png',
  pest: '../Image/home-1.jpg',
  appliance: '../Image/home-0.png',
  hvac: '../Image/home-1.jpg',
  default: '../Image/home-1.jpg',
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeCategory = (value = '') => {
  const normalizedValue = String(value).trim().toLowerCase();

  if (normalizedValue.includes('clean')) return 'cleaning';
  if (normalizedValue.includes('plumb')) return 'plumbing';
  if (normalizedValue.includes('elect')) return 'electrical';
  if (normalizedValue.includes('paint')) return 'painting';
  if (normalizedValue.includes('pest')) return 'pest';
  if (normalizedValue.includes('appliance')) return 'appliance';
  if (normalizedValue.includes('hvac') || normalizedValue.includes('air')) return 'hvac';

  return '';
};

const formatValidUntil = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';

  if (typeof value === 'number') {
    const asString = String(value);
    if (asString.length === 8) {
      const year = Number(asString.slice(0, 4));
      const month = Number(asString.slice(4, 6));
      const day = Number(asString.slice(6, 8));
      const date = new Date(year, month - 1, day);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }
  }

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return value;
};

const normalizeTerms = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|\|/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

function makeOffer(offer) {
  const title = offer['Offer Title'] || 'Untitled Offer';
  const discount = offer.Discount || 0;
  const promoCode = offer['Promo Code'] || 'N/A';
  const validUntil = formatValidUntil(offer['Valid Until']);
  const description =
    offer.Description || 'Book this offer today and enjoy professional home service at a better price.';
  const category = normalizeCategory(offer.Category || title || description) || 'cleaning';

  return {
    title,
    discount,
    promoCode,
    validUntil,
    description,
    category,
    image: imageByCategory[category] || imageByCategory.default,
  };
}

const setActiveFilter = (targetButton) => {
  filterButtons.forEach((button) => button.classList.remove('active'));
  targetButton.classList.add('active');
};

const filterOffers = (category) => {
  const offerCards = offersGrid.querySelectorAll('.offer-card');

  offerCards.forEach((card) => {
    const matches = category === 'all' || card.dataset.category === category;
    card.classList.toggle('hidden', !matches);
  });
};

const createTermsMarkup = (terms) => {
  if (!terms.length) return '';

  return `
    <div class="offer-terms">
      <h4>Terms &amp; Conditions:</h4>
      <ul>
        ${terms
          .map(
            (term) => `
              <li><i data-lucide="check"></i> ${escapeHtml(term)}</li>
            `,
          )
          .join('')}
      </ul>
    </div>
  `;
};

const renderOffers = (offers) => {
  if (!offers.length) {
    offersGrid.innerHTML = '<p class="offers-status">No offers found in the Offer table.</p>';
    return;
  }

  offersGrid.innerHTML = offers
    .map((rawOffer) => {
      const offer = makeOffer(rawOffer);
      const terms = normalizeTerms(rawOffer.Terms || '');

      return `
        <article class="offer-card" data-category="${escapeHtml(offer.category)}">
          <div class="offer-image">
            <img src="${escapeHtml(offer.image)}" alt="${escapeHtml(offer.title)}" />
            <span class="discount-badge">${escapeHtml(offer.discount)}% OFF</span>
          </div>
          <div class="offer-body">
            <h3>${escapeHtml(offer.title)}</h3>
            <p class="offer-desc">${escapeHtml(offer.description)}</p>
            <p class="offer-meta"><i data-lucide="ticket"></i> Promo Code: ${escapeHtml(offer.promoCode)}</p>
            <p class="offer-meta"><i data-lucide="calendar"></i> Valid until ${escapeHtml(offer.validUntil)}</p>
            ${createTermsMarkup(terms)}
            <button class="offer-btn">Book This Offer</button>
          </div>
        </article>
      `;
    })
    .join('');

  filterOffers(activeFilter);

  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const loadOffers = async () => {
  offersGrid.innerHTML = '<p class="offers-status">Loading offers...</p>';

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/Offer?select=*`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch offers (${response.status}): ${errorText}`);
    }

    const offers = await response.json();
    renderOffers(Array.isArray(offers) ? offers : []);
  } catch (error) {
    offersGrid.innerHTML =
      '<p class="offers-status">Could not load offers. If Supabase RLS blocks access, enable SELECT access for the anon role on the Offer table.</p>';
    console.error('Error loading offers:', error);
  }
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const { filter } = button.dataset;
    activeFilter = filter;
    setActiveFilter(button);
    filterOffers(filter);
  });
});

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

loadOffers();