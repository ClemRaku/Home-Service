const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// ── DOM refs ──
const packagesRoot = document.getElementById('packagesRoot');
const addPackageModal = document.getElementById('addPackageModal');
const editPackageModal = document.getElementById('editPackageModal');
const manageCategoriesModal = document.getElementById('manageCategoriesModal');
const categoriesList = document.getElementById('categoriesList');

let allCategories = [];
let editingPackageName = null;

// ── Helpers ──
const escapeHtml = (v = '') => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const formatPrice = (v) => `$${Number(v || 0).toLocaleString()}`;
const colorDot = { teal: '#0d9488', orange: '#f59e0b', purple: '#8b5cf6', blue: '#3b82f6', green: '#22c55e', red: '#ef4444' };

// ── Modal helpers ──
const openModal = (m) => { if (m) { m.classList.add('active'); m.setAttribute('aria-hidden','false'); }};
const closeModal = (m) => { if (m) { m.classList.remove('active'); m.setAttribute('aria-hidden','true'); }};

const bindModal = (openBtn, closeBtn, cancelBtn, modal) => {
  if (openBtn) openBtn.addEventListener('click', () => openModal(modal));
  if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal(modal));
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }
};

// ── Fetch & render categories ──
const loadCategories = async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/package_categories?select=*&order=name.asc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    allCategories = res.ok ? await res.json() : [];
    populateCategoryDropdowns();
    renderCategoriesList();
  } catch (err) { console.error('Error loading categories:', err); }
};

const populateCategoryDropdowns = () => {
  const addSel = document.getElementById('addPackageCategory');
  const editSel = document.getElementById('editPackageCategory');
  const opts = allCategories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  if (addSel) addSel.innerHTML = '<option value="">Select category...</option>' + opts;
  if (editSel) editSel.innerHTML = '<option value="">Select category...</option>' + opts;
};

