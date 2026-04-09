const closeButton = document.querySelector('.close-btn');
const loginForm = document.querySelector('.login-form');
const emailInput = loginForm?.querySelector('input[type="email"]');
const passwordInput = loginForm?.querySelector('input[type="password"]');
const passwordToggleButton = loginForm?.querySelector('.icon-button');

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

if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.location.href = 'Home.html';
  });
}

if (passwordToggleButton && passwordInput) {
  passwordToggleButton.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggleButton.setAttribute('aria-label', isPassword ? 'Hide password' : 'Toggle password visibility');
  });
}

if (loginForm && emailInput && passwordInput) {
  const feedback = document.createElement('p');
  feedback.style.margin = '10px 0 0';
  feedback.style.fontSize = '13px';
  feedback.style.fontWeight = '500';
  feedback.style.color = '#666';
  feedback.textContent = 'Demo login: customer@homeservice.com / customer123 or employee@homeservice.com / employee123';
  loginForm.append(feedback);

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    const matchedUser = DEMO_USERS.find(
      (user) => user.email.toLowerCase() === email && user.password === password
    );

    if (!matchedUser) {
      feedback.textContent = 'Invalid email or password. Use one of the demo accounts shown above.';
      feedback.style.color = '#c0392b';
      return;
    }

    localStorage.setItem(
      'hsAuthUser',
      JSON.stringify({
        role: matchedUser.role,
        name: matchedUser.name,
        email: matchedUser.email,
      })
    );

    feedback.textContent = `Signed in as ${matchedUser.role}. Redirecting to Home...`;
    feedback.style.color = '#0f9f98';

    window.location.href = 'Home.html';
  });
}