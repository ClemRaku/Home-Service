const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const getStoredAuthUser = () => {
  try {
    const raw = localStorage.getItem('hsAuthUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── DOM refs ──
const profileName = document.getElementById('profileName');
const profilePoints = document.getElementById('profilePoints');
const profileWallet = document.getElementById('profileWallet');
const fieldFullName = document.getElementById('fieldFullName');
const fieldLocation = document.getElementById('fieldLocation');
const fieldPhone = document.getElementById('fieldPhone');
const fieldEmail = document.getElementById('fieldEmail');
const fieldAddress = document.getElementById('fieldAddress');
const profileAvatar = document.getElementById('profileAvatar');
const avatarInput = document.getElementById('avatarInput');
const cameraButton = document.querySelector('.camera-btn');
const editProfileBtn = document.getElementById('editProfileBtn');
const secondaryActionBtn = document.getElementById('secondaryActionBtn');
const profileActions = document.getElementById('profileActions');
const profileFields = Array.from(
  document.querySelectorAll('.form-grid input, .form-grid textarea')
);
const passwordModalOverlay = document.getElementById('passwordModalOverlay');
const passwordSaveBtn = document.getElementById('passwordSaveBtn');
const passwordCancelBtn = document.getElementById('passwordCancelBtn');
const currentPasswordInput = document.getElementById('currentPasswordInput');
const newPasswordInput = document.getElementById('newPasswordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const navLinks = document.querySelectorAll('.profile-nav a');

let isEditing = false;
let previousValues = [];

// ── Navigation active state ──
navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') {
      event.preventDefault();
      navLinks.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    }
  });
});

