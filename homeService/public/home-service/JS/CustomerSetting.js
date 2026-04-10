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

const toggleItems = document.querySelectorAll('.preference-item');
const privacyTrigger = document.querySelector('.privacy-trigger');
const passwordTrigger = document.querySelector('.password-trigger');
const twoFactorTrigger = document.querySelector('.twofactor-trigger');
const privacyModal = document.getElementById('privacyModal');
const passwordModal = document.getElementById('passwordModal');
const twoFactorModal = document.getElementById('twoFactorModal');
const allCloseButtons = document.querySelectorAll('[data-close-modal]');
const passwordSaveBtn = passwordModal?.querySelector('.privacy-modal__btn.primary');
const currentPasswordInput = passwordModal?.querySelectorAll('.modal-field input[type="password"]')[0];
const newPasswordInput = passwordModal?.querySelectorAll('.modal-field input[type="password"]')[1];
const confirmPasswordInput = passwordModal?.querySelectorAll('.modal-field input[type="password"]')[2];

// ── Preference toggles ──
const syncToggleState = (item) => {
  const toggle = item.querySelector("input[type='checkbox']");
  if (!toggle) return;
  item.classList.toggle('is-active', toggle.checked);
};

toggleItems.forEach((item) => {
  const toggle = item.querySelector("input[type='checkbox']");
  if (!toggle) return;
  syncToggleState(item);
  toggle.addEventListener('change', () => syncToggleState(item));
});

// ── Modal helpers ──
const openModal = (modal) => {
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
};

const bindTrigger = (trigger, modal) => {
  if (!trigger || !modal) return;
  trigger.addEventListener('click', () => openModal(modal));
  trigger.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(modal);
    }
  });
};

bindTrigger(privacyTrigger, privacyModal);
bindTrigger(passwordTrigger, passwordModal);
bindTrigger(twoFactorTrigger, twoFactorModal);

allCloseButtons.forEach((button) => {
  button.addEventListener('click', () => {
    closeModal(privacyModal);
    closeModal(passwordModal);
    closeModal(twoFactorModal);
  });
});

[privacyModal, passwordModal, twoFactorModal].forEach((modal) => {
  if (!modal) return;
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal(privacyModal);
    closeModal(passwordModal);
    closeModal(twoFactorModal);
  }
});

// ── Clear password fields when modal closes ──
const clearPasswordFields = () => {
  if (currentPasswordInput) currentPasswordInput.value = '';
  if (newPasswordInput) newPasswordInput.value = '';
  if (confirmPasswordInput) confirmPasswordInput.value = '';
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class' && passwordModal) {
      if (!passwordModal.classList.contains('is-open')) {
        clearPasswordFields();
      }
    }
  });
});
if (passwordModal) {
  observer.observe(passwordModal, { attributes: true });
}

// ── Password change (Supabase) ──
if (passwordSaveBtn) {
  passwordSaveBtn.addEventListener('click', async () => {
    const authUser = getStoredAuthUser();
    if (!authUser || !authUser.email) {
      window.alert('Please sign in to change your password.');
      return;
    }

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

    if (newPassword.length < 4) {
      window.alert('Password must be at least 4 characters long.');
      return;
    }

    try {
      // 1. Verify current password
      const verifyResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/customers?select=password_hash&email=eq.${encodeURIComponent(authUser.email)}`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!verifyResponse.ok) throw new Error('Failed to verify current password');

      const rows = await verifyResponse.json();
      if (!rows.length || rows[0].password_hash !== currentPassword) {
        window.alert('Current password is incorrect.');
        return;
      }

      // 2. Update password
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
        }
      );

      if (!updateResponse.ok) throw new Error('Failed to update password');

      window.alert('Password updated successfully.');
      closeModal(passwordModal);
    } catch (error) {
      console.error('Error updating password:', error);
      window.alert('Failed to update password. Please try again.');
    }
  });
}
