if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

const openAddPackage = document.getElementById("openAddPackage");
const addPackageModal = document.getElementById("addPackageModal");
const closeAddPackage = document.getElementById("closeAddPackage");
const cancelAddPackage = document.getElementById("cancelAddPackage");
const editPackageModal = document.getElementById("editPackageModal");
const closeEditPackage = document.getElementById("closeEditPackage");
const cancelEditPackage = document.getElementById("cancelEditPackage");
const editButtons = document.querySelectorAll(".edit-btn");
const submitAddPackage = document.getElementById("submitAddPackage");
const submitEditPackage = document.getElementById("submitEditPackage");
const editPackageName = document.getElementById("editPackageName");
const editPackagePrice = document.getElementById("editPackagePrice");
const editPackageDiscount = document.getElementById("editPackageDiscount");
const editPackagePoints = document.getElementById("editPackagePoints");
const addPackageName = document.getElementById("addPackageName");
const addPackagePrice = document.getElementById("addPackagePrice");
const addPackageDiscount = document.getElementById("addPackageDiscount");
const addPackagePoints = document.getElementById("addPackagePoints");
const toggleServiceList = document.getElementById("toggleServiceList");
const servicePicker = document.getElementById("servicePicker");
const servicePickerGrid = document.getElementById("servicePickerGrid");
const selectedServices = document.getElementById("selectedServices");
const customServiceInput = document.getElementById("customServiceInput");
const addCustomService = document.getElementById("addCustomService");
const toggleServiceListEdit = document.getElementById("toggleServiceListEdit");
const servicePickerEdit = document.getElementById("servicePickerEdit");
const servicePickerGridEdit = document.getElementById("servicePickerGridEdit");
const selectedServicesEdit = document.getElementById("selectedServicesEdit");
const customServiceInputEdit = document.getElementById("customServiceInputEdit");
const addCustomServiceEdit = document.getElementById("addCustomServiceEdit");
const serviceOrder = [];
const serviceOrderEdit = [];

servicePickerGrid?.querySelectorAll("label").forEach((label) => {
  serviceOrder.push(label.textContent?.trim() || "");
});

servicePickerGridEdit?.querySelectorAll("label").forEach((label) => {
  serviceOrderEdit.push(label.textContent?.trim() || "");
});

const toggleModal = (show) => {
  if (!addPackageModal) return;
  addPackageModal.classList.toggle("active", show);
  addPackageModal.setAttribute("aria-hidden", show ? "false" : "true");
};

const toggleEditModal = (show) => {
  if (!editPackageModal) return;
  editPackageModal.classList.toggle("active", show);
  editPackageModal.setAttribute("aria-hidden", show ? "false" : "true");
};

openAddPackage?.addEventListener("click", () => toggleModal(true));
closeAddPackage?.addEventListener("click", () => toggleModal(false));
cancelAddPackage?.addEventListener("click", () => toggleModal(false));

let activeEditCard = null;

