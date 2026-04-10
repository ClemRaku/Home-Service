const toggleItems = document.querySelectorAll(".preference-item");
const privacyTrigger = document.querySelector(".privacy-trigger");
const passwordTrigger = document.querySelector(".password-trigger");
const twoFactorTrigger = document.querySelector(".twofactor-trigger");
const privacyModal = document.getElementById("privacyModal");
const passwordModal = document.getElementById("passwordModal");
const twoFactorModal = document.getElementById("twoFactorModal");
const privacyCloseButtons = document.querySelectorAll("[data-close-modal]");

const syncToggleState = (item) => {
  const toggle = item.querySelector("input[type='checkbox']");
  if (!toggle) return;
  item.classList.toggle("is-active", toggle.checked);
};

toggleItems.forEach((item) => {
  const toggle = item.querySelector("input[type='checkbox']");
  if (!toggle) return;

  syncToggleState(item);

  toggle.addEventListener("change", () => {
    syncToggleState(item);
  });
});

const openModal = (modal) => {
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
};

const bindTrigger = (trigger, modal) => {
  if (!trigger || !modal) return;

  trigger.addEventListener("click", () => openModal(modal));
  trigger.addEventListener("keypress", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(modal);
    }
  });
};

bindTrigger(privacyTrigger, privacyModal);
bindTrigger(passwordTrigger, passwordModal);
bindTrigger(twoFactorTrigger, twoFactorModal);

privacyCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(privacyModal);
    closeModal(passwordModal);
    closeModal(twoFactorModal);
  });
});

[privacyModal, passwordModal, twoFactorModal].forEach((modal) => {
  if (!modal) return;
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});