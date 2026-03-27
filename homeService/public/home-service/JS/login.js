const closeButton = document.querySelector('.close-btn');
const loginForm = document.querySelector('#loginForm');
const loginMessage = document.querySelector('#loginMessage');
const passwordInput = document.querySelector('input[name="password"]');
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

function findUser(rows, email, password) {
  for (const row of rows) {
    const rowEmail = getText(row.Email || row.email).toLowerCase();
    const rowPassword = getText(row.Password || row.password);

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

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const email = getText(formData.get('email'));
    const password = getText(formData.get('password'));

    if (!email || !password) {
      setLoginMessage('Please enter both email and password.');
      return;
    }

    setLoginMessage('Checking your account...', false);

    try {
      const [employeeRows, signupRows] = await Promise.all([
        fetchTableRows('Employee'),
        fetchTableRows('Sign%20up'),
      ]);

      const matchedEmployee = findUser(employeeRows, email, password);

      if (matchedEmployee) {
        setLoginMessage('Login successful. Redirecting...', false);

        if (getText(matchedEmployee.Role || matchedEmployee.role).toLowerCase() === 'admin') {
          window.location.href = 'Admin.html';
          return;
        }

        window.location.href = 'Home.html';
        return;
      }

      const matchedSignupUser = findUser(signupRows, email, password);

      if (matchedSignupUser) {
        setLoginMessage('Login successful. Redirecting...', false);
        window.location.href = 'Home.html';
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