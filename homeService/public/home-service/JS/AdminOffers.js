// SUPABASE_URL, SUPABASE_ANON_KEY, and supabaseRequest are defined in admin.js

const offersGrid = document.getElementById('offersGrid');
const editOfferModal = document.getElementById('editOfferModal');
const addOfferModal = document.getElementById('addOfferModal');
const addOfferButton = document.getElementById('addOfferButton');
const editOfferForm = document.getElementById('editOfferForm');
const addOfferForm = document.getElementById('addOfferForm');

const offerTitleInput = document.getElementById('offerTitleInput');
const serviceNameInput = document.getElementById('serviceNameInput');
const categoryNameInput = document.getElementById('categoryNameInput');
const packageNameInput = document.getElementById('packageNameInput');
const discountInput = document.getElementById('discountInput');
const validUntilInput = document.getElementById('validUntilInput');
const editServiceCategoryRow = document.getElementById('editServiceCategoryRow');
const editPackageField = document.getElementById('editPackageField');

const addOfferTitleInput = document.getElementById('addOfferTitleInput');
const addServiceNameInput = document.getElementById('addServiceNameInput');
const addCategoryNameInput = document.getElementById('addCategoryNameInput');
const addPackageNameInput = document.getElementById('addPackageNameInput');
const addDiscountInput = document.getElementById('addDiscountInput');
const addPromoCodeInput = document.getElementById('addPromoCodeInput');
const addValidUntilInput = document.getElementById('addValidUntilInput');

let activeCard = null;
let activeOfferOriginalCode = '';

const normalizeOfferStatus = (offer) => {
  const rawStatus = offer?.status;
  return rawStatus === false ? 'inactive' : 'active';
};

const fallbackServiceOptions = [
  'Home Cleaning', 'Carpet & Upholstery Cleaning', 'Window Cleaning', 'Deep Cleaning',
  'Sofa Cleaning', 'Mattress Cleaning', 'Kitchen & Bathroom Cleaning', 'Leak Repair',
  'Pipe Installation & Maintenance', 'Drain Cleaning', 'Water Heater Repair', 'Faucet & Shower Repair',
  'Bathroom & Toilet Installation', 'Electrical Repair', 'Wiring & Rewiring', 'Lighting Installation',
  'Appliance installation', 'Generator Installation', 'Solar Panel Installation', 'Interior Painting',
  'Exterior Painting', 'Wall Repair & Finishing', 'Home Remodelling', 'Tile Installation & Repair',
  'False Celling Installation', 'AC Repair & Maintenance', 'Refrigerator Repair', 'Washing Machine Repair',
  'Microwave & Oven Repair', 'Tv & Entertainment System Repair', 'Gysers/Water Heater Repairs', 'Termite Control',
  'Mosquito & Insect Control', 'Rodent Control', 'Spider & Ant Treatment', 'Bee & Wasp Removal',
  'Carpentry', 'Flooring Installation', 'Furniture Assembly', 'Handyman Service', 'Door & window Repair',
  'Lock & Key Service', 'Lawn Mowing', 'Tree Trimming', 'Garden Design & Maintenance',
  'Irrigation System Installation', 'Indoor Plant Care', 'Packing & Moving Service', 'Furniture Relocation',
  'Office Shifting', 'Heavy Item Transportation', 'CCTV Installation', 'Smart Lock Installation',
  'Home Automation & Sensors Setup', 'Elderly Care/Home Nursing', 'Physiotherapy at Home',
  'Medical Equipment Setup', 'Sanitation & Hygiene Service',
];

const fallbackCategoryOptions = [
  'Cleaning Services', 'Plumbing Services', 'Electrical Services', 'Painting & Renovation Services',
  'Applience Repair Services', 'Pest Control Services', 'Home Improvement & Maintenance Services',
  'Gardening & Landscaping Services', 'Moving & Logistics Services', 'Home Security Services',
  'Alarm System Setup', 'Healthcare Services', 'Package Offer',
];

