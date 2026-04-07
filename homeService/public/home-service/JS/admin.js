if (typeof window.SUPABASE_URL === 'undefined') {
  window.SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
  window.SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';
}

const revenueChart = document.getElementById("revenueChart");
const bookingChart = document.getElementById("bookingChart");

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Converts a month number (1-12) to its abbreviated label (Jan-Dec)
 */
const getMonthLabel = (monthNumber) => {
  if (typeof monthNumber !== 'number' || monthNumber < 1 || monthNumber > 12) {
    return 'Unknown';
  }
  return MONTH_LABELS[monthNumber - 1];
};

/**
 * Creates a sortable year-month key for ordering data chronologically
 */
const getYearMonthSortKey = (year, month) => {
  return `${year}-${String(month).padStart(2, '0')}`;
};

if (typeof window.supabaseRequest === 'undefined') {
  window.supabaseRequest = async (path, options = {}) => {
    const response = await fetch(`${window.SUPABASE_URL}${path}`, {
      ...options,
      headers: {
        apikey: window.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Supabase request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };
}

/**
 * Fetches monthly revenue data from the new monthly_revenue table.
 * Returns data for the last 12 months, ready for chart rendering.
 */
const ADMIN_getMonthlyRevenueData = async (limitMonths = 12) => {
  // Fetch all revenue data from the new table
  const rows = await window.supabaseRequest(
    `/rest/v1/monthly_revenue?select=year,month,revenue&order=year.desc,month.desc&limit=${limitMonths}`,
    { method: 'GET' }
  );

  if (!Array.isArray(rows) || !rows.length) {
    return null;
  }

  // Sort chronologically (oldest first for chart display)
  const sortedRows = [...rows].sort((a, b) => {
    const aKey = getYearMonthSortKey(a.year, a.month);
    const bKey = getYearMonthSortKey(b.year, b.month);
    return aKey.localeCompare(bKey);
  });

  return {
    // Labels: "Month Year" format (e.g., "Jan 2026")
    labels: sortedRows.map((row) => `${getMonthLabel(row.month)} ${row.year}`),
    values: sortedRows.map((row) => Number(row.revenue) || 0),
  };
};

let revenueChartInstance = null;
let isBuildingChart = false;

/**
 * Builds or updates the revenue chart with dynamic data from Supabase.
 * Can be called multiple times to refresh chart data.
 */
const buildRevenueChart = async () => {
  if (!revenueChart || isBuildingChart) {
    return;
  }

  isBuildingChart = true;

  try {
    const revenueData = await ADMIN_getMonthlyRevenueData(12);

    if (!revenueData) {
      const chartCard = revenueChart.closest('.chart-card');
      if (chartCard && !chartCard.querySelector('.chart-empty-state')) {
        const emptyState = document.createElement('p');
        emptyState.className = 'chart-empty-state';
        emptyState.textContent = 'No Monthly Revenue data available.';
        revenueChart.insertAdjacentElement('afterend', emptyState);
      }
      console.warn('Monthly Revenue query returned no rows.');
      isBuildingChart = false;
      return;
    }

    const { labels, values } = revenueData;

    const chartConfig = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue (Taka)",
            data: values,
            borderColor: "#0d9488",
            backgroundColor: "rgba(13, 148, 136, 0.15)",
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#0d9488",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y || 0;
                return `${value.toLocaleString()} Taka`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            grid: { color: "#eef2f7" },
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value.toLocaleString()}`,
            },
          },
        },
      },
    };

    // Update existing chart or create new one
    if (revenueChartInstance) {
      revenueChartInstance.data.labels = labels;
      revenueChartInstance.data.datasets[0].data = values;
      revenueChartInstance.update();
    } else {
      revenueChartInstance = new Chart(revenueChart, chartConfig);
    }
  } catch (error) {
    console.error('Unable to load monthly revenue chart data:', error);
  } finally {
    isBuildingChart = false;
  }
};

/**
 * Refreshes the revenue chart by fetching fresh data from Supabase.
 * Call this function after adding/updating revenue data.
 * Available globally as window.refreshRevenueChart()
 */
const refreshRevenueChart = async () => {
  await buildRevenueChart();
};

// Make refresh function available globally for external calls
if (typeof window !== 'undefined') {
  window.refreshRevenueChart = refreshRevenueChart;
}

let bookingChartInstance = null;
let isBuildingBookingChart = false;

/**
 * Fetches monthly booking data from the monthly_booking table.
 * Returns data for the last 12 months, ready for chart rendering.
 */
const ADMIN_getMonthlyBookingData = async (limitMonths = 12) => {
  const rows = await window.supabaseRequest(
    `/rest/v1/monthly_booking?select=year,month,bookings&order=year.desc,month.desc&limit=${limitMonths}`,
    { method: 'GET' }
  );

  if (!Array.isArray(rows) || !rows.length) {
    return null;
  }

  // Sort chronologically (oldest first for chart display)
  const sortedRows = [...rows].sort((a, b) => {
    const aKey = getYearMonthSortKey(a.year, a.month);
    const bKey = getYearMonthSortKey(b.year, b.month);
    return aKey.localeCompare(bKey);
  });

  return {
    labels: sortedRows.map((row) => `${getMonthLabel(row.month)} ${row.year}`),
    values: sortedRows.map((row) => Number(row.bookings) || 0),
  };
};

/**
 * Builds or updates the booking chart with dynamic data from Supabase.
 */
const buildBookingChart = async () => {
  if (!bookingChart || isBuildingBookingChart) {
    return;
  }

  isBuildingBookingChart = true;

  try {
    const bookingData = await ADMIN_getMonthlyBookingData(12);

    if (!bookingData) {
      const chartCard = bookingChart.closest('.chart-card');
      if (chartCard && !chartCard.querySelector('.chart-empty-state')) {
        const emptyState = document.createElement('p');
        emptyState.className = 'chart-empty-state';
        emptyState.textContent = 'No Monthly Booking data available. Run the SQL migration to populate the table.';
        bookingChart.insertAdjacentElement('afterend', emptyState);
      }
      console.warn('Monthly Booking query returned no rows. Please run the SQL migration in sql/monthly_booking.sql');
      isBuildingBookingChart = false;
      return;
    }

    const { labels, values } = bookingData;

    const chartConfig = {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Bookings",
            data: values,
            backgroundColor: "#3b82f6",
            borderRadius: 10,
            maxBarThickness: 26,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 750 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.parsed.y} bookings`,
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: "#eef2f7" },
            beginAtZero: true,
          },
        },
      },
    };

    // Update existing chart or create new one
    if (bookingChartInstance) {
      bookingChartInstance.data.labels = labels;
      bookingChartInstance.data.datasets[0].data = values;
      bookingChartInstance.update();
    } else {
      bookingChartInstance = new Chart(bookingChart, chartConfig);
    }
  } catch (error) {
    console.error('Unable to load monthly booking chart data:', error);
  } finally {
    isBuildingBookingChart = false;
  }
};

