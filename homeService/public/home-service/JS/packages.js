const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const packagesRoot = document.querySelector('#packagesRoot');

const normalizeText = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sectionClassByCategory = {
  'Home Care Packages': 'package-card--teal',
  'Helping Hand Packages': 'package-card--orange',
};

const splitServices = (services = '') =>
  String(services)
    .split('\n')
    .map((item) => normalizeText(item))
    .filter(Boolean);

const featurePrefix = (value = '') => {
  const trimmed = normalizeText(value);
  const match = trimmed.match(/^([^\s]+)\s+(.*)$/);

  if (!match) {
    return { prefix: '✓', text: trimmed };
  }

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

const renderPackages = (packages) => {
  if (!packagesRoot) return;

  if (!packages.length) {
    packagesRoot.innerHTML = `
      <section class="package-section">
        <div class="section-heading">
          <h2>No Packages Found</h2>
          <p>There are currently no package plans available in the database.</p>
        </div>
      </section>
    `;
    return;
  }

  const groupedPackages = packages.reduce((groups, pkg) => {
    const category = normalizeText(pkg.package_category || 'Packages');
    if (!groups[category]) {
      groups[category] = {
        description: normalizeText(pkg.category_description || ''),
        packages: [],
      };
    }
    groups[category].packages.push(pkg);
    return groups;
  }, {});

  packagesRoot.innerHTML = Object.entries(groupedPackages)
    .map(([category, group]) => {
      const cardClass = sectionClassByCategory[category] || 'package-card--teal';
      return `
        <section class="package-section">
          <div class="section-heading">
            <h2>${escapeHtml(category)}</h2>
            <p>${escapeHtml(group.description)}</p>
          </div>
          <div class="package-grid">
            ${group.packages.map((pkg) => renderPackageCard(pkg, cardClass)).join('')}
          </div>
        </section>
      `;
    })
    .join('');
};

const loadPackages = async () => {
  if (!packagesRoot) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/packages?select=package_name,price,discount,services_included,points,package_category,category_description,description&order=package_category.asc&order=price.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch packages (${response.status})`);
    }

    const packages = await response.json();
    renderPackages(Array.isArray(packages) ? packages : []);
    window.lucide?.createIcons();
  } catch (error) {
    console.error('Error loading packages:', error);
    packagesRoot.innerHTML = `
      <section class="package-section">
        <div class="section-heading">
          <h2>Could Not Load Packages</h2>
          <p>Please check Supabase access for the packages table and try again.</p>
        </div>
      </section>
    `;
  }
};

loadPackages();