const closeButton = document.querySelector('.close-btn');
const loginForm = document.querySelector('#loginForm') || document.querySelector('.login-form');
const loginMessage = document.querySelector('#loginMessage');
const emailInput = loginForm?.querySelector('input[type="email"]') || document.querySelector('input[name="email"]');
const passwordInput = loginForm?.querySelector('input[type="password"]') || document.querySelector('input[name="password"]');
const passwordToggleButton = document.querySelector('.icon-button');

const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

function setLoginMessage(message, isError = true) {
  if (!loginMessage) return;
  loginMessage.textContent = message;
  loginMessage.style.color = isError ? '#d14343' : '#0f9f98';
}

function getText(value) {
  return String(value || '').trim();
}

async function fetchCustomers(email) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/customers?select=full_name,email,password_hash,wallet_balance,points,address,phone_number&email=eq.${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch customers (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function fetchAdmins(email) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/admin_profiles?select=*&email=eq.${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch admin_profiles (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function findCustomer(rows, password) {
  for (const row of rows) {
    const rowPassword = getText(row.password_hash);
    if (rowPassword === password) {
      return row;
    }
  }
  return null;
}

function findAdmin(rows, password) {
  for (const row of rows) {
    const rowPassword = getText(row.password_hash);
    if (rowPassword === password) {
      return row;
    }
  }
  return null;
}

if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.location.href = 'Home.html';
  });
}

if (passwordToggleButton && passwordInput) {
  passwordToggleButton.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    passwordToggleButton.setAttribute(
      'aria-label',
      isHidden ? 'Hide password visibility' : 'Toggle password visibility',
    );
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let email, password;

    if (emailInput && passwordInput) {
      email = emailInput.value.trim().toLowerCase();
      password = passwordInput.value;
    } else {
      const formData = new FormData(loginForm);
      email = getText(formData.get('email'));
      password = getText(formData.get('password'));
    }

    if (!email || !password) {
      setLoginMessage('Please enter both email and password.');
      return;
    }

    setLoginMessage('Signing in...', false);

    try {
      // First check customers table
      const customerRows = await fetchCustomers(email);
      const matchedCustomer = findCustomer(customerRows, password);

      if (matchedCustomer) {
        localStorage.setItem(
          'hsAuthUser',
          JSON.stringify({
            role: 'customer',
            name: matchedCustomer.full_name,
            email: matchedCustomer.email,
          })
        );

        setLoginMessage('Login successful. Redirecting...', false);
        window.location.href = 'CustomerProfile.html';
        return;
      }

      // Then check admin_profiles table
      const adminRows = await fetchAdmins(email);
      const matchedAdmin = findAdmin(adminRows, password);

      if (matchedAdmin) {
        localStorage.setItem(
          'hsAuthUser',
          JSON.stringify({
            role: 'admin',
            name: matchedAdmin.full_name,
            email: matchedAdmin.email,
          })
        );

        setLoginMessage('Login successful. Redirecting...', false);
        window.location.href = 'Admin.html';
        return;
      }

      setLoginMessage('Invalid email or password.');
    } catch (error) {
      console.error('Login error:', error);
      setLoginMessage(
        'Could not sign in right now. Please try again.',
      );
    }
  });
}