/**
 * getLocation.js
 * Gets the user's current latitude and longitude using the browser's Geolocation API
 * and stores them in localStorage for use across the employee portal.
 *
 * No API key or external library needed — this uses the built-in navigator.geolocation.
 */

// Supabase config (use window globals from config.js - do NOT redeclare)
// Use window.SUPABASE_URL and window.SUPABASE_ANON_KEY directly throughout this file

// Geolocation options: high accuracy, fast response, cached for 5 min
const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
};

/**
 * Get current position and return { lat, lng }
 */
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      GEO_OPTIONS
    );
  });
};

/**
 * Fetch employee email from localStorage auth
 */
const getAuthEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem('hsAuthUser'));
    return user?.email || null;
  } catch {
    return null;
  }
};

/**
 * Persist lat/lng to Supabase employees table (optional, for admin tracking)
 */
const persistLocationToDB = async (email, lat, lng) => {
  if (!email) return;
  try {
    await fetch(
      `${window.SUPABASE_URL}/rest/v1/employees?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: window.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          last_latitude: lat,
          last_longitude: lng,
          last_location_at: new Date().toISOString(),
        }),
      }
    );
  } catch (err) {
    console.warn('Failed to persist location to database:', err);
  }
};

/**
 * Main: Get location, store in localStorage, optionally persist to DB
 */
const initLocation = async () => {
  const email = getAuthEmail();
  if (!email) return;

  try {
    const { lat, lng } = await getUserLocation();

    // Store in localStorage for quick access across all employee pages
    localStorage.setItem('employee_latitude', String(lat));
    localStorage.setItem('employee_longitude', String(lng));
    localStorage.setItem('employee_location_time', String(Date.now()));

    // Optionally persist to Supabase (requires DB columns)
    await persistLocationToDB(email, lat, lng);

    console.log(`📍 Location captured: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  } catch (err) {
    console.warn('Could not get user location:', err.message || err);
    // Don't break the page if location fails — just skip
  }
};

// Run location tracking continuously every 10 seconds
const startLocationTracking = () => {
  // Initial capture
  initLocation();

  // Update every 10 seconds
  const locationInterval = setInterval(() => {
    initLocation();
  }, 10000); // 10000ms = 10 seconds

  // Store interval ID so it can be cleared if needed
  window.employeeLocationInterval = locationInterval;

  console.log('🔄 Real-time location tracking started (every 10s)');

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(locationInterval);
  });
};

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startLocationTracking);
} else {
  startLocationTracking();
}
