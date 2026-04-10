const closeButton = document.querySelector('.close-btn');
const loginForm = document.querySelector('#loginForm') || document.querySelector('.login-form');
const loginMessage = document.querySelector('#loginMessage');
const emailInput = loginForm?.querySelector('input[type="email"]') || document.querySelector('input[name="email"]');
const passwordInput = loginForm?.querySelector('input[type="password"]') || document.querySelector('input[name="password"]');
const passwordToggleButton = document.querySelector('.icon-button');

const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const DEMO_USERS = [
  {
    role: 'customer',
    name: 'Customer',
    email: 'customer@homeservice.com',
    password: 'customer123',
  },
  {
    role: 'employee',
    name: 'Employee',
    email: 'employee@homeservice.com',
    password: 'employee123',
  },
];

function setLoginMessage(message, isError = true) {
  if (!loginMessage) return;
  loginMessage.textContent = message;
  loginMessage.style.color = isError ? '#d14343' : '#0f9f98';
}

function getText(value) {
  return String(value || '').trim();
}

async function fetchTableRows(tableName) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${tableName} (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function findAdmin(rows, email, password) {
  for (const row of rows) {
    const rowEmail = getText(row.email).toLowerCase();
    const rowPassword = getText(row.password_hash);

    if (rowEmail === email.toLowerCase() && rowPassword === password) {
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

// Show demo credentials hint if form doesn't have name attributes (static form)
const isStaticForm = !loginForm?.hasAttribute('id');
if (loginForm && emailInput && passwordInput && isStaticForm) {
  const feedback = document.createElement('p');
  feedback.style.margin = '10px 0 0';
  feedback.style.fontSize = '13px';
  feedback.style.fontWeight = '500';
  feedback.style.color = '#666';
  feedback.textContent = 'Demo login: customer@homeservice.com / customer123 or employee@homeservice.com / employee123';
  loginForm.append(feedback);
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let email, password;

    // Handle both static form (no name attributes) and Supabase form (with name attributes)
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

    // First check demo users
    const matchedDemoUser = DEMO_USERS.find(
      (user) => user.email.toLowerCase() === email && user.password === password
    );

    if (matchedDemoUser) {
      localStorage.setItem(
        'hsAuthUser',
        JSON.stringify({
          role: matchedDemoUser.role,
          name: matchedDemoUser.name,
          email: matchedDemoUser.email,
        })
      );

      if (loginMessage) {
        setLoginMessage(`Signed in as ${matchedDemoUser.role}. Redirecting to Home...`, false);
      } else {
        const feedback = loginForm.querySelector('p:last-child');
        if (feedback) {
          feedback.textContent = `Signed in as ${matchedDemoUser.role}. Redirecting to Home...`;
          feedback.style.color = '#0f9f98';
        }
      }

      window.location.href = 'Home.html';
      return;
    }

    // If not a demo user, check admin profiles in Supabase
    setLoginMessage('Checking your account...', false);

    try {
      const adminRows = await fetchTableRows('admin_profiles');
      const matchedAdmin = findAdmin(adminRows, email, password);

      if (matchedAdmin) {
        sessionStorage.setItem('adminEmail', matchedAdmin.email);
        setLoginMessage('Login successful. Redirecting...', false);
        window.location.href = 'Admin.html';
        return;
      }

      setLoginMessage('Invalid email or password.');
    } catch (error) {
      console.error('Login error:', error);
      setLoginMessage(
        'Could not sign in right now. Please verify Supabase table access and try again.',
      );
    }
  });
}