const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// Get logged-in employee from localStorage
const authUser = JSON.parse(localStorage.getItem('hsAuthUser'));

if (!authUser || authUser.role !== 'employee') {
  window.location.href = 'Login.html';
}

// Fetch bookings for this employee
async function fetchEmployeeBookings(email) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&employee_email=eq.${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch bookings');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}

// Update sidebar monthly earnings
async function updateSidebarMonthlyEarnings() {
  if (!authUser || !authUser.email) return;
  const bookings = await fetchEmployeeBookings(authUser.email);
  const sidebarMonthlyEarnings = document.getElementById('sidebarMonthlyEarnings');
  if (!sidebarMonthlyEarnings) return;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const thisMonthBookings = completedBookings.filter(b => {
    const d = new Date(b.completed_at || b.created_at || b.scheduled_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthEarnings = thisMonthBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  if (monthEarnings >= 1000) {
    sidebarMonthlyEarnings.textContent = `৳${(monthEarnings / 1000).toFixed(0)}k`;
  } else {
    sidebarMonthlyEarnings.textContent = `৳${monthEarnings}`;
  }
}

// Sync sidebar status from availability database column
async function syncSidebarStatus(email) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=availability&email=eq.${encodeURIComponent(email)}`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.length) return;
    const availability = data[0].availability || 'available';
    const isOnline = availability === 'available';
    const dot = document.getElementById('statusDot');
    const label = document.getElementById('statusLabel');
    const toggle = document.getElementById('statusToggle');
    if (dot) dot.style.background = isOnline ? '#4ade80' : '#ef4444';
    if (label) label.textContent = isOnline ? 'Online' : 'Offline';
    if (toggle) toggle.checked = isOnline;
  } catch (err) { console.warn('Could not sync sidebar status:', err); }
}

// Format currency
function formatCurrency(amount) {
  if (!amount) return '৳0';
  return `৳${amount.toLocaleString('en-IN')}`;
}

// Fetch employee data
async function fetchEmployeeData(email) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=*&email=eq.${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch employee');
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error fetching employee:', err);
    return null;
  }
}

// Fetch bookings for pending calculation
async function fetchEmployeeBookings(email) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&employee_email=eq.${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch bookings');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}

// Fetch services for category lookup
async function fetchServices() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/services?select=service_name,category`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch services');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching services:', err);
    return [];
  }
}

// Render category card dynamically
async function renderCategoryCard() {
  const bookings = await fetchEmployeeBookings(authUser.email);
  const services = await fetchServices();

  // Build service name -> category map
  const serviceCategoryMap = {};
  services.forEach(s => {
    serviceCategoryMap[s.service_name] = s.category || 'Other';
  });

  // Calculate earnings per category from completed bookings
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const categoryEarnings = {};
  completedBookings.forEach(b => {
    const categoryName = serviceCategoryMap[b.service_name] || 'Other';
    if (!categoryEarnings[categoryName]) {
      categoryEarnings[categoryName] = { total: 0, count: 0 };
    }
    categoryEarnings[categoryName].total += (b.price || 0);
    categoryEarnings[categoryName].count++;
  });

  // Sort by earnings descending
  const sortedCategories = Object.entries(categoryEarnings)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6); // Top 6

  // Color palette for categories
  const colors = ['#0d9488', '#f97316', '#eab308', '#22c55e', '#a855f7', '#ef4444'];

  const categoryList = document.querySelector('.category-list');
  if (!categoryList) return;

  categoryList.innerHTML = '';

  if (sortedCategories.length === 0) {
    categoryList.innerHTML = '<p style="text-align:center;color:#5a6675;padding:20px;">No category data yet.</p>';
    return;
  }

  sortedCategories.forEach(([category, data], index) => {
    const percentage = totalEarnings > 0 ? Math.round((data.total / totalEarnings) * 100) : 0;
    const color = colors[index % colors.length];

    const item = document.createElement('div');
    item.className = 'category-item clickable';
    item.dataset.category = category;

    item.innerHTML = `
      <div class="category-top">
        <p>${category}</p>
        <span>${percentage}%</span>
      </div>
      <div class="progress">
        <span style="--width: ${percentage}%; --color: ${color}"></span>
      </div>
      <small>${formatCurrency(data.total)}</small>
    `;

    categoryList.appendChild(item);
  });

  // Re-attach category click listeners
  attachCategoryClickListeners();
}