const packageOptions = [
  'Basic Home Care', 'Premium Home Care', 'Elite Home Care', 'Basic Helping Hand', 'Premium Helping Hand',
  'Elite Helping Hand', 'New Home Setup', 'Renovation Package', 'Seasonal Maintenance', 'Emergency Care Package',
];

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const normalizeText = (value = '') =>
  String(value).toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();

const inferCategory = (service = '', packageName = '') => {
  if (packageName) return 'Package Offer';
  const normalized = normalizeText(service);
  if (normalized.includes('cleaning')) return 'Cleaning Services';
  if (/(leak|pipe|drain|faucet|plumbing|water heater|toilet)/.test(normalized)) return 'Plumbing Services';
  if (/(electrical|wiring|lighting|generator|solar)/.test(normalized)) return 'Electrical Services';
  if (/(painting|renovation|tile|wall repair|remodelling)/.test(normalized)) return 'Painting & Renovation Services';
  if (/(ac|refrigerator|washing machine|microwave|oven|tv|appliance|hvac|gysers)/.test(normalized)) return 'Applience Repair Services';
  if (/(termite|mosquito|insect|rodent|spider|ant|bee|wasp|pest)/.test(normalized)) return 'Pest Control Services';
  if (/(carpentry|flooring|furniture assembly|handyman|door|lock)/.test(normalized)) return 'Home Improvement & Maintenance Services';
  if (/(lawn|tree|garden|irrigation|plant)/.test(normalized)) return 'Gardening & Landscaping Services';
  if (/(moving|relocation|shifting|transportation|packing)/.test(normalized)) return 'Moving & Logistics Services';
  if (/(cctv|smart lock|automation|sensor)/.test(normalized)) return 'Home Security Services';
  if (/(elderly|physiotherapy|medical|nursing|sanitation)/.test(normalized)) return 'Healthcare Services';
  return 'General';
};

const formatDiscountValue = (value) => {
  const cleaned = String(value ?? '').replace(/%\s*OFF/i, '').replace('%', '').trim();
  return cleaned ? `${cleaned}% OFF` : '';
};

const renderIcons = () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

const getUniqueSortedValues = (items) =>
  Array.from(new Set(items.map((item) => String(item ?? '').trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );

const populateSelectOptions = (select, options) => {
  if (!select) return;
  const placeholderText = select.querySelector('option[value=""]')?.textContent || 'Select option';
  select.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = placeholderText;
  select.appendChild(placeholder);
  options.forEach((option) => {
    const optionEl = document.createElement('option');
    optionEl.value = option;
    optionEl.textContent = option;
    select.appendChild(optionEl);
  });
};

const ensureSelectHasValue = (select, value) => {
  if (!select || !value) return;
  const hasOption = Array.from(select.options).some((option) => option.value === value);
  if (!hasOption) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
};

const setInputValue = (input, value) => {
  if (!input) return;
  if (input.tagName === 'SELECT') ensureSelectHasValue(input, value);
  input.value = value || '';
};

const toggleModal = (modal, show) => {
  if (!modal) return;
  modal.classList.toggle('show', show);
  modal.setAttribute('aria-hidden', show ? 'false' : 'true');
};

const closeEditModal = () => {
  toggleModal(editOfferModal, false);
  activeCard = null;
  activeOfferOriginalCode = '';
};

const closeAddModal = () => {
  toggleModal(addOfferModal, false);
  addOfferForm?.reset();
};

const attachModalHandlers = (modal, closeHandler) => {
  if (!modal) return;
  modal.querySelector('.modal-close')?.addEventListener('click', closeHandler);
  modal.querySelector('.modal-btn.ghost')?.addEventListener('click', closeHandler);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeHandler();
  });
};

const buildOfferFilter = (card) => {
  const promoCode = card?.dataset.offerCode || '';
  const createdAt = card?.dataset.createdAt || '';

  if (promoCode) {
    return `Promo%20Code=eq.${encodeURIComponent(promoCode)}`;
  }

  return `created_at=eq.${encodeURIComponent(createdAt)}`;
};

