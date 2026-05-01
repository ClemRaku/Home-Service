const closeButton = document.querySelector('.close-btn');
const loginForm = document.querySelector('.login-form');
const roleSelect = document.getElementById('roleSelect');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const passwordToggleButton = loginForm?.querySelector('.icon-button');

// Social buttons
const googleLoginBtn = document.getElementById('googleLoginBtn');
const facebookLoginBtn = document.getElementById('facebookLoginBtn');

// Supabase configuration
const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Demo users fallback
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

document.addEventListener('DOMContentLoaded', async () => {
    // Check for OAuth session on return
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session && session.user) {
        console.log('OAuth session detected:', session.user);
        
        // Map Supabase user to our local auth format
        const userData = {
            id: session.user.id,
            role: 'customer', // Default for OAuth users
            name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
            email: session.user.email,
            avatar: session.user.user_metadata.avatar_url
        };
        
        localStorage.setItem('hsAuthUser', JSON.stringify(userData));
        window.location.href = 'Home.html';
    }
});

if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.location.href = 'Home.html';
  });
}

// Social Login Handlers
const handleSocialLogin = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    
    if (error) {
        console.error(`${provider} login error:`, error.message);
        alert(`Failed to sign in with ${provider}`);
    }
};

googleLoginBtn?.addEventListener('click', () => handleSocialLogin('google'));
facebookLoginBtn?.addEventListener('click', () => handleSocialLogin('facebook'));

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
  feedback.textContent = 'Enter your credentials to sign in';
  loginForm.append(feedback);

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const role = roleSelect.value;
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // Clear previous feedback
    feedback.style.color = '#666';
    feedback.textContent = 'Signing in...';

    try {
      // Try Supabase authentication first (checking employees table)
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, email, role, status')
        .eq('email', email)
        .eq('password_hash', password) // Note: using password_hash as per schema, but currently stored plain
        .single();

      if (error) {
        // If Supabase query fails, try demo users
        console.log('Supabase query failed, trying demo users...');
        const matchedUser = DEMO_USERS.find(
          (user) => user.email === email && user.password === password
        );

        if (!matchedUser) {
          feedback.textContent = 'Invalid email or password.';
          feedback.style.color = '#c0392b';
          return;
        }

        // Store demo user in localStorage
        localStorage.setItem(
          'hsAuthUser',
          JSON.stringify({
            role: matchedUser.role,
            name: matchedUser.name,
            email: matchedUser.email,
          })
        );

        feedback.textContent = `Signed in as ${matchedUser.role}. Redirecting...`;
        feedback.style.color = '#0f9f98';

        // Redirect based on role
        setTimeout(() => {
          if (matchedUser.role === 'employee') {
            window.location.href = 'EmployeeProfile.html';
          } else if (matchedUser.role === 'admin') {
            window.location.href = 'Admin.html';
          } else {
            window.location.href = 'Home.html';
          }
        }, 500);
        
        return;
      }

      // Successful Supabase authentication
      if (data) {
        // Check if user is active
        if (data.status === false || data.status === 'inactive') {
          feedback.textContent = 'Your account is inactive. Please contact support.';
          feedback.style.color = '#c0392b';
          return;
        }

        // Store user info in localStorage
        localStorage.setItem(
          'hsAuthUser',
          JSON.stringify({
            id: data.id,
            role: data.role || role,
            name: data.full_name,
            email: data.email,
          })
        );

        feedback.textContent = `Welcome back, ${data.full_name}! Redirecting...`;
        feedback.style.color = '#0f9f98';

        // Redirect based on role
        setTimeout(() => {
          if (data.role === 'employee' || role === 'employee') {
            window.location.href = 'EmployeeProfile.html';
          } else if (data.role === 'admin' || role === 'admin') {
            window.location.href = 'Admin.html';
          } else {
            window.location.href = 'Home.html';
          }
        }, 500);
      } else {
        feedback.textContent = 'Invalid email or password.';
        feedback.style.color = '#c0392b';
      }
    } catch (err) {
      console.error('Login error:', err);
      feedback.textContent = 'An error occurred during login. Please try again.';
      feedback.style.color = '#c0392b';
    }
  });
}
