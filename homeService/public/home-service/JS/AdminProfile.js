 const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

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
const displayStatus = document.getElementById("displayStatus");
const displayJoined = document.getElementById("displayJoined");
const topbarAdminName = document.getElementById("topbarAdminName");
const topbarAdminRole = document.getElementById("topbarAdminRole");
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

let adminIdentifierEmail = "";

const formatJoinedDate = (value) => {
  if (!value) return "Joined N/A";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return `Joined ${String(value)}`;
  }

  return `Joined ${parsedDate.toISOString().split("T")[0]}`;
};

const normalizeStatusLabel = (value) => {
  if (typeof value === "boolean") {
    return value ? "Active" : "Inactive";
  }

  const statusText = String(value || "").trim().toLowerCase();
  return statusText === "inactive" || statusText === "false" ? "Inactive" : "Active";
};

const ADMIN_ROLE_FILTER = 'Role=ilike.admin';

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

const applyProfileToUi = ({ name, email, phone, role, status, joined }) => {
  savedProfile.name = name || savedProfile.name;
  savedProfile.email = email || savedProfile.email;
  savedProfile.phone = phone || savedProfile.phone;
  savedProfile.role = role || savedProfile.role;

  if (profileName) profileName.value = savedProfile.name;
  if (profileEmail) profileEmail.value = savedProfile.email;
  if (profilePhone) profilePhone.value = savedProfile.phone;
  if (profileRole) profileRole.value = savedProfile.role;
  if (displayName) displayName.textContent = savedProfile.name;
  if (displayEmail) displayEmail.textContent = savedProfile.email;
  if (displayPhone) displayPhone.textContent = savedProfile.phone;
  if (displayRole) displayRole.textContent = savedProfile.role;
  if (topbarAdminName) topbarAdminName.textContent = savedProfile.name;
  if (topbarAdminRole) topbarAdminRole.textContent = savedProfile.role;
  if (displayStatus) displayStatus.textContent = normalizeStatusLabel(status);
  if (displayJoined) displayJoined.textContent = formatJoinedDate(joined);
};

const getAdminEmployee = async () => {
  const adminRows = await supabaseRequest(`/rest/v1/Employee?${ADMIN_ROLE_FILTER}&select=*&limit=1`, {
    method: 'GET',
  });

  if (!Array.isArray(adminRows) || !adminRows.length) {
    throw new Error('Admin employee record not found.');
  }

  return adminRows[0];
};

const persistAdminUpdate = async (payload) => {
  const filter = adminIdentifierEmail
    ? `Email=eq.${encodeURIComponent(adminIdentifierEmail)}`
    : ADMIN_ROLE_FILTER;

  const updatedRows = await supabaseRequest(`/rest/v1/Employee?${filter}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!updatedRows?.length) {
    throw new Error('Admin employee record was not updated.');
  }

  const updatedAdmin = updatedRows[0];
  adminIdentifierEmail = String(updatedAdmin.Email || payload.Email || adminIdentifierEmail).trim();
  return updatedAdmin;
};

const loadAdminProfile = async () => {
  try {
    const adminEmployee = await getAdminEmployee();
    adminIdentifierEmail = String(adminEmployee.Email || '').trim();
    applyProfileToUi({
      name: String(adminEmployee['Full Name'] || 'Admin User').trim(),
      email: String(adminEmployee.Email || '').trim(),
      phone: String(adminEmployee.phone || '').trim(),
      role: String(adminEmployee.Role || 'admin').trim(),
      status: adminEmployee.status,
      joined: adminEmployee.created_at || adminEmployee.joined_at || adminEmployee['Joined Date'],
    });
  } catch (error) {
    console.error(error);
    showToast('Unable to load admin profile from Supabase.');
  }
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
  applyProfileToUi({
    name: modalName?.value.trim() || savedProfile.name,
    email: modalEmail?.value.trim() || savedProfile.email,
    phone: modalPhone?.value.trim() || savedProfile.phone,
    role: savedProfile.role,
    status: displayStatus?.textContent,
    joined: displayJoined?.textContent.replace(/^Joined\s+/, ""),
  });
  showToast("Profile changes saved.");
  editProfileModal?.classList.remove("active");
  editProfileModal?.setAttribute("aria-hidden", "true");
});

const clearPasswordFields = () => {
  if (currentPassword) currentPassword.value = "";
  if (newPassword) newPassword.value = "";
  if (confirmPassword) confirmPassword.value = "";
};

saveProfileChanges?.addEventListener("click", async () => {
  const updatedName = profileName?.value.trim() || "";
  const updatedEmail = profileEmail?.value.trim() || "";
  const updatedPhone = profilePhone?.value.trim() || "";
  const updatedRole = profileRole?.value.trim() || "";

  if (!updatedName || !updatedEmail || !updatedPhone || !updatedRole) {
    showToast("Please complete all profile fields before saving.");
    return;
  }

  if (saveProfileChanges) {
    saveProfileChanges.disabled = true;
  }

  try {
    const updatedAdmin = await persistAdminUpdate({
      "Full Name": updatedName,
      Email: updatedEmail,
      phone: Number(updatedPhone.replace(/\D/g, "")) || updatedPhone,
      Role: updatedRole,
    });

    applyProfileToUi({
      name: String(updatedAdmin["Full Name"] || updatedName).trim(),
      email: String(updatedAdmin.Email || updatedEmail).trim(),
      phone: String(updatedAdmin.phone || updatedPhone).trim(),
      role: String(updatedAdmin.Role || updatedRole).trim(),
      status: updatedAdmin.status,
      joined: updatedAdmin.created_at || updatedAdmin.joined_at || updatedAdmin["Joined Date"],
    });

    showToast("Profile updated successfully.");
  } catch (error) {
    console.error(error);
    showToast("Failed to update admin profile.");
  } finally {
    if (saveProfileChanges) {
      saveProfileChanges.disabled = false;
    }
  }
});

updatePassword?.addEventListener("click", async () => {
  const currentPasswordValue = currentPassword?.value.trim() || "";
  const newPasswordValue = newPassword?.value.trim() || "";
  const confirmPasswordValue = confirmPassword?.value.trim() || "";

  if (!currentPasswordValue || !newPasswordValue || !confirmPasswordValue) {
    showToast("Please fill in all password fields.");
    return;
  }

  if (newPasswordValue !== confirmPasswordValue) {
    showToast("New password and confirm password do not match.");
    return;
  }

  if (updatePassword) {
    updatePassword.disabled = true;
  }

  try {
    const adminEmployee = await getAdminEmployee();
    const existingPassword = String(adminEmployee.Password || adminEmployee.password || '').trim();

    if (existingPassword !== currentPasswordValue) {
      showToast("Current password is incorrect.");
      return;
    }

    await persistAdminUpdate({
      password: newPasswordValue,
    });

    showToast("Password updated successfully.");
    clearPasswordFields();
  } catch (error) {
    console.error(error);
    showToast("Failed to update admin password.");
  } finally {
    if (updatePassword) {
      updatePassword.disabled = false;
    }
  }
});

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

loadAdminProfile();