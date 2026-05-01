const revenueChart = document.getElementById("revenueChart");
const bookingChart = document.getElementById("bookingChart");

if (revenueChart && bookingChart) {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  new Chart(revenueChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: [3100, 3600, 4100, 3800, 4500, 5200, 4900, 5400, 5100, 5700, 5300, 5900],
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

  new Chart(bookingChart, {
    type: "bar",
    data: {
      labels,
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
}

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