const createOfferCardMarkup = (offer) => {
  const title = offer['Offer Title'] || 'Untitled Offer';
  const service = offer.Service || '';
  const packageName = offer.Package || '';
  const category = inferCategory(service, packageName);
  const discount = formatDiscountValue(offer.Discount || 0) || '0% OFF';
  const promoCode = offer['Promo Code'] || 'N/A';
  const validUntil = offer['Valid Until'] || '';
  const usedCount = offer.Used ?? 0;
  const createdAt = offer.created_at || '';
  const status = normalizeOfferStatus(offer);

  const serviceCategoryMarkup = packageName
    ? `<p><i data-lucide="package"></i> Package: <span data-offer-package>${escapeHtml(packageName)}</span></p>`
    : `
        <p><i data-lucide="wrench"></i> Service: <strong data-offer-service>${escapeHtml(service || 'N/A')}</strong></p>
        <p><i data-lucide="layers"></i> Category: <span data-offer-category>${escapeHtml(category)}</span></p>
      `;

  return `
    <article class="offer-card ${status}" data-created-at="${escapeHtml(createdAt)}" data-offer-title="${escapeHtml(title)}" data-offer-service="${escapeHtml(service)}" data-offer-category="${escapeHtml(category)}" data-offer-package="${escapeHtml(packageName)}" data-offer-discount="${escapeHtml(String(offer.Discount ?? ''))}" data-offer-code="${escapeHtml(promoCode)}" data-offer-valid="${escapeHtml(validUntil)}" data-offer-used="${escapeHtml(String(usedCount))}" data-offer-status="${escapeHtml(String(offer.status ?? true))}">
      <div class="card-head">
        <div>
          <h3 data-offer-title>${escapeHtml(title)}</h3>
          <h4 data-offer-discount>${escapeHtml(discount)}</h4>
        </div>
        <span class="status-pill">${status}</span>
      </div>
      <div class="offer-meta">
        ${serviceCategoryMarkup}
        <p><i data-lucide="ticket"></i> Code: <strong data-offer-code>${escapeHtml(promoCode)}</strong></p>
        <p><i data-lucide="calendar"></i> Valid until: <span data-offer-valid>${escapeHtml(validUntil || 'N/A')}</span></p>
        <p><i data-lucide="users"></i> Used: <span data-offer-used>${escapeHtml(String(usedCount))}</span> times</p>
      </div>
      <div class="card-actions">
        <button class="action-btn edit"><i data-lucide="pencil"></i><span>Edit</span></button>
        <button class="action-btn toggle ${status !== 'active' ? 'enable' : ''}"><i data-lucide="${status === 'active' ? 'pause' : 'play'}"></i><span>${status === 'active' ? 'Disable' : 'Enable'}</span></button>
        <button class="action-btn delete"><i data-lucide="trash-2"></i></button>
      </div>
    </article>
  `;
};

const renderOffers = (offers) => {
  if (!offersGrid) return;
  if (!Array.isArray(offers) || !offers.length) {
    offersGrid.innerHTML = '<p class="offers-status">No offers found in the Offer table.</p>';
    return;
  }
  offersGrid.innerHTML = offers.map(createOfferCardMarkup).join('');
  renderIcons();
};

const loadServiceDropdownOptions = async () => {
  try {
    const services = await supabaseRequest('/rest/v1/Service?select=Service%20Name,Category&order=Service%20Name.asc', {
      method: 'GET',
    });

    const serviceOptions = getUniqueSortedValues(
      (Array.isArray(services) ? services : []).map((service) => service['Service Name']),
    );
    const categoryOptions = getUniqueSortedValues(
      (Array.isArray(services) ? services : []).map((service) => service.Category),
    );

    populateSelectOptions(serviceNameInput, serviceOptions.length ? serviceOptions : fallbackServiceOptions);
    populateSelectOptions(addServiceNameInput, serviceOptions.length ? serviceOptions : fallbackServiceOptions);
    populateSelectOptions(categoryNameInput, categoryOptions.length ? categoryOptions : fallbackCategoryOptions);
    populateSelectOptions(addCategoryNameInput, categoryOptions.length ? categoryOptions : fallbackCategoryOptions);
  } catch (error) {
    console.error('Error loading service dropdown options:', error);
    populateSelectOptions(serviceNameInput, fallbackServiceOptions);
    populateSelectOptions(addServiceNameInput, fallbackServiceOptions);
    populateSelectOptions(categoryNameInput, fallbackCategoryOptions);
    populateSelectOptions(addCategoryNameInput, fallbackCategoryOptions);
  }
};

