const serviceGrid = document.getElementById("serviceGrid");
const addServiceBtn = document.getElementById("addServiceBtn");
const addServiceModal = document.getElementById("addServiceModal");
const addServiceForm = addServiceModal?.querySelector(".modal-form");
const addServiceInputs = addServiceModal?.querySelectorAll("input") ?? [];
const editServiceModal = document.getElementById("editServiceModal");
const editServiceForm = editServiceModal?.querySelector(".modal-form");
const editServiceInputs = editServiceModal?.querySelectorAll("input") ?? [];

let selectedCardForEdit = null;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDuration = (value) => {
  if (value == null || value === "") {
    return "N/A";
  }

  const rawValue = String(value).trim();

  if (/hour|min|day/i.test(rawValue)) {
    return rawValue;
  }

  const numericValue = Number(rawValue);
  if (Number.isNaN(numericValue)) {
    return rawValue;
  }

  return `${numericValue} ${numericValue === 1 ? "hour" : "hours"}`;
};

const formatPrice = (value) => {
  if (value == null || value === "") {
    return "N/A";
  }

  const rawValue = String(value).trim();
  return /tk$/i.test(rawValue) ? rawValue : `${rawValue}tk`;
};

const normalizeActiveStatus = (service) => {
  const activeValue = service.active ?? service.Active ?? true;
  return activeValue === false ? "inactive" : "active";
};

