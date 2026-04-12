/**
 * getCustomerLocation.js
 * Continuously tracks the customer's latitude/longitude on all customer pages.
 * Uses the browser's built-in Geolocation API — no API key needed.
 * Updates localStorage and Supabase database every 10 seconds.
 */

const GEO_OPTIONS = { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 };

const getAuthEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem('hsAuthUser'));
    return user?.role === 'customer' ? user.email : null;
  } catch { return null; }
};

const captureLocation = async () => {
  const email = getAuthEmail();
  if (!email) return;

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      localStorage.setItem('customer_latitude', String(lat));
      localStorage.setItem('customer_longitude', String(lng));
      localStorage.setItem('customer_location_time', String(Date.now()));

      try {
        await fetch(
          `${window.SUPABASE_URL}/rest/v1/customers?email=eq.${encodeURIComponent(email)}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              apikey: window.SUPABASE_ANON_KEY,
              Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              latitude: lat,
              longitude: lng,
              location_updated_at: new Date().toISOString(),
            }),
          }
        );
        console.log(`📍 Customer location captured: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } catch (err) { console.warn('Failed to persist customer location to database:', err); }
    },
    (error) => { console.warn('Customer location permission denied or error:', error.message || error); },
    GEO_OPTIONS
  );
};

// Run location tracking continuously every 10 seconds
const startCustomerLocationTracking = () => {
  // Initial capture
  captureLocation();

  // Update every 10 seconds
  const locationInterval = setInterval(() => {
    captureLocation();
  }, 10000); // 10000ms = 10 seconds

  // Store interval ID so it can be cleared if needed
  window.customerLocationInterval = locationInterval;

  console.log('🔄 Customer real-time location tracking started (every 10s)');

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(locationInterval);
  });
};

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startCustomerLocationTracking);
} else {
  startCustomerLocationTracking();
}
