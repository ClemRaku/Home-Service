const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const packagesRoot = document.querySelector('#packagesRoot');
const customGrid = document.getElementById('customGrid');
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
    console.warn('Could not fetch customer details:', err);
  }
};

let selectedPackageName = '';
let allPackages = [];

const openBookingModal = async (packageName = '') => {
  if (!bookingModalOverlay) return;

  selectedPackageName = packageName;
  const bookingTitle = document.querySelector('#bookingTitle');
  if (bookingTitle) {
    bookingTitle.textContent = packageName ? `Book ${packageName}` : 'Choose Package';
  }

  await fillBookingFormFromCustomer();

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

bookingForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) {
    alert('Please sign in to book a package.');
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

  // Find the selected package and its services
  const selectedPkg = allPackages.find(p => p.package_name === selectedPackageName);
  const servicesToBook = (selectedPkg && selectedPkg._services && selectedPkg._services.length > 0)
    ? selectedPkg._services
    : [selectedPackageName];

  const packagePrice = selectedPkg ? Number(selectedPkg.price) || 0 : 0;
  const pricePerService = servicesToBook.length > 0 ? packagePrice / servicesToBook.length : 0;

  const payloads = servicesToBook.map(serviceName => ({
    customer_email: authUser.email,
    customer_name: bookingFullName?.value || authUser.name || '',
    service_name: serviceName,
    scheduled_date: date,
    start_time: startTime,
    end_time: endTime,
    address: bookingAddress?.value || '',
    price: pricePerService,
    status: 'unassigned',
    additional_details: `Package: ${selectedPackageName}. ${details}`.trim(),
  }));

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payloads),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt);
    }

    alert(`Successfully booked ${servicesToBook.length} services from the ${selectedPackageName} package!`);
    closeBookingModal();
  } catch (err) {
    console.error('Booking error:', err);
    alert(`Failed to submit booking: ${err.message}`);
  }
});

const normalizeText = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const colorClassMap = {
  teal: 'package-card--teal',
  orange: 'package-card--orange',
};

const splitServices = (services = '') =>
  String(services)
    .split('\n')
    .map((item) => normalizeText(item))
    .filter(Boolean);

const featurePrefix = (value = '') => {
  const trimmed = normalizeText(value);
  // Match a leading number (integer or decimal) as prefix
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.*)$/);
  if (!match) return { prefix: null, text: trimmed };
  const [, prefix, text] = match;
  return { prefix, text };
};

const formatPrice = (value) => `৳${Number(value || 0).toLocaleString()}`;

const renderPackageCard = (pkg, cardClass) => {
  const services = pkg._services?.length ? pkg._services : splitServices(pkg.services_included);
  const features = [];

  if (pkg.points !== null && pkg.points !== undefined && pkg.points !== '') {
    features.push({ prefix: String(pkg.points), text: 'Points' });
  }

  const items = pkg._services?.length ? pkg._services : services;
  items.forEach((item) => {
    features.push(featurePrefix(item));
  });

  return `
    <article class="package-card ${cardClass}">
      <div class="package-header">
        <h3>${escapeHtml(pkg.package_name)}</h3>
        <p class="package-subtitle">${escapeHtml(pkg.description || '')}</p>
        <div class="package-price">
          <span class="amount">${formatPrice(pkg.price)}</span>
          <span class="duration">/month</span>
        </div>
      </div>
      <div class="package-body">
        <ul class="package-features">
          ${features.map((item) => `
            <li>
              ${item.prefix ? `<span>${escapeHtml(item.prefix)}</span>` : '<i data-lucide="check"></i>'}
              ${escapeHtml(item.text)}
            </li>
          `).join('')}
        </ul>
        <button type="button" class="choose-package-btn">Choose Package</button>
      </div>
    </article>
  `;
};

const renderCustomCard = (pkg) => `
  <article class="custom-card">
    <span class="custom-icon"><i data-lucide="package"></i></span>
    <h3>${escapeHtml(pkg.package_name)}</h3>
    <p>${escapeHtml(pkg.description || '')}</p>
    <p class="custom-price">${formatPrice(pkg.price)}</p>
    <button class="outline choose-package-btn" type="button">Get Quote</button>
  </article>
`;

const loadPackages = async () => {
  if (!packagesRoot) return;

  try {
    // Fetch categories
    const catRes = await fetch(
      `${SUPABASE_URL}/rest/v1/package_categories?select=*&order=name.asc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const categories = catRes.ok ? await catRes.json() : [];

    // Fetch packages
    const pkgRes = await fetch(
      `${SUPABASE_URL}/rest/v1/packages?select=*,package_categories!inner(id,name,description,color_class)&order=price.asc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );

    if (!pkgRes.ok) throw new Error(`Failed (${pkgRes.status})`);
    const packages = await pkgRes.json();
    allPackages = packages; // Populate global variable

    // Fetch package_services relationship
    const psRes = await fetch(
      `${SUPABASE_URL}/rest/v1/package_services?select=package_name,service_name`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const packageServices = psRes.ok ? await psRes.json() : [];

    // Map services to packages
    const servicesByPackage = {};
    packageServices.forEach(ps => {
      if (!servicesByPackage[ps.package_name]) servicesByPackage[ps.package_name] = [];
      servicesByPackage[ps.package_name].push(ps.service_name);
    });

    // Attach services to packages
    packages.forEach(pkg => {
      pkg._services = servicesByPackage[pkg.package_name] || [];
    });

    if (!packages.length && !categories.length) {
      packagesRoot.innerHTML = `
        <section class="package-section">
          <div class="section-heading">
            <h2>No Packages Found</h2>
            <p>There are currently no package plans available.</p>
          </div>
        </section>`;
      return;
    }

    // Group packages by their category
    const grouped = {};
    packages.forEach((pkg) => {
      const cat = pkg.package_categories;
      if (!cat) return;
      const catName = cat.name;
      if (!grouped[catName]) {
        grouped[catName] = { description: cat.description, color: cat.color_class, packages: [] };
      }
      grouped[catName].packages.push(pkg);
    });

    // Render category sections
    packagesRoot.innerHTML = Object.entries(grouped)
      .map(([catName, data]) => {
        const cardClass = colorClassMap[data.color] || 'package-card--teal';
        return `
          <section class="package-section">
            <div class="section-heading">
              <h2>${escapeHtml(catName)}</h2>
              <p>${escapeHtml(data.description)}</p>
            </div>
            <div class="package-grid">
              ${data.packages.map((pkg) => renderPackageCard(pkg, cardClass)).join('')}
            </div>
          </section>`;
      })
      .join('');

    // Render custom packages (packages without a matched category or special ones)
    if (customGrid) {
      const customPackages = packages.filter((p) => !p.package_categories);
      if (customPackages.length) {
        customGrid.innerHTML = customPackages.map(renderCustomCard).join('');
      } else {
        customGrid.innerHTML = '<p class="loading-text">No custom packages available yet.</p>';
      }
    }

    // Add click handlers for Choose Package / Get Quote buttons
    document.querySelectorAll('.choose-package-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const card = button.closest('.package-card') || button.closest('.custom-card');
        const packageName = card?.querySelector('h3')?.textContent.trim() || '';
        openBookingModal(packageName);
      });
    });

    window.lucide?.createIcons();
  } catch (error) {
    console.error('Error loading packages:', error);
    packagesRoot.innerHTML = `
      <section class="package-section">
        <div class="section-heading">
          <h2>Could Not Load Packages</h2>
          <p>Please try again later.</p>
        </div>
      </section>`;
  }
};

loadPackages();