// Render transactions table dynamically
async function renderTransactionsTable(bookings, services) {
  const tbody = document.querySelector('.transaction-table tbody');
  const transactionCount = document.getElementById('transactionCount');
  if (!tbody) return;

  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#5a6675;padding:20px;">No transactions yet.</td></tr>';
    if (transactionCount) transactionCount.textContent = '0 transactions';
    return;
  }

  // Build service name -> category map
  const serviceCategoryMap = {};
  services.forEach(s => {
    serviceCategoryMap[s.service_name] = s.category || 'Other';
  });

  // Sort by date descending
  const sorted = [...bookings].sort((a, b) => {
    const dateA = new Date(a.completed_at || a.created_at || a.scheduled_date);
    const dateB = new Date(b.completed_at || b.created_at || b.scheduled_date);
    return dateB - dateA;
  });

  tbody.innerHTML = '';

  sorted.forEach(booking => {
    const isCompleted = booking.status === 'completed';
    const displayStatus = isCompleted ? 'Paid' : 'Pending';
    const category = serviceCategoryMap[booking.service_name] || 'Other';
    const dateVal = isCompleted
      ? (booking.completed_at || booking.created_at || booking.scheduled_date)
      : booking.scheduled_date;
    const dateObj = new Date(dateVal);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const statusClass = displayStatus.toLowerCase();

    const row = document.createElement('tr');
    row.className = 'clickable-row';
    row.dataset.category = category;
    row.dataset.date = dateStr;
    row.dataset.amount = `৳${booking.price || 0}`;
    row.dataset.status = displayStatus;
    row.dataset.client = booking.customer_name || 'Unknown';
    row.dataset.description = booking.additional_details || 'No notes.';

    row.innerHTML = `
      <td class="job-name">${booking.service_name || 'Service'}</td>
      <td>${booking.customer_name || 'Unknown'}</td>
      <td><span class="category-badge">${category}</span></td>
      <td>${dateStr}</td>
      <td class="amount">৳${booking.price || 0}</td>
      <td><span class="status-badge ${statusClass}">${displayStatus}</span></td>
    `;

    tbody.appendChild(row);
  });

  // Update count
  if (transactionCount) {
    transactionCount.textContent = `${sorted.length} transaction${sorted.length !== 1 ? 's' : ''}`;
  }

  // Re-attach row click listeners
  attachTransactionRowListeners();
}