/**
 * Refreshes the booking chart by fetching fresh data from Supabase.
 */
const refreshBookingChart = async () => {
  await buildBookingChart();
};

// Make refresh function available globally
if (typeof window !== 'undefined') {
  window.refreshBookingChart = refreshBookingChart;
}

/**
 * Fetches top performing services from the service_performance table.
 */
const ADMIN_getTopServices = async (limit = 5) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JS months are 0-indexed
  const currentYear = now.getFullYear();

  const rows = await window.supabaseRequest(
    `/rest/v1/service_performance?select=service_name,bookings,revenue&month=eq.${currentMonth}&year=eq.${currentYear}&order=bookings.desc&limit=${limit}`,
    { method: 'GET' }
  );

  if (!Array.isArray(rows) || !rows.length) {
    return null;
  }

  // Find max bookings for progress bar calculation
  const maxBookings = Math.max(...rows.map((r) => Number(r.bookings) || 0));

  return rows.map((row, index) => ({
    rank: index + 1,
    name: row.service_name,
    bookings: Number(row.bookings) || 0,
    revenue: Number(row.revenue) || 0,
    progressPct: maxBookings > 0 ? Math.round(((Number(row.bookings) || 0) / maxBookings) * 100) : 0,
  }));
};

/**
 * Renders the top performing services section dynamically.
 */
const buildTopServices = async () => {
  const servicesCard = document.querySelector('.services-card');
  if (!servicesCard) return;

  try {
    const services = await ADMIN_getTopServices(5);

    if (!services || !services.length) {
      console.warn('No service performance data found. Run sql/service_performance.sql');
      return;
    }

    // Find the existing rows container (skip chart-head)
    const existingRows = servicesCard.querySelectorAll('.service-row');
    existingRows.forEach((row) => row.remove());

    // Build new rows
    const fragment = document.createDocumentFragment();

    services.forEach((svc) => {
      const row = document.createElement('div');
      row.className = 'service-row';

      const revenueFormatted = svc.revenue.toLocaleString();
      const bookingsFormatted = svc.bookings.toLocaleString();

      row.innerHTML = `
        <div class="service-info">
          <span class="badge">#${svc.rank}</span>
          <div>
            <h5>${svc.name}</h5>
            <p>${bookingsFormatted} bookings <strong>$${revenueFormatted}</strong></p>
          </div>
        </div>
        <div class="progress"><span style="width: ${svc.progressPct}%"></span></div>
      `;

      fragment.appendChild(row);
    });

    servicesCard.appendChild(fragment);
  } catch (error) {
    console.error('Unable to load top performing services:', error);
  }
};

/**
 * Refreshes the services section by fetching fresh data.
 */
const refreshTopServices = async () => {
  await buildTopServices();
};

if (typeof window !== 'undefined') {
  window.refreshTopServices = refreshTopServices;
}

buildRevenueChart();
buildBookingChart();
buildTopServices();

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    dashboard.classList.toggle("collapsed");
  });
}

// Load logged-in admin info into topbar
const loadAdminTopbarInfo = async () => {
  const storedEmail = sessionStorage.getItem('adminEmail');
  if (!storedEmail) return;

  try {
    const response = await fetch(`${window.SUPABASE_URL}/rest/v1/admin_profiles?select=full_name,role&email=eq.${encodeURIComponent(storedEmail)}&limit=1`, {
      method: 'GET',
      headers: {
        apikey: window.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) return;

    const data = await response.json();
    if (!Array.isArray(data) || !data.length) return;

    const admin = data[0];
    const topbarAdminName = document.querySelector('.topbar-right .admin-info h4');
    const topbarAdminRole = document.querySelector('.topbar-right .admin-info span');

    if (topbarAdminName) topbarAdminName.textContent = admin.full_name || 'Admin User';
    if (topbarAdminRole) topbarAdminRole.textContent = admin.role || 'Admin';
  } catch (error) {
    console.error('Failed to load admin topbar info:', error);
  }
};

loadAdminTopbarInfo();

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}
