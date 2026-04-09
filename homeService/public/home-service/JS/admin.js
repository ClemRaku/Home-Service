if (typeof window.SUPABASE_URL === 'undefined') {
  window.SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
  window.SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';
}

const revenueChart = document.getElementById("revenueChart");
const bookingChart = document.getElementById("bookingChart");
const servicesCard = document.querySelector(".services-card");
const statCards = document.querySelectorAll(".stats-grid .stat-card");

const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const normalizeMonthLabel = (value) => {
  const rawMonth = String(value || "").trim();
  if (!rawMonth) return "";

   const numericMonth = Number(rawMonth);
   if (Number.isFinite(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
    return MONTH_ORDER[numericMonth - 1];
   }

  const parsedDate = new Date(rawMonth);
  if (!Number.isNaN(parsedDate.getTime())) {
    return MONTH_ORDER[parsedDate.getUTCMonth()];
  }

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

const getStatCardByTitle = (title) =>
  Array.from(statCards).find((card) => {
    const heading = card.querySelector("h5");
    return heading?.textContent?.trim().toLowerCase() === title.toLowerCase();
  }) || null;

const setStatCardValue = (title, value) => {
  const card = getStatCardByTitle(title);
  const valueElement = card?.querySelector("h3");
  if (valueElement) {
    valueElement.textContent = String(value);
  }
};

const isTruthyStatus = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return ["true", "1", "active", "yes"].includes(normalized);
};

const getEmployeeStatusValue = (row) =>
  row?.status ??
  row?.Status ??
  row?.active ??
  row?.Active ??
  row?.is_active ??
  row?.isActive ??
  false;

const loadActiveEmployeesCount = async () => {
  try {
    const employees = await window.supabaseRequest("/rest/v1/Employee?select=*", {
      method: "GET",
    });

    const activeEmployees = Array.isArray(employees)
      ? employees.filter((row) => isTruthyStatus(getEmployeeStatusValue(row)))
      : [];

    setStatCardValue("Active Employees", activeEmployees.length);
  } catch (error) {
    console.error("Unable to load active employees count:", error);
  }
};

const getCustomerStatusValue = (row) =>
  row?.status ??
  row?.Status ??
  row?.active ??
  row?.Active ??
  row?.is_active ??
  row?.isActive ??
  false;

const loadActiveCustomersCount = async () => {
  try {
    const activeCustomers = await window.supabaseRequest(
      "/rest/v1/Customer?select=status&status=eq.true",
      {
        method: "GET",
      }
    );

    if (Array.isArray(activeCustomers) && activeCustomers.length >= 0) {
      setStatCardValue("Active Customers", activeCustomers.length);
      return;
    }

    const customers = await window.supabaseRequest("/rest/v1/Customer?select=*", {
      method: "GET",
    });

    const filteredActiveCustomers = Array.isArray(customers)
      ? customers.filter((row) => isTruthyStatus(getCustomerStatusValue(row)))
      : [];

    setStatCardValue("Active Customers", filteredActiveCustomers.length);
  } catch (error) {
    console.error("Unable to load active customers count:", error);
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

const getMonthlyRevenueMonth = (row) =>
  row?.Month ??
  row?.month ??
  row?.label ??
  row?.name ??
  row?.date ??
  row?.Date ??
  row?.created_at ??
  row?.createdAt ??
  row?.month_number ??
  row?.monthIndex ??
  "";

const getMonthlyRevenueValue = (row) =>
  row?.Taka ?? row?.taka ?? row?.Revenue ?? row?.revenue ?? row?.amount ?? 0;

const getObjectValueByKeyCandidates = (row, candidates = []) => {
  if (!row || typeof row !== "object") {
    return undefined;
  }

  const rowEntries = Object.entries(row);
  const normalizedCandidates = candidates.map((candidate) =>
    String(candidate).toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  const matchedEntry = rowEntries.find(([key]) => {
    const normalizedKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
    return normalizedCandidates.includes(normalizedKey);
  });

  return matchedEntry?.[1];
};

const getFlexibleMonthlyRevenueMonth = (row) =>
  getMonthlyRevenueMonth(row) ||
  getObjectValueByKeyCandidates(row, [
    "month",
    "month_name",
    "month label",
    "monthlabel",
    "period",
    "date",
    "created_at",
    "month_number",
  ]) ||
  "";

const getFlexibleMonthlyRevenueValue = (row) =>
  getMonthlyRevenueValue(row) ??
  getObjectValueByKeyCandidates(row, [
    "taka",
    "revenue",
    "total_revenue",
    "monthly_revenue",
    "amount",
    "value",
    "income",
  ]) ??
  0;

const fetchMonthlyRevenueRows = async () => {
  const endpoints = [
    '/rest/v1/monthly_revenue?select=*',
    '/rest/v1/monthly%20revenue?select=*',
    '/rest/v1/Monthly_Revenue?select=*',
    '/rest/v1/Monthly%20Revenue?select=*',
    '/rest/v1/monthlyRevenue?select=*',
  ];

  for (const endpoint of endpoints) {
    try {
      const rows = await window.supabaseRequest(endpoint, {
        method: 'GET',
      });

      if (Array.isArray(rows) && rows.length) {
        return rows;
      }
    } catch (error) {
      console.warn(`Monthly revenue query failed for ${endpoint}:`, error);
    }
  }

  return [];
};

const ADMIN_getMonthlyRevenueData = async () => {
  const rows = await fetchMonthlyRevenueRows();

  if (!Array.isArray(rows) || !rows.length) {
    return null;
  }

  const normalizedRows = rows
    .map((row) => ({
      month: normalizeMonthLabel(getFlexibleMonthlyRevenueMonth(row)),
      value: parseTakaValue(getFlexibleMonthlyRevenueValue(row)),
    }))
    .filter((row) => row.month);

  if (!normalizedRows.length) {
    return null;
  }

  const monthlyTotals = normalizedRows.reduce((totals, row) => {
    totals[row.month] = (totals[row.month] || 0) + row.value;
    return totals;
  }, {});

  const sortedLabels = Object.keys(monthlyTotals).sort((firstMonth, secondMonth) => {
    const firstIndex = MONTH_ORDER.indexOf(firstMonth);
    const secondIndex = MONTH_ORDER.indexOf(secondMonth);

    if (firstIndex !== -1 && secondIndex !== -1) {
      return firstIndex - secondIndex;
    }

    if (firstIndex !== -1) {
      return -1;
    }

    if (secondIndex !== -1) {
      return 1;
    }

    return firstMonth.localeCompare(secondMonth);
  });

  return {
    labels: sortedLabels,
    values: sortedLabels.map((label) => monthlyTotals[label]),
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
loadActiveEmployeesCount();
loadActiveCustomersCount();

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
