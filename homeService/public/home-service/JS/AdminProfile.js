const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileModal = document.getElementById("editProfileModal");
const closeEditProfile = document.getElementById("closeEditProfile");
const cancelEdit = document.getElementById("cancelEdit");
const saveProfileChanges = document.getElementById("saveProfileChanges");
const updatePassword = document.getElementById("updatePassword");
const saveModalChanges = document.getElementById("saveModalChanges");
const profileToast = document.getElementById("profileToast");
const toastMessage = document.getElementById("toastMessage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileRole = document.getElementById("profileRole");
const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");
const displayPhone = document.getElementById("displayPhone");
const displayRole = document.getElementById("displayRole");
const modalName = document.getElementById("modalName");
const modalEmail = document.getElementById("modalEmail");
const modalPhone = document.getElementById("modalPhone");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const savedProfile = {
  name: profileName?.value || "",
  email: profileEmail?.value || "",
  phone: profilePhone?.value || "",
  role: profileRole?.value || "",
};

if (editProfileBtn && editProfileModal) {
  const openModal = () => {
    if (modalName) modalName.value = savedProfile.name;
    if (modalEmail) modalEmail.value = savedProfile.email;
    if (modalPhone) modalPhone.value = savedProfile.phone;
    editProfileModal.classList.add("active");
    editProfileModal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    if (modalName) modalName.value = savedProfile.name;
    if (modalEmail) modalEmail.value = savedProfile.email;
    if (modalPhone) modalPhone.value = savedProfile.phone;
    editProfileModal.classList.remove("active");
    editProfileModal.setAttribute("aria-hidden", "true");
  };

  editProfileBtn.addEventListener("click", openModal);
  closeEditProfile?.addEventListener("click", closeModal);
  cancelEdit?.addEventListener("click", closeModal);
  editProfileModal.addEventListener("click", (event) => {
    if (event.target === editProfileModal) {
      closeModal();
    }
  });
}

const showToast = (message) => {
  if (!profileToast) return;
  if (toastMessage) {
    toastMessage.textContent = message;
  }
  profileToast.classList.add("show");
  clearTimeout(profileToast.dataset.timer);
  const timer = setTimeout(() => {
    profileToast.classList.remove("show");
  }, 2000);
  profileToast.dataset.timer = timer;
};

saveModalChanges?.addEventListener("click", () => {
  if (modalName) savedProfile.name = modalName.value.trim() || savedProfile.name;
  if (modalEmail) savedProfile.email = modalEmail.value.trim() || savedProfile.email;
  if (modalPhone) savedProfile.phone = modalPhone.value.trim() || savedProfile.phone;
  if (profileName) profileName.value = savedProfile.name;
  if (profileEmail) profileEmail.value = savedProfile.email;
  if (profilePhone) profilePhone.value = savedProfile.phone;
  if (displayName) displayName.textContent = savedProfile.name;
  if (displayEmail) displayEmail.textContent = savedProfile.email;
  if (displayPhone) displayPhone.textContent = savedProfile.phone;
  showToast("Profile changes saved.");
  editProfileModal?.classList.remove("active");
  editProfileModal?.setAttribute("aria-hidden", "true");
});

const revertIfUnsaved = (input, key) => {
  if (!input) return;
  input.addEventListener("blur", () => {
    input.value = savedProfile[key];
  });
};

revertIfUnsaved(profileName, "name");
revertIfUnsaved(profileEmail, "email");
revertIfUnsaved(profilePhone, "phone");
revertIfUnsaved(profileRole, "role");

const clearPasswordFields = () => {
  if (currentPassword) currentPassword.value = "";
  if (newPassword) newPassword.value = "";
  if (confirmPassword) confirmPassword.value = "";
};

currentPassword?.addEventListener("blur", () => {
  currentPassword.value = "";
});
newPassword?.addEventListener("blur", () => {
  newPassword.value = "";
});
confirmPassword?.addEventListener("blur", () => {
  confirmPassword.value = "";
});

saveProfileChanges?.addEventListener("click", () => {
  if (profileName) savedProfile.name = profileName.value.trim() || savedProfile.name;
  if (profileEmail) savedProfile.email = profileEmail.value.trim() || savedProfile.email;
  if (profilePhone) savedProfile.phone = profilePhone.value.trim() || savedProfile.phone;
  if (profileRole) savedProfile.role = profileRole.value.trim() || savedProfile.role;
  if (displayName) displayName.textContent = savedProfile.name;
  if (displayEmail) displayEmail.textContent = savedProfile.email;
  if (displayPhone) displayPhone.textContent = savedProfile.phone;
  if (displayRole) displayRole.textContent = savedProfile.role;
  if (profileName) profileName.value = savedProfile.name;
  if (profileEmail) profileEmail.value = savedProfile.email;
  if (profilePhone) profilePhone.value = savedProfile.phone;
  if (profileRole) profileRole.value = savedProfile.role;
  showToast("Profile updated successfully.");
});

updatePassword?.addEventListener("click", () => {
  showToast("Password updated successfully.");
  clearPasswordFields();
});

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}