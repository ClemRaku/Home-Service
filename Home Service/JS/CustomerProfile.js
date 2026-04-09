const navLinks = document.querySelectorAll(".profile-nav a");

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

const cameraButton = document.querySelector(".camera-btn");
const avatarInput = document.querySelector("#avatarInput");
const profileAvatar = document.querySelector("#profileAvatar");
const editProfileBtn = document.querySelector("#editProfileBtn");
const secondaryActionBtn = document.querySelector("#secondaryActionBtn");
const profileActions = document.querySelector("#profileActions");
const profileNameHeading = document.querySelector(".name-row h3");
const profileFields = Array.from(
  document.querySelectorAll(".form-grid input, .form-grid textarea")
);
const passwordModalOverlay = document.querySelector("#passwordModalOverlay");
const passwordSaveBtn = document.querySelector("#passwordSaveBtn");
const passwordCancelBtn = document.querySelector("#passwordCancelBtn");
const currentPasswordInput = document.querySelector("#currentPasswordInput");
const newPasswordInput = document.querySelector("#newPasswordInput");
const confirmPasswordInput = document.querySelector("#confirmPasswordInput");

let isEditing = false;
let previousValues = [];

if (cameraButton && avatarInput) {
  cameraButton.addEventListener("click", () => {
    avatarInput.click();
  });
}

if (avatarInput && profileAvatar) {
  avatarInput.addEventListener("change", (event) => {
    const [file] = event.target.files;

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      profileAvatar.src = loadEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
}

const setReadonlyState = (readonly = true) => {
  profileFields.forEach((field) => {
    if (readonly) {
      field.setAttribute("readonly", "readonly");
    } else {
      field.removeAttribute("readonly");
    }
  });
};

const setEditModeUI = (editing) => {
  if (!editProfileBtn || !secondaryActionBtn || !profileActions) {
    return;
  }

  if (editing) {
    profileActions.classList.add("editing");
    editProfileBtn.innerHTML = '<i class="fa-regular fa-floppy-disk"></i><span>Save Profile</span>';
    secondaryActionBtn.textContent = "Cancel";
  } else {
    profileActions.classList.remove("editing");
    editProfileBtn.textContent = "Edit Profile";
    secondaryActionBtn.textContent = "Change Password";
  }
};

const startEditing = () => {
  previousValues = profileFields.map((field) => field.value);
  isEditing = true;
  setReadonlyState(false);
  setEditModeUI(true);
  profileFields[0]?.focus();
};

const saveProfile = () => {
  isEditing = false;
  setReadonlyState(true);
  setEditModeUI(false);

  const fullNameField = profileFields.find((field) => {
    const label = field.closest("label")?.querySelector("span")?.textContent?.trim();
    return label === "Full Name";
  });

  if (profileNameHeading && fullNameField) {
    profileNameHeading.textContent = fullNameField.value || profileNameHeading.textContent;
  }
};

const cancelEditing = () => {
  profileFields.forEach((field, index) => {
    field.value = previousValues[index] ?? field.value;
  });
  isEditing = false;
  setReadonlyState(true);
  setEditModeUI(false);
};

const clearPasswordFields = () => {
  if (currentPasswordInput) currentPasswordInput.value = "";
  if (newPasswordInput) newPasswordInput.value = "";
  if (confirmPasswordInput) confirmPasswordInput.value = "";
};

const openPasswordModal = () => {
  if (!passwordModalOverlay) return;
  passwordModalOverlay.classList.add("active");
  passwordModalOverlay.setAttribute("aria-hidden", "false");
  currentPasswordInput?.focus();
};

const closePasswordModal = () => {
  if (!passwordModalOverlay) return;
  passwordModalOverlay.classList.remove("active");
  passwordModalOverlay.setAttribute("aria-hidden", "true");
  clearPasswordFields();
};

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", () => {
    if (!isEditing) {
      startEditing();
      return;
    }

    saveProfile();
  });
}

if (secondaryActionBtn) {
  secondaryActionBtn.addEventListener("click", () => {
    if (isEditing) {
      cancelEditing();
      return;
    }

    openPasswordModal();
  });
}

passwordCancelBtn?.addEventListener("click", closePasswordModal);

passwordModalOverlay?.addEventListener("click", (event) => {
  if (event.target === passwordModalOverlay) {
    closePasswordModal();
  }
});

passwordSaveBtn?.addEventListener("click", () => {
  const currentPassword = currentPasswordInput?.value.trim() || "";
  const newPassword = newPasswordInput?.value.trim() || "";
  const confirmPassword = confirmPasswordInput?.value.trim() || "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    window.alert("Please fill in all password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    window.alert("New password and confirm password do not match.");
    return;
  }

  window.alert("Password updated successfully.");
  closePasswordModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && passwordModalOverlay?.classList.contains("active")) {
    closePasswordModal();
  }
});
