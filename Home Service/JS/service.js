// Get the navbar element
const navbar = document.querySelector('.navbar');
const authLinks = document.querySelector('.auth-links');

const getStoredAuthUser = () => {
  try {
    const raw = localStorage.getItem('hsAuthUser');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const ensureLoggedInNavbarStyles = () => {
  if (document.getElementById('hs-loggedin-navbar-style')) return;

  const style = document.createElement('style');
  style.id = 'hs-loggedin-navbar-style';
  style.textContent = `
    .navbar.navbar-logged-in .auth-links { gap: 0; }
    .navbar.navbar-logged-in .user-actions { display: flex; align-items: center; gap: 12px; }
    .navbar.navbar-logged-in .icon-btn {
      width: 30px;
      height: 30px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: #fff;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: transform .2s ease, background .2s ease;
    }
    .navbar.navbar-logged-in.scrolled .icon-btn { color: #1c1c1c; }
    .navbar.navbar-logged-in .icon-btn:hover {
      background: rgba(255,255,255,.18);
      transform: translateY(-1px);
    }
    .navbar.navbar-logged-in.scrolled .icon-btn:hover { background: rgba(0,0,0,.08); }
    .navbar.navbar-logged-in .icon-btn .lucide { width: 18px; height: 18px; }
    .navbar.navbar-logged-in .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid rgba(0,0,0,.12);
      background: linear-gradient(135deg,#0f9f98,#11c5bb);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      display: grid;
      place-items: center;
      cursor: pointer;
    }
    .navbar.navbar-logged-in:not(.scrolled) .nav-links a { color: #fff; }
    .navbar.navbar-logged-in:not(.scrolled) .nav-links a::after { background: #d2fff9; }
    .navbar.navbar-logged-in:not(.scrolled) .nav-links a:hover { color: #11c5bb; }
  `;

  document.head.append(style);
};

const applyLoggedInNavbar = () => {
  if (!navbar || !authLinks) return;

  const authUser = getStoredAuthUser();
  if (!authUser) return;

  ensureLoggedInNavbarStyles();
  navbar.classList.add('navbar-logged-in');

  const displayName = authUser.name || authUser.role || 'User';
  const initial = displayName.trim().charAt(0).toUpperCase();

  authLinks.innerHTML = `
    <div class="user-actions" data-user-role="${authUser.role || 'customer'}">
      <button type="button" class="icon-btn" aria-label="Notifications">
        <i data-lucide="bell"></i>
      </button>
      <button type="button" class="icon-btn" aria-label="Cart">
        <i data-lucide="shopping-cart"></i>
      </button>
      <button type="button" class="user-avatar" title="${displayName} (${authUser.email || ''})">
        ${initial}
      </button>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const avatarButton = authLinks.querySelector('.user-avatar');
  avatarButton?.addEventListener('click', () => {
    window.location.href = '../Html/CustomerProfile.html';
  });
};

applyLoggedInNavbar();

// Add an event listener to the window to listen for the scroll event
window.addEventListener('scroll', () => {
  if (!navbar) {
    return;
  }

  // Check if the user has scrolled down
  if (window.scrollY > 50) {
    // Add scrolled class for better styling control
    navbar.classList.add('scrolled');
  } else {
    // Remove scrolled class when at top
    navbar.classList.remove('scrolled');
  }
});

// Booking modal logic (Services page)
const bookingModalOverlay = document.querySelector('#bookingModalOverlay');
const bookingModal = document.querySelector('#bookingModal');
const bookingCloseBtn = document.querySelector('#bookingCloseBtn');
const bookingCancelBtn = document.querySelector('#bookingCancelBtn');
const bookingServiceType = document.querySelector('#bookingServiceType');
const bookButtons = document.querySelectorAll('.book-btn');

if (bookingModalOverlay && bookingModal && bookButtons.length) {
  const openBookingModal = (serviceTypeText = '') => {
    bookingModalOverlay.classList.add('active');
    bookingModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    if (bookingServiceType && serviceTypeText) {
      const hasOption = Array.from(bookingServiceType.options).some(
        (option) => option.textContent.trim() === serviceTypeText
      );

      bookingServiceType.value = hasOption ? serviceTypeText : '';
    }
  };

  const closeBookingModal = () => {
    bookingModalOverlay.classList.remove('active');
    bookingModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  bookButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.card');
      const serviceTypeText = card?.querySelector('p')?.textContent.trim() || '';
      openBookingModal(serviceTypeText);
    });
  });

  bookingCloseBtn?.addEventListener('click', closeBookingModal);
  bookingCancelBtn?.addEventListener('click', closeBookingModal);

  bookingModalOverlay.addEventListener('click', (event) => {
    if (event.target === bookingModalOverlay) {
      closeBookingModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && bookingModalOverlay.classList.contains('active')) {
      closeBookingModal();
    }
  });
}

// Services filter logic
const filterPanel = document.querySelector('.filters');
const serviceCards = document.querySelectorAll('.service-grid .card');

if (filterPanel && serviceCards.length) {
  const filterSelects = filterPanel.querySelectorAll('select');
  const filterBtn = filterPanel.querySelector('.filter-btn');

  const serviceTypeSelect = filterSelects[0];
  const categorySelect = filterSelects[1];
  const priceSelect = filterSelects[2];
  const pointsSelect = filterSelects[3];

  const normalizeText = (value = '') =>
    value
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizeCategory = (value = '') => {
    const text = normalizeText(value)
      .replace('applience', 'appliance')
      .replace('planting & renovation', 'painting & renovation')
      .replace('health & care', 'healthcare')
      .replace('pest control', 'pest control')
      .replace('home improvement & maintenance', 'home improvement & maintenance');

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
    if (text.includes('healthcare') || text.includes('nursing') || text.includes('physiotherapy')) return 'healthcare services';

    return text;
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

  const getPriceRange = (priceText) => {
    const numbers = (priceText.match(/\d+/g) || []).map(Number);
    if (!numbers.length) return null;

    if (numbers.length === 1) {
      return { min: numbers[0], max: numbers[0] };
    }

    return { min: Math.min(...numbers), max: Math.max(...numbers) };
  };

  const matchesPrice = (cardRange, selectedRange) => {
    if (!selectedRange || selectedRange === 'all') return true;
    if (!cardRange) return false;

    if (selectedRange === '500-1500tk') {
      return cardRange.min <= 1500 && cardRange.max >= 500;
    }

    if (selectedRange === '1500-5000tk') {
      return cardRange.min <= 5000 && cardRange.max >= 1500;
    }

    if (selectedRange === '5000tk+') {
      return cardRange.max >= 5000;
    }

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

  const applyFilters = () => {
    const selectedType = normalizeText(serviceTypeSelect?.value || 'all services');
    const selectedCategory = normalizeCategory(categorySelect?.value || 'all services');
    const selectedPrice = normalizeText(priceSelect?.value || 'all');
    const selectedPoints = normalizeText(pointsSelect?.value || 'all points');

    serviceCards.forEach((card) => {
      const title = card.querySelector('h3')?.textContent || '';
      const category = card.querySelector('p')?.textContent || '';
      const pointsText = card.querySelector('.point-info .stars')?.textContent || '';
      const priceText = card.querySelector('.price-info .value')?.textContent || '';

      const cardType = inferServiceType(title, category);
      const cardCategory = normalizeCategory(category);
      const cardPoints = parseInt(pointsText.replace(/[^\d]/g, ''), 10);
      const cardPriceRange = getPriceRange(priceText);

      const typePass = selectedType === 'all services' || selectedType === cardType;
      const categoryPass = selectedCategory === 'all services' || selectedCategory === cardCategory;
      const pricePass = matchesPrice(cardPriceRange, selectedPrice);
      const pointsPass = matchesPoints(cardPoints, selectedPoints);

      card.style.display = typePass && categoryPass && pricePass && pointsPass ? '' : 'none';
    });
  };

  filterBtn?.addEventListener('click', applyFilters);
}
