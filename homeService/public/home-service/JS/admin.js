if (typeof window.SUPABASE_URL === 'undefined') {
  window.SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
  window.SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';
}

const revenueChart = document.getElementById("revenueChart");
const bookingChart = document.getElementById("bookingChart");
const servicesCard = document.querySelector(".services-card");

const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const normalizeMonthLabel = (value) => {
  const rawMonth = String(value || "").trim();
  if (!rawMonth) return "";

  const shortMonthMap = {
    january: "Jan",
    jan: "Jan",
    february: "Feb",
    feb: "Feb",
    march: "Mar",
    mar: "Mar",
    april: "Apr",
    apr: "Apr",
    may: "May",
    june: "Jun",
    jun: "Jun",
    july: "Jul",
    jul: "Jul",
    august: "Aug",
    aug: "Aug",
    september: "Sep",
    sep: "Sep",
    sept: "Sep",
    october: "Oct",
    oct: "Oct",
    november: "Nov",
    nov: "Nov",
    december: "Dec",
    dec: "Dec",
  };

  return shortMonthMap[rawMonth.toLowerCase()] || rawMonth;
};

const parseTakaValue = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const sanitizedValue = String(value || "")
    .replace(/[^\d.-]/g, "")
    .trim();

  const parsedValue = Number(sanitizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const parseCountValue = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const sanitizedValue = String(value || "")
    .replace(/[^\d.-]/g, "")
    .trim();

  const parsedValue = Number(sanitizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getServicePerformanceName = (row) =>
  row?.service_name ||
  row?.service ||
  row?.["Service Name"] ||
  row?.["service_name"] ||
  "Unnamed Service";

const getServicePerformanceBookings = (row) =>
  parseCountValue(
    row?.bookings ??
      row?.booking_count ??
      row?.total_bookings ??
      row?.["Bookings"] ??
      row?.["Booking Count"] ??
      row?.["Total Bookings"]
  );

const getServicePerformanceRevenue = (row) =>
  parseTakaValue(
    row?.revenue ??
      row?.total_revenue ??
      row?.taka ??
      row?.amount ??
      row?.["Revenue"] ??
      row?.["Total Revenue"] ??
      row?.["Taka"]
  );

const formatCurrency = (value) => {
  const numericValue = parseTakaValue(value);
  return `$${numericValue.toLocaleString("en-US")}`;
};

const renderServicePerformanceState = (message) => {
  if (!servicesCard) {
    return;
  }

  const existingRows = servicesCard.querySelectorAll(".service-row");
  existingRows.forEach((row) => row.remove());

  let stateElement = servicesCard.querySelector(".services-empty-state");
  if (!stateElement) {
    stateElement = document.createElement("p");
    stateElement.className = "services-empty-state";
    servicesCard.appendChild(stateElement);
  }

  stateElement.textContent = message;
};

const renderTopPerformingServices = (rows) => {
  if (!servicesCard) {
    return;
  }

  const existingRows = servicesCard.querySelectorAll(".service-row");
  existingRows.forEach((row) => row.remove());
  servicesCard.querySelector(".services-empty-state")?.remove();

  if (!Array.isArray(rows) || !rows.length) {
    renderServicePerformanceState(
      "No service_performance rows are being returned from Supabase."
    );
    return;
  }

  const normalizedRows = rows
    .map((row) => ({
      name: getServicePerformanceName(row),
      bookings: getServicePerformanceBookings(row),
      revenue: getServicePerformanceRevenue(row),
    }))
    .filter((row) => row.name)
    .sort((firstRow, secondRow) => {
      if (secondRow.bookings !== firstRow.bookings) {
        return secondRow.bookings - firstRow.bookings;
      }

      return secondRow.revenue - firstRow.revenue;
    })
    .slice(0, 5);

  if (!normalizedRows.length) {
    renderServicePerformanceState(
      "The service_performance data could not be mapped to service names, bookings, and revenue."
    );
    return;
  }

  const maxBookings = Math.max(...normalizedRows.map((row) => row.bookings), 1);

  normalizedRows.forEach((row, index) => {
    const rowMarkup = document.createElement("div");
    rowMarkup.className = "service-row";
    rowMarkup.innerHTML = `
      <div class="service-info">
        <span class="badge">#${index + 1}</span>
        <div>
          <h5>${escapeHtml(row.name)}</h5>
          <p>${escapeHtml(row.bookings)} bookings <strong>${escapeHtml(
            formatCurrency(row.revenue)
          )}</strong></p>
        </div>
      </div>
      <div class="progress"><span style="width: ${Math.max(
        12,
        Math.round((row.bookings / maxBookings) * 100)
      )}%"></span></div>
    `;

    servicesCard.appendChild(rowMarkup);
  });
};

const loadTopPerformingServices = async () => {
  if (!servicesCard) {
    return;
  }

  try {
    const rows = await window.supabaseRequest(
      "/rest/v1/service_performance?select=*",
      {
        method: "GET",
      }
    );

    renderTopPerformingServices(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("Unable to load top performing services:", error);
    renderServicePerformanceState(
      "Unable to load Top Performing Services from Supabase."
    );
  }
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

const ADMIN_getMonthlyRevenueData = async () => {
  const rows = await window.supabaseRequest('/rest/v1/Monthly%20Revenue?select=Month,Taka', {
    method: 'GET',
  });

  if (!Array.isArray(rows) || !rows.length) {
    return null;
  }

  const sortedRows = [...rows].sort((firstRow, secondRow) => {
    const firstMonth = normalizeMonthLabel(firstRow?.Month);
    const secondMonth = normalizeMonthLabel(secondRow?.Month);
    return MONTH_ORDER.indexOf(firstMonth) - MONTH_ORDER.indexOf(secondMonth);
  });

  return {
    labels: sortedRows.map((row) => normalizeMonthLabel(row?.Month)),
    values: sortedRows.map((row) => parseTakaValue(row?.Taka)),
  };
};

const buildRevenueChart = async () => {
  if (!revenueChart) {
    return;
  }

  try {
    const revenueData = await ADMIN_getMonthlyRevenueData();

    if (!revenueData) {
      const chartCard = revenueChart.closest('.chart-card');
      if (chartCard && !chartCard.querySelector('.chart-empty-state')) {
        const emptyState = document.createElement('p');
        emptyState.className = 'chart-empty-state';
        emptyState.textContent = 'No Monthly Revenue rows are being returned from Supabase.';
        revenueChart.insertAdjacentElement('afterend', emptyState);
      }
      console.warn('Monthly Revenue query returned no rows. Check Supabase table data or RLS policies.');
      return;
    }

    const { labels, values } = revenueData;

    new Chart(revenueChart, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: "#0d9488",
            backgroundColor: "rgba(13, 148, 136, 0.15)",
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: "#0d9488",
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            grid: { color: "#eef2f7" },
          },
        },
      },
    });
  } catch (error) {
    console.error('Unable to load monthly revenue chart data:', error);
  }
};

const buildBookingChart = () => {
  if (!bookingChart) {
    return;
  }

  new Chart(bookingChart, {
    type: "bar",
    data: {
      labels: MONTH_ORDER,
      datasets: [
        {
          data: [90, 102, 118, 97, 126, 142, 136, 150, 138, 160, 148, 170],
          backgroundColor: "#3b82f6",
          borderRadius: 10,
          maxBarThickness: 26,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          grid: { color: "#eef2f7" },
        },
      },
    },
  });
};

buildRevenueChart();
buildBookingChart();
loadTopPerformingServices();

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
