const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const serviceGrid = document.querySelector('.service-grid');

const iconByCategory = {
  'cleaning services': 'sparkles',
  'plumbing services': 'wrench',
  'electrical services': 'zap',
  'painting & renovation services': 'paint-roller',
  'appliance repair services': 'settings',
  'pest control services': 'bug',
  'home improvement & maintenance services': 'hammer',
  'gardening & landscaping services': 'leaf',
  'moving & logistics services': 'truck',
  'home security services': 'shield-check',
  'healthcare services': 'heart-pulse',
};

const normalizeCategory = (value = '') => {
  const text = String(value)
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .replace('applience', 'appliance')
    .replace('planting & renovation', 'painting & renovation')
    .replace('health & care', 'healthcare')
    .trim();

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

const getCategoryDescription = (category) => {
  const descriptions = {
    'cleaning services': 'Professional home and deep cleaning services',
    'plumbing services': 'Expert plumbing repairs and installation',
    'electrical services': 'Safe and reliable electrical solutions',
    'painting & renovation services': 'Transform your space with expert painting',
    'appliance repair services': 'Quick fixes for all home appliances',
    'pest control services': 'Effective pest management solutions',
    'home improvement & maintenance services': 'Carpentry and handyman services',
    'gardening & landscaping services': 'Beautiful outdoor spaces',
    'moving & logistics services': 'Reliable moving and transportation',
    'home security services': 'Protect your home with smart security',
    'healthcare services': 'Professional home healthcare solutions',
  };
  return descriptions[category] || 'Professional home services';
};

const renderCategoryCards = (categories) => {
  if (!serviceGrid) return;

  if (!categories.length) {
    serviceGrid.innerHTML = '<p class="no-services">No services available at the moment.</p>';
    return;
  }

  serviceGrid.innerHTML = categories
    .map((category) => {
      const normalizedCat = normalizeCategory(category);
      const icon = iconByCategory[normalizedCat] || 'briefcase';
      const displayName = formatCategory(category);
      const description = getCategoryDescription(normalizedCat);

      return `
        <article class="card">
          <div class="icon-chip"><i data-lucide="${icon}"></i></div>
          <h3>${displayName}</h3>
          <p>${description}</p>
        </article>
      `;
    })
    .join('');

  window.lucide?.createIcons();
};

const loadHomeServices = async () => {
  if (!serviceGrid) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/services?select=category`,
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

    // Extract unique categories
    const uniqueCategories = [...new Set(services.map((s) => normalizeCategory(s.category)))];

    renderCategoryCards(uniqueCategories);
  } catch (error) {
    console.error('Error loading services for home page:', error);
    serviceGrid.innerHTML = '<p class="no-services">Could not load services. Please try again later.</p>';
  }
};

loadHomeServices();