/**
 * getCustomerLocation.js
 * Captures the customer's latitude/longitude on page load.
 * Uses the browser's built-in Geolocation API — no API key needed.
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
      } catch (err) { /* silent fail — don't break page */ }
    },
    () => { /* permission denied — silent */ },
    GEO_OPTIONS
  );
};

captureLocation();
