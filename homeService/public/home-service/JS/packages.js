const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const packagesRoot = document.querySelector('#packagesRoot');
const customGrid = document.getElementById('customGrid');

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
  const match = trimmed.match(/^([^\s]+)\s+(.*)$/);
  if (!match) return { prefix: '✓', text: trimmed };
  const [, prefix, text] = match;
  return { prefix, text };
};

const formatPrice = (value) => `$${Number(value || 0).toLocaleString()}`;

const renderPackageCard = (pkg, cardClass) => {
  const services = splitServices(pkg.services_included);
  const features = [];

  if (pkg.points !== null && pkg.points !== undefined && pkg.points !== '') {
    features.push({ prefix: String(pkg.points), text: 'Points' });
  }

  services.forEach((service) => {
    features.push(featurePrefix(service));
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
          ${features.map((item) => `<li><span>${escapeHtml(item.prefix)}</span> ${escapeHtml(item.text)}</li>`).join('')}
        </ul>
        <button>Choose Package</button>
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
    <button class="outline">Get Quote</button>
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