const loadOffers = async () => {
  if (!offersGrid) return;
  offersGrid.innerHTML = '<p class="offers-status">Loading offers...</p>';
  try {
  const offers = await supabaseRequest('/rest/v1/Offer?select=*&order=created_at.desc', { method: 'GET' });
    renderOffers(Array.isArray(offers) ? offers : []);
  } catch (error) {
    console.error('Error loading offers:', error);
    offersGrid.innerHTML = '<p class="offers-status">Could not load offers. Please check Supabase access for the Offer table.</p>';
  }
};

const updateCardState = (card, offer) => {
  if (!card) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = createOfferCardMarkup(offer).trim();
  const nextCard = wrapper.firstElementChild;
  if (!nextCard) return;
  card.replaceWith(nextCard);
  if (activeCard === card) activeCard = nextCard;
  renderIcons();
};

const openEditModal = (card) => {
  activeCard = card;
  activeOfferOriginalCode = card.dataset.offerCode || '';
  const packageValue = card.dataset.offerPackage || '';
  const serviceValue = card.dataset.offerService || '';
  const categoryValue = card.dataset.offerCategory || inferCategory(serviceValue, packageValue);
  if (editServiceCategoryRow) editServiceCategoryRow.style.display = packageValue ? 'none' : 'grid';
  if (editPackageField) editPackageField.style.display = packageValue ? 'grid' : 'none';
  setInputValue(offerTitleInput, card.dataset.offerTitle || '');
  setInputValue(serviceNameInput, serviceValue);
  setInputValue(categoryNameInput, categoryValue);
  setInputValue(packageNameInput, packageValue);
  setInputValue(discountInput, formatDiscountValue(card.dataset.offerDiscount || ''));
  setInputValue(validUntilInput, card.dataset.offerValid || '');
  toggleModal(editOfferModal, true);
};

const persistOfferInsert = async (payload) => {
  const insertedRows = await supabaseRequest('/rest/v1/Offer', { method: 'POST', body: JSON.stringify([payload]) });
  if (!insertedRows?.length) throw new Error('Offer record was not created.');
  return insertedRows[0];
};

const persistOfferUpdate = async (card, payload) => {
  const updatedRows = await supabaseRequest(`/rest/v1/Offer?${buildOfferFilter(card)}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!updatedRows?.length) throw new Error('Offer record was not updated.');
  return updatedRows[0];
};

const persistOfferDelete = async (card) => {
  await supabaseRequest(`/rest/v1/Offer?${buildOfferFilter(card)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });
};

const ensureUniquePromoCode = async (promoCode) => {
  const encodedPromoCode = encodeURIComponent(promoCode);

  const existingOffers = await supabaseRequest(
    `/rest/v1/Offer?select=created_at&Promo%20Code=eq.${encodedPromoCode}`,
    { method: 'GET' },
  );

  if (Array.isArray(existingOffers) && existingOffers.length) {
    throw new Error('Promo code already exists. Please use a unique promo code.');
  }
};

const collectOfferFormPayload = ({ titleInput, serviceInput, packageInput, discountField, codeInput, validInput }) => {
  const title = titleInput?.value.trim() || '';
  const service = serviceInput?.value.trim() || '';
  const packageName = packageInput?.value.trim() || '';
  const discountRaw = String(discountField?.value || '').replace(/%\s*OFF/i, '').replace('%', '').trim();
  const promoCode = codeInput ? codeInput.value.trim() : activeOfferOriginalCode;
  const validUntil = validInput?.value.trim() || '';
  if (!title || !discountRaw || !promoCode || !validUntil || (!service && !packageName)) {
    throw new Error('Offer title, discount, promo code, valid until, and either service or package are required.');
  }
  return {
    'Offer Title': title,
    Service: packageName ? null : service,
    Discount: Number(discountRaw),
    'Promo Code': promoCode,
    'Valid Until': validUntil,
    Package: packageName || null,
  };
};