const renderCategoriesList = () => {
  if (!categoriesList) return;
  if (!allCategories.length) {
    categoriesList.innerHTML = '<p class="loading-text">No categories yet.</p>';
    return;
  }
  categoriesList.innerHTML = allCategories.map(c => `
    <div class="category-item" data-id="${c.id}">
      <span class="category-color-dot ${c.color_class}"></span>
      <div class="category-info">
        <h4>${escapeHtml(c.name)}</h4>
        <p>${escapeHtml(c.description)}</p>
      </div>
      <div class="category-actions">
        <button class="cat-edit-btn" data-action="edit-cat" title="Edit"><i data-lucide="pencil"></i></button>
        <button class="cat-delete-btn" data-action="delete-cat" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `).join('');
  window.lucide?.createIcons();

  // Attach events
  categoriesList.querySelectorAll('[data-action="edit-cat"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('.category-item').dataset.id;
      const cat = allCategories.find(c => c.id === id);
      if (!cat) return;
      const newName = prompt('Category name:', cat.name);
      if (!newName || newName.trim() === cat.name) return;
      const newDesc = prompt('Category description:', cat.description);
      if (newDesc === null) return;
      const newColor = prompt('Color (teal, orange, purple, blue, green, red):', cat.color_class);
      await fetch(`${SUPABASE_URL}/rest/v1/package_categories?id=eq.${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: 'return=minimal' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim(), color_class: newColor?.trim() || cat.color_class })
      });
      loadCategories();
      loadPackages();
    });
  });

  categoriesList.querySelectorAll('[data-action="delete-cat"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('.category-item').dataset.id;
      const cat = allCategories.find(c => c.id === id);
      if (!cat || !confirm(`Delete category "${cat.name}"?`)) return;
      await fetch(`${SUPABASE_URL}/rest/v1/package_categories?id=eq.${id}`, {
        method: 'DELETE',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      });
      loadCategories();
      loadPackages();
    });
  });
};

// ── Fetch & render packages ──
const loadPackages = async () => {
  if (!packagesRoot) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/packages?select=*,package_categories(id,name,description,color_class)&order=price.asc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) throw new Error(`Failed (${res.status})`);
    const packages = await res.json();
    renderPackages(packages);
    window.lucide?.createIcons();
  } catch (err) {
    console.error('Error loading packages:', err);
    packagesRoot.innerHTML = '<p class="loading-text">Could not load packages.</p>';
  }
};

const renderPackages = (packages) => {
  if (!packagesRoot) return;
  if (!packages.length) {
    packagesRoot.innerHTML = `
      <section class="package-section">
        <div class="section-heading">
          <h2>No Packages</h2>
          <p>No packages found. Click "Add Package" to create one.</p>
        </div>
      </section>`;
    return;
  }

  const grouped = {};
  packages.forEach(pkg => {
    const cat = pkg.package_categories;
    if (!cat) return;
    if (!grouped[cat.id]) grouped[cat.id] = { cat, packages: [] };
    grouped[cat.id].packages.push(pkg);
  });

  packagesRoot.innerHTML = Object.values(grouped).map(g => `
    <section class="package-section">
      <div class="section-heading">
        <h2>${escapeHtml(g.cat.name)}</h2>
        <p>${escapeHtml(g.cat.description)}</p>
      </div>
      <div class="package-grid">
        ${g.packages.map(pkg => renderPackageCard(pkg, g.cat.color_class)).join('')}
      </div>
    </section>
  `).join('');
};

const renderPackageCard = (pkg, colorClass) => {
  const services = String(pkg.services_included || '').split('\n').filter(Boolean);
  return `
    <article class="package-card" data-name="${escapeHtml(pkg.package_name)}">
      <div class="card-header">
        <div>
          <h3>${escapeHtml(pkg.package_name)}</h3>
          <p class="card-subtitle">${escapeHtml(pkg.description || '')}</p>
          <span class="status">active</span>
        </div>
        <div class="price">
          <strong>${formatPrice(pkg.price)}</strong>
          <small>/month</small>
        </div>
      </div>
      <div class="card-body">
        <p class="label">Included Services:</p>
        <ul>
          ${services.map(s => `<li><i data-lucide="check"></i> ${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>
      <div class="card-footer">
        <div>
          <span>Discount</span>
          <strong>${pkg.discount || 0}%</strong>
          ${pkg.points ? `<br><span>Points</span><strong>${pkg.points}</strong>` : ''}
        </div>
        <div class="actions">
          <button class="edit-btn" data-action="edit-pkg"><i data-lucide="pencil"></i> Edit</button>
          <button class="danger" data-action="delete-pkg"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    </article>`;
};

// ── Add package ──
const submitAddPackage = async () => {
  const catId = document.getElementById('addPackageCategory')?.value;
  const name = document.getElementById('addPackageName')?.value.trim();
  const price = parseFloat(document.getElementById('addPackagePrice')?.value);
  const discount = parseInt(document.getElementById('addPackageDiscount')?.value) || 0;
  const points = parseInt(document.getElementById('addPackagePoints')?.value) || null;
  const services = document.getElementById('addPackageServices')?.value.trim();

  console.log('Adding package:', { catId, name, price, discount, points, services });

  if (!catId || !name || isNaN(price)) { alert('Please fill in category, name, and price.'); return; }

  const cat = allCategories.find(c => c.id === catId);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: 'return=minimal' },
    body: JSON.stringify({ package_name: name, price, discount, points, category_id: catId, services_included: services, package_category: cat?.name || '', category_description: cat?.description || '', description: '' })
  });

  console.log('Add package response:', res.status, res.statusText);

  if (!res.ok) { const txt = await res.text(); alert(`Failed to add package: ${txt}`); return; }

  // Reset form
  document.getElementById('addPackageName').value = '';
  document.getElementById('addPackagePrice').value = '';
  document.getElementById('addPackageDiscount').value = '';
  document.getElementById('addPackagePoints').value = '';
  document.getElementById('addPackageServices').value = '';
  document.getElementById('addPackageCategory').value = '';

  closeModal(addPackageModal);
  loadPackages();
};

// ── Edit package ──
const openEditPackage = (pkg) => {
  editingPackageName = pkg.package_name;
  document.getElementById('editPackageName').value = pkg.package_name;
  document.getElementById('editPackagePrice').value = pkg.price;
  document.getElementById('editPackageDiscount').value = pkg.discount || 0;
  document.getElementById('editPackagePoints').value = pkg.points || '';
  document.getElementById('editPackageServices').value = pkg.services_included || '';
  document.getElementById('editPackageCategory').value = pkg.category_id || '';
  openModal(editPackageModal);
};

const submitEditPackage = async () => {
  const catId = document.getElementById('editPackageCategory')?.value;
  const name = document.getElementById('editPackageName')?.value.trim();
  const price = parseFloat(document.getElementById('editPackagePrice')?.value);
  const discount = parseInt(document.getElementById('editPackageDiscount')?.value) || 0;
  const points = parseInt(document.getElementById('editPackagePoints')?.value) || null;
  const services = document.getElementById('editPackageServices')?.value.trim();

  console.log('Editing package:', { oldName: editingPackageName, catId, name, price, discount, points, services });

  if (!name || isNaN(price)) { alert('Please fill in name and price.'); return; }

  const cat = allCategories.find(c => c.id === catId);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/packages?package_name=eq.${encodeURIComponent(editingPackageName)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: 'return=minimal' },
    body: JSON.stringify({
      package_name: name, price, discount, points,
      category_id: catId || null,
      services_included: services,
      package_category: cat?.name || '',
      category_description: cat?.description || ''
    })
  });

  console.log('Edit package response:', res.status, res.statusText);

  if (!res.ok) { const txt = await res.text(); alert(`Failed to update package: ${txt}`); return; }
  closeModal(editPackageModal);
  loadPackages();
};