// ── Fetch customer data from Supabase ──
const loadProfile = async () => {
  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) {
    if (profileName) profileName.textContent = 'Not signed in';
    return;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/customers?select=*&email=eq.${encodeURIComponent(authUser.email)}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch profile (${response.status})`);
    }

    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      if (profileName) profileName.textContent = 'Profile not found';
      return;
    }

    const customer = rows[0];
    populateProfile(customer);
  } catch (error) {
    console.error('Error loading profile:', error);
    if (profileName) profileName.textContent = 'Failed to load profile';
  }
};

const formatCoins = (value) => Number(value || 0).toLocaleString();

const formatWallet = (value) => {
  const num = Number(value || 0);
  return `$${num.toFixed(2)}`;
};

const extractLocation = (address = '') => {
  // Use the last part of the address as location (e.g. "New York, NY")
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(-2).join(', ');
  }
  return parts[parts.length - 1] || 'N/A';
};

const populateProfile = (customer) => {
  const fullName = customer.full_name || 'Unnamed';
  const email = customer.email || '';
  const phone = customer.phone_number || 'Not provided';
  const address = customer.address || 'Not provided';
  const points = customer.points || 0;
  const wallet = customer.wallet_balance || 0;

  // Header info
  if (profileName) profileName.textContent = fullName;
  if (profileAvatar) profileAvatar.alt = fullName;
  if (profilePoints) profilePoints.textContent = `${formatCoins(points)} Coins`;
  if (profileWallet) profileWallet.textContent = formatWallet(wallet);

  // Form fields
  if (fieldFullName) fieldFullName.value = fullName;
  if (fieldLocation) fieldLocation.value = extractLocation(address);
  if (fieldPhone) fieldPhone.value = phone;
  if (fieldEmail) fieldEmail.value = email;
  if (fieldAddress) fieldAddress.value = address;
};

loadProfile();

// ── Avatar update ──
if (cameraButton && avatarInput) {
  cameraButton.addEventListener('click', () => {
    avatarInput.click();
  });
}

if (avatarInput && profileAvatar) {
  avatarInput.addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      profileAvatar.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Edit / Save / Cancel ──
const setReadonlyState = (readonly = true) => {
  profileFields.forEach((field) => {
    if (readonly) {
      field.setAttribute('readonly', 'readonly');
    } else {
      field.removeAttribute('readonly');
    }
  });
};

const setEditModeUI = (editing) => {
  if (!editProfileBtn || !secondaryActionBtn || !profileActions) return;

  if (editing) {
    profileActions.classList.add('editing');
    editProfileBtn.innerHTML = '<i class="fa-regular fa-floppy-disk"></i><span>Save Profile</span>';
    secondaryActionBtn.textContent = 'Cancel';
  } else {
    profileActions.classList.remove('editing');
    editProfileBtn.textContent = 'Edit Profile';
    secondaryActionBtn.textContent = 'Change Password';
  }
};

const startEditing = () => {
  previousValues = profileFields.map((field) => field.value);
  isEditing = true;
  setReadonlyState(false);
  setEditModeUI(true);
  profileFields[0]?.focus();
};

const saveProfile = async () => {
  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) return;

  const updatedFullName = fieldFullName?.value.trim();
  const updatedPhone = fieldPhone?.value.trim();
  const updatedAddress = fieldAddress?.value.trim();

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/customers?email=eq.${encodeURIComponent(authUser.email)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          full_name: updatedFullName,
          phone_number: updatedPhone,
          address: updatedAddress,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update profile (${response.status})`);
    }

    // Update localStorage name
    if (updatedFullName) {
      authUser.name = updatedFullName;
      localStorage.setItem('hsAuthUser', JSON.stringify(authUser));
    }

    isEditing = false;
    setReadonlyState(true);
    setEditModeUI(false);
    if (profileName && updatedFullName) profileName.textContent = updatedFullName;
  } catch (error) {
    console.error('Error saving profile:', error);
    window.alert('Failed to save profile. Please try again.');
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

if (editProfileBtn) {
  editProfileBtn.addEventListener('click', () => {
    if (!isEditing) {
      startEditing();
    } else {
      saveProfile();
    }
  });
}

// ── Password modal ──
const clearPasswordFields = () => {
  if (currentPasswordInput) currentPasswordInput.value = '';
  if (newPasswordInput) newPasswordInput.value = '';
  if (confirmPasswordInput) confirmPasswordInput.value = '';
};

const openPasswordModal = () => {
  if (!passwordModalOverlay) return;
  passwordModalOverlay.classList.add('active');
  passwordModalOverlay.setAttribute('aria-hidden', 'false');
  currentPasswordInput?.focus();
};

const closePasswordModal = () => {
  if (!passwordModalOverlay) return;
  passwordModalOverlay.classList.remove('active');
  passwordModalOverlay.setAttribute('aria-hidden', 'true');
  clearPasswordFields();
};

if (secondaryActionBtn) {
  secondaryActionBtn.addEventListener('click', () => {
    if (isEditing) {
      cancelEditing();
    } else {
      openPasswordModal();
    }
  });
}

passwordCancelBtn?.addEventListener('click', closePasswordModal);

passwordModalOverlay?.addEventListener('click', (event) => {
  if (event.target === passwordModalOverlay) closePasswordModal();
});

passwordSaveBtn?.addEventListener('click', async () => {
  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) return;

  const currentPassword = currentPasswordInput?.value.trim() || '';
  const newPassword = newPasswordInput?.value.trim() || '';
  const confirmPassword = confirmPasswordInput?.value.trim() || '';

  if (!currentPassword || !newPassword || !confirmPassword) {
    window.alert('Please fill in all password fields.');
    return;
  }

  if (newPassword !== confirmPassword) {
    window.alert('New password and confirm password do not match.');
    return;
  }

  // Verify current password first
  try {
    const verifyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/customers?select=password_hash&email=eq.${encodeURIComponent(authUser.email)}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!verifyResponse.ok) throw new Error('Verification failed');

    const rows = await verifyResponse.json();
    if (!rows.length || rows[0].password_hash !== currentPassword) {
      window.alert('Current password is incorrect.');
      return;
    }

    // Update password
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/customers?email=eq.${encodeURIComponent(authUser.email)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ password_hash: newPassword }),
      },
    );

    if (!updateResponse.ok) throw new Error('Password update failed');

    window.alert('Password updated successfully.');
    closePasswordModal();
  } catch (error) {
    console.error('Error updating password:', error);
    window.alert('Failed to update password. Please try again.');
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && passwordModalOverlay?.classList.contains('active')) {
    closePasswordModal();
  }
});
