if (typeof window.SUPABASE_URL === 'undefined') {
  window.SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
  window.SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';
}

const revenueChart = document.getElementById("revenueChart");
const bookingChart = document.getElementById("bookingChart");

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

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dashboard = document.querySelector(".dashboard");

if (menuToggle && sidebar && dashboard) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    dashboard.classList.toggle("collapsed");
  });
}

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}