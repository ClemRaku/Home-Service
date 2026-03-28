const closeButton = document.querySelector('.close-btn');
const signupForm = document.querySelector('#signupForm');
const signupMessage = document.querySelector('#signupMessage');

const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

function showSignupMessage(message, color = '#d14343') {
  if (!signupMessage) return;
  signupMessage.textContent = message;
  signupMessage.style.color = color;
}

if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.location.href = 'Home.html';
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phoneRaw = String(formData.get('phone') || '').replace(/\D/g, '');
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');

    if (password !== confirmPassword) {
      showSignupMessage('Passwords do not match.');
      return;
    }

    const phone = Number(phoneRaw);
    if (!phoneRaw || Number.isNaN(phone)) {
      showSignupMessage('Please enter a valid phone number.');
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/Customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          'Full Name': fullName,
          Email: email,
          Phone: phone,
          Password: password,
        }),
      });

      if (!response.ok) {
        showSignupMessage('Could not create account. Please try again.');
        return;
      }

      signupForm.reset();
      showSignupMessage('Account created successfully.', '#0f9f98');
    } catch (error) {
      console.error('Signup error:', error);
      showSignupMessage('Something went wrong. Please verify Customer table access and try again.');
    }
  });
}