// Attach transaction row click event listeners
function attachTransactionRowListeners() {
  const jobModalOverlay = document.getElementById('jobModalOverlay');
  const jobModalTitle = document.getElementById('jobModalTitle');
  const jobModalBody = document.getElementById('jobModalBody');
  const jobModalClose = document.getElementById('jobModalClose');

  document.querySelectorAll('.clickable-row').forEach((row) => {
    row.addEventListener('click', () => {
      const jobName = row.querySelector('.job-name').textContent;
      const client = row.dataset.client;
      const category = row.dataset.category;
      const date = row.dataset.date;
      const amount = row.dataset.amount;
      const status = row.dataset.status;
      const description = row.dataset.description;
      const statusClass = status.toLowerCase() === 'paid' ? 'paid' : 'pending';

      jobModalTitle.textContent = jobName;
      jobModalBody.innerHTML = `
        <div class="job-detail-grid">
          <div class="job-detail-item">
            <div class="detail-label">Client</div>
            <div class="detail-value">${client}</div>
          </div>
          <div class="job-detail-item">
            <div class="detail-label">Category</div>
            <div class="detail-value">${category}</div>
          </div>
          <div class="job-detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${date}</div>
          </div>
          <div class="job-detail-item">
            <div class="detail-label">Amount</div>
            <div class="detail-value" style="color: #0d9488">${amount}</div>
          </div>
        </div>
        <div style="margin-bottom: 16px;">
          <span class="status-badge ${statusClass}" style="font-size: 13px; padding: 6px 14px;">${status}</span>
        </div>
        <div class="job-description">
          <p>${description}</p>
        </div>
      `;

      jobModalOverlay.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
  });

  // Close job modal
  if (jobModalClose) {
    jobModalClose.addEventListener('click', () => {
      jobModalOverlay.classList.add('hidden');
    });
  }

  if (jobModalOverlay) {
    jobModalOverlay.addEventListener('click', (e) => {
      if (e.target === jobModalOverlay) {
        jobModalOverlay.classList.add('hidden');
      }
    });
  }
}
function renderMonthlyChart(bookings) {
  const chartLabels = document.querySelector('.chart-labels');
  const chartBars = document.querySelector('.chart-bars');
  if (!chartLabels || !chartBars) return;

  const completedBookings = bookings.filter(b => b.status === 'completed');
  if (completedBookings.length === 0) {
    chartBars.innerHTML = '<p style="text-align:center;color:#5a6675;padding:20px;font-size:13px;">No earnings data yet.</p>';
    chartLabels.innerHTML = '';
    return;
  }

  const now = new Date();
  const months = [];

  // Build last 6 months (including current)
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.getMonth(), year: d.getFullYear(), date: d });
  }

  // Calculate earnings per month
  const monthlyTotals = months.map(m => {
    const monthBookings = completedBookings.filter(b => {
      const d = new Date(b.completed_at || b.created_at || b.scheduled_date);
      return d.getMonth() === m.month && d.getFullYear() === m.year;
    });
    return {
      total: monthBookings.reduce((sum, b) => sum + (b.price || 0), 0),
      label: m.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    };
  });

  const maxEarnings = Math.max(...monthlyTotals.map(m => m.total), 1);

  // Render labels
  chartLabels.innerHTML = '';
  monthlyTotals.forEach(m => {
    const span = document.createElement('span');
    if (m.total >= 1000) {
      span.textContent = `৳${(m.total / 1000).toFixed(0)}k`;
    } else {
      span.textContent = `৳${m.total}`;
    }
    chartLabels.appendChild(span);
  });

  // Render bars
  chartBars.innerHTML = '';
  monthlyTotals.forEach(m => {
    const value = m.total / maxEarnings;
    const displayValue = m.total >= 1000 ? `৳${(m.total / 1000).toFixed(0)}k` : `৳${m.total}`;
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.setProperty('--value', value);
    bar.dataset.tooltip = displayValue;
    bar.dataset.month = m.label;
    bar.innerHTML = `<span>${m.label.split(' ')[0]}</span>`;

    chartBars.appendChild(bar);
  });

  // Re-attach tooltip listeners
  attachChartTooltipListeners();
}