// ── Delete package ──
const deletePackage = async (name) => {
  if (!confirm(`Delete package "${name}"?`)) return;
  await fetch(`${SUPABASE_URL}/rest/v1/packages?package_name=eq.${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  loadPackages();
};

// ── Add category ──
const submitNewCategory = async () => {
  const name = document.getElementById('newCategoryName')?.value.trim();
  const desc = document.getElementById('newCategoryDescription')?.value.trim();
  const color = document.getElementById('newCategoryColor')?.value;

  console.log('Adding category:', { name, desc, color });

  if (!name || !desc) { alert('Please fill in name and description.'); return; }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/package_categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: 'return=minimal' },
    body: JSON.stringify({ name, description: desc, color_class: color })
  });

  console.log('Add category response:', res.status, res.statusText);

  if (!res.ok) { const txt = await res.text(); alert(`Failed to add category: ${txt}`); return; }
  document.getElementById('newCategoryName').value = '';
  document.getElementById('newCategoryDescription').value = '';
  loadCategories();
};

// ── Init ──
const init = () => {
  // Bind modals
  bindModal(
    document.getElementById('openAddPackage'),
    document.getElementById('closeAddPackage'),
    document.getElementById('cancelAddPackage'),
    addPackageModal
  );
  bindModal(
    null,
    document.getElementById('closeEditPackage'),
    document.getElementById('cancelEditPackage'),
    editPackageModal
  );
  bindModal(
    document.getElementById('openManageCategories'),
    document.getElementById('closeCategoriesModal'),
    null,
    manageCategoriesModal
  );

  // Submit handlers
  document.getElementById('submitAddPackage')?.addEventListener('click', submitAddPackage);
  document.getElementById('submitEditPackage')?.addEventListener('click', submitEditPackage);
  document.getElementById('submitNewCategory')?.addEventListener('click', submitNewCategory);

  // Delegate card actions
  if (packagesRoot) {
    packagesRoot.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-action="edit-pkg"]');
      const deleteBtn = e.target.closest('[data-action="delete-pkg"]');

      if (editBtn) {
        const card = editBtn.closest('.package-card');
        const name = card?.dataset.name;
        fetch(`${SUPABASE_URL}/rest/v1/packages?select=*,category_id&package_name=eq.${encodeURIComponent(name)}`, {
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
        }).then(r => r.json()).then(rows => {
          if (rows.length) openEditPackage(rows[0]);
        }).catch(err => { console.error('Fetch error:', err); alert('Failed to fetch package data.'); });
      }
      if (deleteBtn) {
        const card = deleteBtn.closest('.package-card');
        deletePackage(card?.dataset.name);
      }
    });
  }

  // Load data
  loadCategories();
  loadPackages();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