const insertLabelByOrder = (label, pickerGrid, order) => {
  if (!pickerGrid) return;
  const serviceName = label.dataset.service || label.textContent?.trim() || "";
  const input = label.querySelector("input");
  if (input) {
    input.checked = false;
  }

  const index = order.indexOf(serviceName);
  const siblings = Array.from(pickerGrid.querySelectorAll("label"));
  if (index === -1 || siblings.length === 0) {
    pickerGrid.appendChild(label);
    return;
  }

  let inserted = false;
  for (const sibling of siblings) {
    const siblingIndex = order.indexOf(sibling.textContent?.trim() || "");
    if (siblingIndex === -1 || siblingIndex > index) {
      pickerGrid.insertBefore(label, sibling);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    pickerGrid.appendChild(label);
  }
};

const setSelectedServices = (services, selectedContainer, pickerGrid, order) => {
  if (!selectedContainer || !pickerGrid) return;

  const currentLabels = Array.from(selectedContainer.querySelectorAll("label"));
  currentLabels.forEach((label) => {
    insertLabelByOrder(label, pickerGrid, order);
  });

  services.forEach((serviceName) => {
    if (!serviceName) return;
    const availableLabels = Array.from(pickerGrid.querySelectorAll("label"));
    const matchingLabel = availableLabels.find(
      (label) => label.textContent?.trim() === serviceName
    );

    if (matchingLabel) {
      const input = matchingLabel.querySelector("input");
      if (input) {
        input.checked = true;
      }
      matchingLabel.dataset.service = serviceName;
      selectedContainer.appendChild(matchingLabel);
    } else {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = true;
      label.appendChild(input);
      label.append(` ${serviceName}`);
      label.dataset.service = serviceName;
      selectedContainer.appendChild(label);
      if (!order.includes(serviceName)) {
        order.push(serviceName);
      }
    }
  });
};

const populateEditModalFromCard = (card) => {
  if (!card) return;
  const name = card.querySelector("h3")?.textContent?.trim() || "";
  const priceText = card.querySelector(".price strong")?.textContent?.trim() || "";
  const priceValue = priceText.replace(/[^0-9.]/g, "");
  const services = Array.from(card.querySelectorAll(".card-body li"))
    .map((item) => item.textContent?.trim() || "")
    .filter(Boolean);
  const pointsService = services.find((service) => /points/i.test(service));
  const pointsMatch = pointsService?.match(/([\d,.]+)/);
  const pointsValue = pointsMatch ? pointsMatch[1].replace(/,/g, "") : "";
  const filteredServices = services.filter((service) => !/points/i.test(service));

  if (editPackageName) editPackageName.value = name;
  if (editPackagePrice) editPackagePrice.value = priceValue;
  if (editPackageDiscount) editPackageDiscount.value = "";
  if (editPackagePoints) editPackagePoints.value = pointsValue;
  setSelectedServices(filteredServices, selectedServicesEdit, servicePickerGridEdit, serviceOrderEdit);
};

const getServicesFromSelected = (selectedContainer) =>
  Array.from(selectedContainer?.querySelectorAll("label") || [])
    .map((label) => label.textContent?.trim() || "")
    .filter(Boolean);

const buildServiceListItems = (services, points) => {
  const listItems = [];
  if (points) {
    listItems.push(`<li><i data-lucide="check"></i> ${points} Points</li>`);
  }
  services.forEach((service) => {
    listItems.push(`<li><i data-lucide="check"></i> ${service}</li>`);
  });
  return listItems.join("");
};

const updateCardFromForm = (card, { name, price, points, services }) => {
  if (!card) return;
  const title = card.querySelector("h3");
  const priceEl = card.querySelector(".price strong");
  const listEl = card.querySelector(".card-body ul");
  if (title) title.textContent = name || "Package";
  if (priceEl) priceEl.textContent = `$${price || 0}`;
  if (listEl) {
    listEl.innerHTML = buildServiceListItems(services, points);
  }
  lucide?.createIcons();
};

const attachCardActions = (card) => {
  if (!card) return;
  const editBtn = card.querySelector(".edit-btn");
  const disableBtn = card.querySelector(".actions .muted");
  const deleteBtn = card.querySelector(".actions .danger");

  editBtn?.addEventListener("click", (event) => {
    const target = event.currentTarget;
    const parentCard = target?.closest(".package-card");
    populateEditModalFromCard(parentCard);
    activeEditCard = parentCard;
    toggleEditModal(true);
  });

  disableBtn?.addEventListener("click", () => {
    const status = card.querySelector(".status");
    const isDisabled = card.classList.toggle("disabled");
    disableBtn.classList.toggle("disabled-toggle", isDisabled);
    if (status) {
      status.textContent = isDisabled ? "disabled" : "active";
      status.classList.toggle("disabled", isDisabled);
    }
    disableBtn.innerHTML = isDisabled
      ? '<i data-lucide="play"></i> Enable'
      : '<i data-lucide="pause"></i> Disable';
    lucide?.createIcons();
  });

  deleteBtn?.addEventListener("click", () => {
    const name = card.querySelector("h3")?.textContent?.trim() || "this package";
    if (window.confirm(`Delete ${name}?`)) {
      card.remove();
    }
  });
};

const createPackageCard = ({ name, price, services, points }) => {
  const card = document.createElement("article");
  card.className = "package-card";
  card.innerHTML = `
    <div class="card-header">
      <div>
        <h3>${name || "New Package"}</h3>
        <p class="card-subtitle">Newly added package</p>
        <span class="status">active</span>
      </div>
      <div class="price">
        <strong>$${price || 0}</strong>
        <small>/month</small>
      </div>
    </div>
    <div class="card-body">
      <p class="label">Included Services:</p>
      <ul>
        ${buildServiceListItems(services, points)}
      </ul>
    </div>
    <div class="card-footer">
      <div>
        <span>Total Sales</span>
        <strong>0 packages</strong>
      </div>
      <div class="actions">
        <button class="edit-btn"><i data-lucide="pencil"></i> Edit</button>
        <button class="muted"><i data-lucide="pause"></i> Disable</button>
        <button class="danger"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `;

  attachCardActions(card);

  return card;
};

editButtons?.forEach((button) => {
  const card = button.closest(".package-card");
  if (card) {
    attachCardActions(card);
  }
});

closeEditPackage?.addEventListener("click", () => toggleEditModal(false));
cancelEditPackage?.addEventListener("click", () => toggleEditModal(false));

addPackageModal?.addEventListener("click", (event) => {
  if (event.target === addPackageModal) {
    toggleModal(false);
  }
});

editPackageModal?.addEventListener("click", (event) => {
  if (event.target === editPackageModal) {
    toggleEditModal(false);
  }
});

submitEditPackage?.addEventListener("click", () => {
  if (!activeEditCard) return;
  const services = getServicesFromSelected(selectedServicesEdit);
  updateCardFromForm(activeEditCard, {
    name: editPackageName?.value.trim(),
    price: editPackagePrice?.value.trim(),
    points: editPackagePoints?.value.trim(),
    services,
  });
  toggleEditModal(false);
});

submitAddPackage?.addEventListener("click", () => {
  const services = getServicesFromSelected(selectedServices);
  const newCard = createPackageCard({
    name: addPackageName?.value.trim(),
    price: addPackagePrice?.value.trim(),
    points: addPackagePoints?.value.trim(),
    services,
  });
  const grid = document.querySelector(".package-section .package-grid");
  grid?.prepend(newCard);
  addPackageName && (addPackageName.value = "");
  addPackagePrice && (addPackagePrice.value = "");
  addPackageDiscount && (addPackageDiscount.value = "");
  addPackagePoints && (addPackagePoints.value = "");
  toggleModal(false);
  lucide?.createIcons();
});

const setupServicePicker = ({
  toggleButton,
  picker,
  pickerGrid,
  selectedContainer,
  customInput,
  addButton,
  order,
}) => {
  toggleButton?.addEventListener("click", () => {
    picker?.classList.toggle("hidden");
  });

  pickerGrid?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
      return;
    }
    if (!selectedContainer || !target.checked) {
      return;
    }

    const label = target.closest("label");
    if (!label) return;

    const clonedLabel = label.cloneNode(true);
    const clonedInput = clonedLabel.querySelector("input");
    if (clonedInput) {
      clonedInput.checked = true;
    }
    clonedLabel.dataset.service = label.textContent?.trim() || "";
    clonedInput?.addEventListener("change", handleSelectedChange);
    selectedContainer.appendChild(clonedLabel);
    label.remove();
  });

  const handleSelectedChange = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
      return;
    }
    if (target.checked) return;
    const label = target.closest("label");
    if (!label || !pickerGrid) return;
    const serviceName = label.dataset.service || label.textContent?.trim() || "";
    const restoredLabel = label.cloneNode(true);
    const restoredInput = restoredLabel.querySelector("input");
    if (restoredInput) {
      restoredInput.checked = false;
    }

    const index = order.indexOf(serviceName);
    const siblings = Array.from(pickerGrid.querySelectorAll("label"));
    if (index === -1 || siblings.length === 0) {
      pickerGrid.appendChild(restoredLabel);
    } else {
      let inserted = false;
      for (const sibling of siblings) {
        const siblingIndex = order.indexOf(sibling.textContent?.trim() || "");
        if (siblingIndex === -1 || siblingIndex > index) {
          pickerGrid.insertBefore(restoredLabel, sibling);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        pickerGrid.appendChild(restoredLabel);
      }
    }

    label.remove();
  };

  selectedContainer?.addEventListener("change", handleSelectedChange);

  addButton?.addEventListener("click", () => {
    if (!customInput || !pickerGrid) return;
    const value = customInput.value.trim();
    if (!value) return;

    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    label.appendChild(input);
    label.append(` ${value}`);
    pickerGrid.prepend(label);
    order.unshift(value);
    customInput.value = "";
  });
};

setupServicePicker({
  toggleButton: toggleServiceList,
  picker: servicePicker,
  pickerGrid: servicePickerGrid,
  selectedContainer: selectedServices,
  customInput: customServiceInput,
  addButton: addCustomService,
  order: serviceOrder,
});

setupServicePicker({
  toggleButton: toggleServiceListEdit,
  picker: servicePickerEdit,
  pickerGrid: servicePickerGridEdit,
  selectedContainer: selectedServicesEdit,
  customInput: customServiceInputEdit,
  addButton: addCustomServiceEdit,
  order: serviceOrderEdit,
});