const supabaseRequest = async (path, options = {}) => {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Supabase request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const buildServiceFilter = (card) => {
  const serviceName = encodeURIComponent(card?.dataset.serviceName || "");
  const category = encodeURIComponent(card?.dataset.category || "");
  return `Service%20Name=eq.${serviceName}&Category=eq.${category}`;
};

const updateCardContent = (card, service) => {
  if (!card) {
    return;
  }

  const serviceName = service["Service Name"] ?? service.service_name ?? "Unnamed Service";
  const category = service.Category ?? service.category ?? "Uncategorized";
  const price = service.Price ?? service.price ?? "N/A";
  const duration = service.Duration ?? service.duration ?? "N/A";
  const point = service.Point ?? service.point ?? service.Points ?? 0;
  const status = normalizeActiveStatus(service);

  card.dataset.serviceName = serviceName;
  card.dataset.category = category;
  card.dataset.price = String(price);
  card.dataset.duration = String(duration);
  card.dataset.point = String(point);
  card.dataset.status = status;

  const title = card.querySelector(".card-head h3");
  const categoryTag = card.querySelector(".category-tag");
  const metaValues = card.querySelectorAll(".service-meta strong");

  if (title) title.textContent = serviceName;
  if (categoryTag) categoryTag.textContent = category;
  if (metaValues[0]) metaValues[0].textContent = formatPrice(price);
  if (metaValues[1]) metaValues[1].textContent = formatDuration(duration);
  if (metaValues[2]) metaValues[2].textContent = String(point);

  updateServiceState(card, status);
};

const persistServiceUpdate = async (card, payload) => {
  const filter = buildServiceFilter(card);
  const updatedRows = await supabaseRequest(`/rest/v1/Service?${filter}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!updatedRows?.length) {
    throw new Error("Service record was not updated.");
  }

  return updatedRows[0];
};

const persistServiceDelete = async (card) => {
  const filter = buildServiceFilter(card);
  await supabaseRequest(`/rest/v1/Service?${filter}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
};

const persistServiceInsert = async (payload) => {
  const insertedRows = await supabaseRequest(`/rest/v1/Service`, {
    method: "POST",
    body: JSON.stringify([payload]),
  });

  if (!insertedRows?.length) {
    throw new Error("Service record was not created.");
  }

  return insertedRows[0];
};

const buildServiceCardMarkup = (service) => {
  const status = normalizeActiveStatus(service);
  const serviceName = service["Service Name"] ?? service.service_name ?? "Unnamed Service";
  const category = service.Category ?? service.category ?? "Uncategorized";
  const price = service.Price ?? service.price ?? "N/A";
  const duration = service.Duration ?? service.duration ?? "N/A";
  const point = service.Point ?? service.point ?? service.Points ?? 0;

  return `
    <article class="service-card" data-status="${status}" data-service-name="${escapeHtml(serviceName)}" data-category="${escapeHtml(category)}" data-price="${escapeHtml(price)}" data-duration="${escapeHtml(duration)}" data-point="${escapeHtml(point)}">
      <div class="card-head">
        <h3>${escapeHtml(serviceName)}</h3>
        <span class="status-pill ${status}">${status}</span>
      </div>
      <span class="category-tag">${escapeHtml(category)}</span>

      <div class="service-meta">
        <div><span>Price</span><strong>${escapeHtml(formatPrice(price))}</strong></div>
        <div><span>Duration</span><strong>${escapeHtml(formatDuration(duration))}</strong></div>
        <div><span>Points</span><strong>${escapeHtml(point)}</strong></div>
      </div>

      <div class="card-actions">
        <button class="action-btn edit"><i data-lucide="pencil"></i><span>Edit</span></button>
        <button class="action-btn toggle ${status !== "active" ? "enable" : ""}"><i data-lucide="${status === "active" ? "pause" : "play"}"></i><span>${status === "active" ? "Disable" : "Enable"}</span></button>
        <button class="action-btn delete"><i data-lucide="trash-2"></i></button>
      </div>
    </article>
  `;
};

const renderServiceCards = (services) => {
  if (!serviceGrid) {
    return;
  }

  if (!Array.isArray(services) || !services.length) {
    serviceGrid.innerHTML = '<p class="services-status">No services found in the Service table.</p>';
    return;
  }

  serviceGrid.innerHTML = services.map(buildServiceCardMarkup).join("");
  renderIcons();
};

const loadServices = async () => {
  if (!serviceGrid) {
    return;
  }

  serviceGrid.innerHTML = '<p class="services-status">Loading services...</p>';

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/Service?select=Service%20Name,Category,Price,Duration,Point,active&order=Service%20Name.asc`,
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
    renderServiceCards(services);
  } catch (error) {
    console.error("Error loading services:", error);
    serviceGrid.innerHTML =
      '<p class="services-status">Could not load services. Please check Supabase access for the Service table.</p>';
  }
};

const renderIcons = () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
};

const updateServiceState = (card, nextStatus) => {
  const statusPill = card.querySelector(".status-pill");
  const toggleBtn = card.querySelector(".action-btn.toggle");
  const toggleText = toggleBtn?.querySelector("span");
  const toggleIcon = toggleBtn?.querySelector("i");

  card.dataset.status = nextStatus;

  if (statusPill) {
    statusPill.className = "status-pill";
    statusPill.classList.add(nextStatus === "active" ? "active" : "inactive");
    statusPill.textContent = nextStatus;
  }

  if (toggleBtn) {
    toggleBtn.classList.toggle("enable", nextStatus !== "active");
  }

  if (toggleText) {
    toggleText.textContent = nextStatus === "active" ? "Disable" : "Enable";
  }

  if (toggleIcon) {
    toggleIcon.setAttribute("data-lucide", nextStatus === "active" ? "pause" : "play");
  }

  renderIcons();
};

const openEditModalForCard = (card) => {
  if (!card || !editServiceModal) {
    return;
  }

  selectedCardForEdit = card;

  if (editServiceInputs[0]) editServiceInputs[0].value = card.dataset.serviceName || "";
  if (editServiceInputs[1]) editServiceInputs[1].value = card.dataset.category || "";
  if (editServiceInputs[2]) editServiceInputs[2].value = card.dataset.point || "";
  if (editServiceInputs[3]) editServiceInputs[3].value = card.dataset.price || "";
  if (editServiceInputs[4]) editServiceInputs[4].value = card.dataset.duration || "";

  toggleModal(editServiceModal, true);
};

const resetServiceForm = (form) => {
  form?.reset();
};

const toggleModal = (modal, isOpen) => {
  if (!modal) {
    return;
  }

  modal.classList.toggle("show", isOpen);
  modal.setAttribute("aria-hidden", (!isOpen).toString());

  if (isOpen) {
    const firstInput = modal.querySelector("input");
    firstInput?.focus();
  }
};

const attachModalHandlers = (modal) => {
  if (!modal) {
    return;
  }

  const closeBtn = modal.querySelector(".modal-close");
  const cancelBtn = modal.querySelector(".modal-btn.ghost");

  closeBtn?.addEventListener("click", () => toggleModal(modal, false));
  cancelBtn?.addEventListener("click", () => toggleModal(modal, false));

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      toggleModal(modal, false);
    }
  });
};

if (serviceGrid) {
  serviceGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".action-btn");

    if (!button) {
      return;
    }

    const card = button.closest(".service-card");
    if (!card) {
      return;
    }

    if (button.classList.contains("toggle")) {
      const isActive = card.dataset.status === "active";
      const nextStatus = isActive ? "inactive" : "active";

      button.disabled = true;

      persistServiceUpdate(card, { active: nextStatus === "active" })
        .then((updatedService) => {
          updateCardContent(card, updatedService);
        })
        .catch((error) => {
          console.error(error);
          window.alert("Failed to update service status.");
        })
        .finally(() => {
          button.disabled = false;
        });

      return;
    }

    if (button.classList.contains("delete")) {
      const serviceName = card.dataset.serviceName || "this service";
      const shouldDelete = window.confirm(`Delete ${serviceName} from the Service table?`);

      if (!shouldDelete) {
        return;
      }

      button.disabled = true;

      persistServiceDelete(card)
        .then(() => {
          if (selectedCardForEdit === card) {
            toggleModal(editServiceModal, false);
            selectedCardForEdit = null;
          }

          card.remove();

          if (!serviceGrid.querySelector(".service-card")) {
            serviceGrid.innerHTML = '<p class="services-status">No services found in the Service table.</p>';
          }
        })
        .catch((error) => {
          console.error(error);
          window.alert("Failed to delete service.");
        })
        .finally(() => {
          button.disabled = false;
        });

      return;
    }

    if (button.classList.contains("edit")) {
      openEditModalForCard(card);
    }
  });
}

if (addServiceBtn) {
  addServiceBtn.addEventListener("click", () => {
    resetServiceForm(addServiceForm);
    toggleModal(addServiceModal, true);
  });
}

attachModalHandlers(addServiceModal);
attachModalHandlers(editServiceModal);

editServiceForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedCardForEdit) {
    toggleModal(editServiceModal, false);
    return;
  }

  const updatedName = editServiceInputs[0]?.value.trim() ?? "";
  const updatedCategory = editServiceInputs[1]?.value.trim() ?? "";
  const updatedPoint = editServiceInputs[2]?.value.trim() ?? "";
  const updatedPrice = editServiceInputs[3]?.value.trim() ?? "";
  const updatedDuration = editServiceInputs[4]?.value.trim() ?? "";

  if (!updatedName || !updatedCategory || !updatedPoint || !updatedPrice || !updatedDuration) {
    window.alert("Service name, category, points, price, and duration are required.");
    return;
  }

  const submitButton = editServiceForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const updatedService = await persistServiceUpdate(selectedCardForEdit, {
      "Service Name": updatedName,
      Category: updatedCategory,
      Point: Number(updatedPoint),
      Price: Number(updatedPrice),
      Duration: Number(updatedDuration),
    });

    updateCardContent(selectedCardForEdit, updatedService);
    toggleModal(editServiceModal, false);
    selectedCardForEdit = null;
  } catch (error) {
    console.error(error);
    window.alert("Failed to save service changes.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});

addServiceForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const serviceName = addServiceInputs[0]?.value.trim() ?? "";
  const category = addServiceInputs[1]?.value.trim() ?? "";
  const point = addServiceInputs[2]?.value.trim() ?? "";
  const price = addServiceInputs[3]?.value.trim() ?? "";
  const duration = addServiceInputs[4]?.value.trim() ?? "";

  if (!serviceName || !category || !point || !price || !duration) {
    window.alert("Service name, category, points, price, and duration are required.");
    return;
  }

  const submitButton = addServiceForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const insertedService = await persistServiceInsert({
      "Service Name": serviceName,
      Category: category,
      Point: Number(point),
      Price: Number(price),
      Duration: Number(duration),
      active: true,
    });

    const emptyState = serviceGrid?.querySelector(".services-status");
    if (emptyState) {
      emptyState.remove();
    }

    serviceGrid?.insertAdjacentHTML("afterbegin", buildServiceCardMarkup(insertedService));
    renderIcons();
    resetServiceForm(addServiceForm);
    toggleModal(addServiceModal, false);
  } catch (error) {
    console.error(error);
    window.alert("Failed to add service.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
});

loadServices();