// Attach chart tooltip event listeners
function attachChartTooltipListeners() {
  const chartTooltip = document.getElementById('chartTooltip');
  const tooltipMonth = document.getElementById('tooltipMonth');
  const tooltipValue = document.getElementById('tooltipValue');

  document.querySelectorAll('.chart-bars .bar').forEach((bar) => {
    bar.addEventListener('mouseenter', () => {
      if (!tooltipMonth || !tooltipValue || !chartTooltip) return;
      tooltipMonth.textContent = bar.dataset.month;
      tooltipValue.textContent = bar.dataset.tooltip;
      chartTooltip.classList.add('visible');
    });

    bar.addEventListener('mousemove', (e) => {
      if (!chartTooltip) return;
      chartTooltip.style.left = e.clientX - 50 + 'px';
      chartTooltip.style.top = e.clientY - 70 + 'px';
    });

    bar.addEventListener('mouseleave', () => {
      if (!chartTooltip) return;
      chartTooltip.classList.remove('visible');
    });
  });
}
function attachCategoryClickListeners() {
  document.querySelectorAll('.category-item.clickable').forEach((item) => {
    item.addEventListener('click', () => {
      const category = item.dataset.category;

      // Switch to transactions tab
      const tabs = document.querySelectorAll('.tab');
      const overviewTab = document.getElementById('overview-tab');
      const transactionsTab = document.getElementById('transactions-tab');

      tabs.forEach((t) => t.classList.remove('active'));
      tabs[1]?.classList.add('active');
      overviewTab?.classList.add('hidden');
      transactionsTab?.classList.remove('hidden');

      // Filter transactions by category
      const rows = document.querySelectorAll('.transaction-table tbody tr');
      let visibleCount = 0;
      rows.forEach((row) => {
        const rowCategory = row.dataset.category;
        if (rowCategory === category) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      // Update count
      const transactionCount = document.getElementById('transactionCount');
      if (transactionCount) {
        transactionCount.textContent = `${visibleCount} transaction${visibleCount !== 1 ? 's' : ''}`;
      }

      // Show filter indicator
      const filterIndicator = document.getElementById('filterIndicator');
      const filterText = document.getElementById('filterText');
      if (filterIndicator && filterText) {
        filterIndicator.classList.add('active');
        filterText.textContent = category;
      }

      showToast('info', 'Filter Applied', `Showing ${category} transactions only`);
    });
  });
}
async function updateStatGrid() {
  if (!authUser || !authUser.email) return;

  const bookings = await fetchEmployeeBookings(authUser.email);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Start of current week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const startOfLastMonth = new Date(lastMonthYear, lastMonth, 1);
  const endOfLastMonth = new Date(lastMonthYear, lastMonth + 1, 0, 23, 59, 59);

  // Filter completed jobs
  const completedBookings = bookings.filter(b => b.status === 'completed');

  // Total Earnings
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  // This Month Earnings
  const thisMonthBookings = completedBookings.filter(b => {
    const d = new Date(b.completed_at || b.created_at || b.scheduled_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthEarnings = thisMonthBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  // Last Month Earnings (for comparison)
  const lastMonthBookings = completedBookings.filter(b => {
    const d = new Date(b.completed_at || b.created_at || b.scheduled_date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });
  const lastMonthEarnings = lastMonthBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  // This Week Earnings
  const thisWeekBookings = completedBookings.filter(b => {
    const d = new Date(b.completed_at || b.created_at || b.scheduled_date);
    return d >= startOfWeek;
  });
  const weekEarnings = thisWeekBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  // Update DOM - Total Earnings
  const totalEarningsEl = document.getElementById('totalEarnings');
  const totalEarningsJobsEl = document.getElementById('totalEarningsJobs');
  if (totalEarningsEl) totalEarningsEl.textContent = formatCurrency(totalEarnings);
  if (totalEarningsJobsEl) totalEarningsJobsEl.textContent = `${completedBookings.length} jobs total`;

  // Update DOM - This Month
  const monthEarningsEl = document.getElementById('monthEarnings');
  const monthEarningsSubEl = document.getElementById('monthEarningsSub');
  if (monthEarningsEl) monthEarningsEl.textContent = formatCurrency(monthEarnings);
  if (monthEarningsSubEl) {
    monthEarningsSubEl.textContent = lastMonthEarnings > 0
      ? `vs ${formatCurrency(lastMonthEarnings)} last month`
      : `${thisMonthBookings.length} jobs completed`;
  }

  // Update DOM - This Week
  const weekEarningsEl = document.getElementById('weekEarnings');
  const weekEarningsSubEl = document.getElementById('weekEarningsSub');
  if (weekEarningsEl) weekEarningsEl.textContent = formatCurrency(weekEarnings);
  if (weekEarningsSubEl) weekEarningsSubEl.textContent = `${thisWeekBookings.length} jobs completed`;

  // Pending Payout
  const pendingBookings = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const pendingTotal = pendingBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const pendingCount = pendingBookings.length;

  const pendingPayoutEl = document.getElementById('pendingPayout');
  const pendingPayoutJobsEl = document.getElementById('pendingPayoutJobs');
  if (pendingPayoutEl) pendingPayoutEl.textContent = formatCurrency(pendingTotal);
  if (pendingPayoutJobsEl) pendingPayoutJobsEl.textContent = `${pendingCount} job${pendingCount !== 1 ? 's' : ''} pending`;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Sync sidebar status from database
  await syncSidebarStatus(authUser?.email);

  // Update sidebar monthly earnings
  await updateSidebarMonthlyEarnings();

  // Update stat-grid with dynamic data
  await updateStatGrid();
  
  // Render category card dynamically
  await renderCategoryCard();

  // Render monthly earnings chart and transactions table
  if (authUser && authUser.email) {
    const bookings = await fetchEmployeeBookings(authUser.email);
    const services = await fetchServices();
    
    renderMonthlyChart(bookings);
    renderTransactionsTable(bookings, services);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // ==================== Tab Switching ====================
  const tabs = document.querySelectorAll(".tab");
  const overviewTab = document.getElementById("overview-tab");
  const transactionsTab = document.getElementById("transactions-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      if (tab.textContent.trim() === "Overview") {
        overviewTab.classList.remove("hidden");
        transactionsTab.classList.add("hidden");
      } else {
        overviewTab.classList.add("hidden");
        transactionsTab.classList.remove("hidden");
      }
    });
  });

  // ==================== Export Report Dropdown ====================
  const exportBtn = document.getElementById("exportBtn");
  const exportDropdown = document.getElementById("exportDropdown");

  if (exportBtn && exportDropdown) {
    exportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exportDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!exportDropdown.contains(e.target) && e.target !== exportBtn) {
        exportDropdown.classList.add("hidden");
      }
    });

    exportDropdown.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const format = btn.dataset.format;
        exportDropdown.classList.add("hidden");
        handleExport(format);
      });
    });
  }

  function handleExport(format) {
    showToast(
      "success",
      "Export Started",
      `Your ${format.toUpperCase()} report is being generated...`
    );

    // Simulate export delay
    setTimeout(() => {
      showToast("success", "Export Complete", `${format.toUpperCase()} report downloaded successfully`);
    }, 2000);
  }

  // ==================== Status Toggle ====================
  const statusToggle = document.getElementById("statusToggle");
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");

  if (statusToggle) {
    statusToggle.addEventListener("change", () => {
      if (statusToggle.checked) {
        statusDot.style.background = "#4ade80";
        statusLabel.textContent = "Online";
        showToast("success", "Status Updated", "You are now online and available for jobs");
      } else {
        statusDot.style.background = "#ef4444";
        statusLabel.textContent = "Offline";
        showToast("info", "Status Updated", "You are now offline. You won't receive new job requests");
      }
    });
  }

  // ==================== Toast Notification System ====================
  function showToast(type, title, message) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";

    const iconMap = {
      success: "check-circle",
      info: "info",
      warning: "alert-triangle",
    };

    toast.innerHTML = `
      <span class="toast-icon ${type}">
        <i data-lucide="${iconMap[type]}"></i>
      </span>
      <div class="toast-content">
        <p>${title}</p>
        <span>${message}</span>
      </div>
    `;

    container.appendChild(toast);

    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          width: 14,
          height: 14,
        },
      });
    }

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.classList.add("toast-exit");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  // ==================== Stat Cards Detail Modals ====================
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");

  const statModalData = {
    "total-earnings": {
      title: "Total Earnings Breakdown",
      content: `
        <ul class="detail-list">
          <li><span class="label">Total Jobs</span><span class="value">342</span></li>
          <li><span class="label">Average Per Job</span><span class="value teal">৳1,450</span></li>
          <li><span class="label">Highest Single Job</span><span class="value teal">৳12,000</span></li>
          <li><span class="label">Lowest Single Job</span><span class="value">৳500</span></li>
          <li><span class="label">Member Since</span><span class="value">Jan 2022</span></li>
        </ul>
      `,
    },
    "month-earnings": {
      title: "This Month's Earnings",
      content: `
        <ul class="detail-list">
          <li><span class="label">Current Month</span><span class="value teal">৳32,400</span></li>
          <li><span class="label">Last Month</span><span class="value">৳28,750</span></li>
          <li><span class="label">Growth</span><span class="value green">+12.7%</span></li>
          <li><span class="label">Jobs This Month</span><span class="value">28</span></li>
          <li><span class="label">Pending</span><span class="value">৳6,200</span></li>
        </ul>
      `,
    },
    "week-earnings": {
      title: "This Week's Earnings",
      content: `
        <ul class="detail-list">
          <li><span class="label">Current Week</span><span class="value teal">৳8,900</span></li>
          <li><span class="label">Jobs Completed</span><span class="value">4</span></li>
          <li><span class="label">Average Per Job</span><span class="value teal">৳2,225</span></li>
          <li><span class="label">Last Week</span><span class="value">৳7,200</span></li>
          <li><span class="label">Growth</span><span class="value green">+23.6%</span></li>
        </ul>
      `,
    },
    "pending-payout": {
      title: "Pending Payout Details",
      content: `
        <ul class="detail-list">
          <li><span class="label">Total Pending</span><span class="value teal">৳6,200</span></li>
          <li><span class="label">Pending Jobs</span><span class="value">3</span></li>
          <li><span class="label">Oldest Pending</span><span class="value">Apr 10, 2024</span></li>
          <li><span class="label">Expected Payout</span><span class="value green">Apr 15, 2024</span></li>
        </ul>
      `,
    },
    "avg-per-job": {
      title: "Average Per Job Analysis",
      content: `
        <ul class="detail-list">
          <li><span class="label">Overall Average</span><span class="value teal">৳1,450</span></li>
          <li><span class="label">This Month Avg</span><span class="value teal">৳1,620</span></li>
          <li><span class="label">Highest Category Avg</span><span class="value">Smart Home - ৳3,200</span></li>
          <li><span class="label">Lowest Category Avg</span><span class="value">Generator - ৳900</span></li>
        </ul>
      `,
    },
    "best-month": {
      title: "Best Month Details",
      content: `
        <ul class="detail-list">
          <li><span class="label">Best Month</span><span class="value teal">March 2024</span></li>
          <li><span class="label">Earnings</span><span class="value teal">৳32,400</span></li>
          <li><span class="label">Jobs Completed</span><span class="value">31</span></li>
          <li><span class="label">Top Category</span><span class="value">AC Repair - ৳12,500</span></li>
        </ul>
      `,
    },
    "total-jobs": {
      title: "Total Jobs Statistics",
      content: `
        <ul class="detail-list">
          <li><span class="label">Total Jobs</span><span class="value teal">342</span></li>
          <li><span class="label">Completed</span><span class="value green">339</span></li>
          <li><span class="label">In Progress</span><span class="value">3</span></li>
          <li><span class="label">Cancelled</span><span class="value">0</span></li>
          <li><span class="label">Completion Rate</span><span class="value green">99.1%</span></li>
        </ul>
      `,
    },
  };

  document.querySelectorAll(".stat-card.clickable, .mini-card.clickable").forEach((card) => {
    card.addEventListener("click", () => {
      const modalKey = card.dataset.modal;
      const data = statModalData[modalKey];
      if (data) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        modalOverlay.classList.remove("hidden");
      }
    });

    // Keyboard accessibility
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Close stat modal
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modalOverlay.classList.add("hidden");
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.add("hidden");
      }
    });
  }

  // ==================== Category Click - Filter Transactions ====================
  const filterIndicator = document.getElementById("filterIndicator");
  const filterText = document.getElementById("filterText");
  const transactionCount = document.getElementById("transactionCount");
  const clearFilter = document.getElementById("clearFilter");

  // Clear filter
  if (clearFilter) {
    clearFilter.addEventListener("click", () => {
      const rows = document.querySelectorAll(".transaction-table tbody tr");
      rows.forEach((row) => {
        row.style.display = "";
      });

      if (transactionCount) {
        transactionCount.textContent = "8 transactions";
      }

      if (filterIndicator) {
        filterIndicator.classList.remove("active");
      }

      showToast("info", "Filter Cleared", "Showing all transactions");
    });
  }

  // ==================== Logout Confirmation ====================
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModalOverlay = document.getElementById("logoutModalOverlay");
  const logoutModalClose = document.getElementById("logoutModalClose");
  const logoutCancel = document.getElementById("logoutCancel");
  const logoutConfirm = document.getElementById("logoutConfirm");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutModalOverlay.classList.remove("hidden");
    });
  }

  function closeLogoutModal() {
    logoutModalOverlay.classList.add("hidden");
  }

  if (logoutModalClose) logoutModalClose.addEventListener("click", closeLogoutModal);
  if (logoutCancel) logoutCancel.addEventListener("click", closeLogoutModal);

  if (logoutModalOverlay) {
    logoutModalOverlay.addEventListener("click", (e) => {
      if (e.target === logoutModalOverlay) {
        closeLogoutModal();
      }
    });
  }

  if (logoutConfirm) {
    logoutConfirm.addEventListener("click", () => {
      showToast("info", "Logging Out", "Redirecting to login page...");
      setTimeout(() => {
        window.location.href = logoutBtn.href;
      }, 1000);
    });
  }

  // ==================== Keyboard Accessibility for Modals ====================
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modalOverlay?.classList.add("hidden");
      jobModalOverlay?.classList.add("hidden");
      logoutModalOverlay?.classList.add("hidden");
    }
  });
});