const buildFullOfferUpdatePayload = (card, formPayload) => ({
  ...formPayload,
  Used: Number(card?.dataset.offerUsed ?? 0),
  status: card?.dataset.offerStatus === 'false' ? false : true,
});

offersGrid?.addEventListener('click', async (event) => {
  const button = event.target.closest('.action-btn');
  if (!button) return;
  const card = button.closest('.offer-card');
  if (!card) return;

  if (button.classList.contains('edit')) {
    openEditModal(card);
    return;
  }

  if (button.classList.contains('delete')) {
    if (!window.confirm(`Delete ${card.dataset.offerTitle || 'this offer'} from the Offer table?`)) return;
    button.disabled = true;
    try {
      await persistOfferDelete(card);
      if (activeCard === card) closeEditModal();
      card.remove();
      if (!offersGrid.querySelector('.offer-card')) {
        offersGrid.innerHTML = '<p class="offers-status">No offers found in the Offer table.</p>';
      }
    } catch (error) {
      console.error(error);
      window.alert('Failed to delete offer.');
    } finally {
      button.disabled = false;
    }
    return;
  }

  if (button.classList.contains('toggle')) {
    const nextStatus = card.dataset.offerStatus === 'false' ? true : false;
    button.disabled = true;
    try {
      const updatedOffer = await persistOfferUpdate(card, { status: nextStatus });
      updateCardState(card, updatedOffer);
    } catch (error) {
      console.error(error);
      window.alert('Failed to update offer status.');
    } finally {
      button.disabled = false;
    }
  }
});

editOfferForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!activeCard) {
    closeEditModal();
    return;
  }
  const submitButton = editOfferForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  try {
    const formPayload = collectOfferFormPayload({
      titleInput: offerTitleInput,
      serviceInput: serviceNameInput,
      packageInput: packageNameInput,
      discountField: discountInput,
      validInput: validUntilInput,
    });

    const payload = buildFullOfferUpdatePayload(activeCard, formPayload);
    const updatedOffer = await persistOfferUpdate(activeCard, payload);
    updateCardState(activeCard, updatedOffer);
    closeEditModal();
  } catch (error) {
    console.error(error);
    if (String(error?.message || '').includes('Offer_Promo Code_key')) {
      window.alert('Promo code already exists. Please use a unique promo code.');
      return;
    }
    window.alert(error.message || 'Failed to save offer changes.');
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

addOfferForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = addOfferForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  try {
    const payload = collectOfferFormPayload({
      titleInput: addOfferTitleInput,
      serviceInput: addServiceNameInput,
      packageInput: addPackageNameInput,
      discountField: addDiscountInput,
      codeInput: addPromoCodeInput,
      validInput: addValidUntilInput,
    });
    await ensureUniquePromoCode(payload['Promo Code']);
    const insertedOffer = await persistOfferInsert({ ...payload, Used: 0, status: true });
    const emptyState = offersGrid?.querySelector('.offers-status');
    if (emptyState) emptyState.remove();
    offersGrid?.insertAdjacentHTML('afterbegin', createOfferCardMarkup(insertedOffer));
    renderIcons();
    closeAddModal();
  } catch (error) {
    console.error(error);
    if (String(error?.message || '').includes('Offer_Promo Code_key')) {
      window.alert('Promo code already exists. Please use a unique promo code.');
      return;
    }
    window.alert(error.message || 'Failed to add offer.');
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

addOfferButton?.addEventListener('click', () => {
  addOfferForm?.reset();
  toggleModal(addOfferModal, true);
});

attachModalHandlers(editOfferModal, closeEditModal);
attachModalHandlers(addOfferModal, closeAddModal);

populateSelectOptions(packageNameInput, packageOptions);
populateSelectOptions(addPackageNameInput, packageOptions);

if (editPackageField) editPackageField.style.display = 'none';
loadServiceDropdownOptions();
loadOffers();
