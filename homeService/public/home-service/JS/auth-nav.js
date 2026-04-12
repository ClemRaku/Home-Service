/* Shared authentication navbar handler for customer-facing pages.
   Include this script AFTER lucide.createIcons() on each page. */

(function () {
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

  const navbar = document.querySelector('.navbar');
  const authLinks = document.querySelector('.auth-links');

  if (!navbar || !authLinks) return;

  const authUser = getStoredAuthUser();
  if (!authUser) return;

  // Inject styles
  if (!document.getElementById('hs-auth-nav-style')) {
    const style = document.createElement('style');
    style.id = 'hs-auth-nav-style';
    style.textContent = `
      .navbar.navbar-logged-in .auth-links { gap: 8px; align-items: center; }
      .navbar.navbar-logged-in:not(.scrolled) .nav-links a { color: #fff; }
      .navbar.navbar-logged-in:not(.scrolled) .nav-links a::after { background: #d2fff9; }
      .navbar.navbar-logged-in:not(.scrolled) .nav-links a:hover { color: #11c5bb; }
      .navbar.navbar-logged-in .auth-profile-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,.5);
        background: transparent;
        color: #fff;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: all .2s ease;
        padding: 0;
      }
      .navbar.navbar-logged-in .auth-profile-btn:hover {
        background: rgba(255,255,255,.18);
        border-color: #fff;
      }
      .navbar.navbar-logged-in.scrolled .auth-profile-btn {
        color: #1c1c1c;
        border-color: rgba(0,0,0,.2);
      }
      .navbar.navbar-logged-in.scrolled .auth-profile-btn:hover {
        background: rgba(0,0,0,.08);
        border-color: rgba(0,0,0,.4);
      }
      .navbar.navbar-logged-in .auth-profile-btn .lucide {
        width: 18px;
        height: 18px;
      }
      .navbar.navbar-logged-in .auth-logout-small {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,.3);
        background: transparent;
        color: #fff;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: all .2s ease;
        padding: 0;
      }
      .navbar.navbar-logged-in .auth-logout-small:hover {
        background: rgba(255,100,100,.18);
        border-color: rgba(255,100,100,.6);
        color: #ff6b6b;
      }
      .navbar.navbar-logged-in.scrolled .auth-logout-small {
        color: #1c1c1c;
        border-color: rgba(0,0,0,.2);
      }
      .navbar.navbar-logged-in.scrolled .auth-logout-small:hover {
        background: rgba(255,100,100,.1);
        border-color: rgba(255,100,100,.4);
      }
      .navbar.navbar-logged-in .auth-logout-small .lucide {
        width: 16px;
        height: 16px;
      }
    `;
    document.head.append(style);
  }

  navbar.classList.add('navbar-logged-in');

  const initial = (authUser.name || 'U').trim().charAt(0).toUpperCase();

  authLinks.innerHTML = `
    <button type="button" class="auth-profile-btn" title="Profile" aria-label="Profile">
      <i data-lucide="user"></i>
    </button>
    <button type="button" class="auth-logout-small" title="Logout" aria-label="Logout">
      <i data-lucide="log-out"></i>
    </button>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const profileBtn = authLinks.querySelector('.auth-profile-btn');
  const logoutBtn = authLinks.querySelector('.auth-logout-small');

  profileBtn?.addEventListener('click', () => {
    window.location.href = '../Html/CustomerProfile.html';
  });

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('hsAuthUser');
    window.location.reload();
  });
})();
