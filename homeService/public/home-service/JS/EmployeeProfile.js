const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// Get logged-in employee from localStorage
const authUser = JSON.parse(localStorage.getItem('hsAuthUser'));

if (!authUser || authUser.role !== 'employee') {
  window.location.href = 'Login.html';
}

// Fetch employee data from Supabase
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

    if (!response.ok) {
      throw new Error('Failed to fetch employee data');
    }

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return null;
  }
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

// Update profile page with employee data
function updateProfile(employee, bookings = []) {
  // Update sidebar
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const sidebarRole = document.getElementById('sidebarRole');
  
  if (sidebarAvatar && employee.full_name) {
    sidebarAvatar.textContent = employee.full_name.charAt(0).toUpperCase();
  }
  if (sidebarRole && employee.role) {
    sidebarRole.textContent = employee.role;
  }

  // Update sidebar metrics
  const sidebarMonthlyEarnings = document.getElementById('sidebarMonthlyEarnings');
  if (sidebarMonthlyEarnings) {
    // Calculate this month's earnings from bookings
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

  // Update main profile card
  const profileImg = document.querySelector('.avatar-ring img');
  const profileName = document.querySelector('.profile-header h3');
  const roleTag = document.querySelector('.role-tag');
  const rating = document.querySelector('.rating strong');
  const reviewsCount = document.querySelector('.rating span');
  const jobsDone = document.querySelector('.stats-grid h4');

  if (profileName && employee.full_name) {
    profileName.textContent = employee.full_name;
  }
  if (roleTag && employee.role) {
    roleTag.textContent = employee.role;
  }
  if (rating && employee.performance_score) {
    rating.textContent = employee.performance_score;
  }
  if (reviewsCount && employee.reviews_count) {
    reviewsCount.textContent = `(${employee.reviews_count} reviews)`;
  }
  if (jobsDone && employee.jobs_completed) {
    jobsDone.textContent = employee.jobs_completed;
  }

  // Update status-row
  const statusRow = document.querySelector('.status-row .status');
  if (statusRow) {
    const statusLabel = employee.status ? 'Available' : 'Unavailable';
    const statusColor = employee.status ? '#4ade80' : '#f59e0b';
    statusRow.innerHTML = `<span class="dot" style="background: ${statusColor}"></span>${statusLabel}`;
  }

  // Update contact information
  const phoneSpan = document.querySelector('.contact-grid .icon-row span');
  const emailSpan = document.querySelectorAll('.contact-grid .icon-row span')[1];
  const addressSpan = document.querySelector('.address .icon-row span');

  if (phoneSpan && employee.phone_number) {
    phoneSpan.textContent = employee.phone_number;
  }
  if (emailSpan && employee.email) {
    emailSpan.textContent = employee.email;
  }
  if (addressSpan && employee.address) {
    addressSpan.textContent = employee.address;
  }

  // Update About Me section
  const aboutText = document.querySelector('.detail-text');
  const memberSince = document.querySelector('.meta-row .icon-row span');

  if (aboutText && employee.about_me) {
    aboutText.textContent = employee.about_me;
  }
  if (memberSince && employee.member_since) {
    const date = new Date(employee.member_since);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    memberSince.textContent = `Member since ${monthYear}`;
  }

  // Update Skills & Expertise
  const skillsContainer = document.querySelectorAll('.chip-row span');
  if (skillsContainer.length > 0 && employee.skills && Array.isArray(employee.skills)) {
    // Clear existing skills and add new ones
    const chipRow = document.querySelector('.chip-row');
    chipRow.innerHTML = '';
    employee.skills.forEach(skill => {
      const span = document.createElement('span');
      span.textContent = skill;
      chipRow.appendChild(span);
    });
  }

  // Update Certifications
  const certContainer = document.querySelector('.cert-list');
  if (certContainer && employee.certifications && Array.isArray(employee.certifications)) {
    certContainer.innerHTML = '';
    employee.certifications.forEach(cert => {
      const certItem = document.createElement('div');
      certItem.className = 'cert-item';
      certItem.innerHTML = `
        <div class="icon-wrap"><i data-lucide="award"></i></div>
        <span>${cert}</span>
        <i data-lucide="check-circle" class="success"></i>
      `;
      certContainer.appendChild(certItem);
    });
    // Reinitialize lucide icons for new certification items
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Fetch and display employee data
  let bookings = [];
  if (authUser && authUser.email) {
    const employee = await fetchEmployeeData(authUser.email);
    bookings = await fetchEmployeeBookings(authUser.email);
    await syncSidebarStatus(authUser.email);

    if (employee) {
      updateProfile(employee, bookings);
      console.log('Employee data loaded:', employee);
    } else {
      console.error('Employee not found in database');
    }
  }

  // Edit Profile Modal
  const editBtn = document.querySelector('.edit-btn');
  const editModal = document.getElementById('editModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const editForm = document.getElementById('editProfileForm');

  // Open modal and populate form
  if (editBtn) {
    editBtn.addEventListener('click', async () => {
      if (authUser && authUser.email) {
        const employee = await fetchEmployeeData(authUser.email);
        
        if (employee) {
          document.getElementById('editFullName').value = employee.full_name || '';
          document.getElementById('editEmail').value = employee.email || '';
          document.getElementById('editPhone').value = employee.phone_number || '';
          document.getElementById('editRole').value = employee.role || '';
          document.getElementById('editStatus').value = employee.status ? 'true' : 'false';
          document.getElementById('editAddress').value = employee.address || '';
          document.getElementById('editAboutMe').value = employee.about_me || '';
          document.getElementById('editSkills').value = Array.isArray(employee.skills) ? employee.skills.join(', ') : '';
          document.getElementById('editCertifications').value = Array.isArray(employee.certifications) ? employee.certifications.join(', ') : '';
          
          editModal.style.display = 'flex';
        }
      }
    });
  }

  // Close modal
  const closeModalFn = () => {
    editModal.style.display = 'none';
  };

  if (closeModal) closeModal.addEventListener('click', closeModalFn);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModalFn);

  // Close on outside click
  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeModalFn();
      }
    });
  }

  // Save changes
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        full_name: document.getElementById('editFullName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone_number: document.getElementById('editPhone').value.trim(),
        role: document.getElementById('editRole').value.trim(),
        status: document.getElementById('editStatus').value === 'true',
        address: document.getElementById('editAddress').value.trim(),
        about_me: document.getElementById('editAboutMe').value.trim(),
        skills: document.getElementById('editSkills').value.split(',').map(s => s.trim()).filter(s => s),
        certifications: document.getElementById('editCertifications').value.split(',').map(s => s.trim()).filter(s => s),
      };

      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/employees?email=eq.${encodeURIComponent(authUser.email)}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              Prefer: 'return=minimal',
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update profile: ${errorText}`);
        }

        alert('Profile updated successfully!');
        closeModalFn();
        
        // Refresh profile data
        const updatedEmployee = await fetchEmployeeData(authUser.email);
        const updatedBookings = await fetchEmployeeBookings(authUser.email);
        if (updatedEmployee) {
          updateProfile(updatedEmployee, updatedBookings);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  const toggle = document.querySelector(".toggle input");
  const sidebarStatusDot = document.querySelector(".status-card .dot");
  const sidebarStatusText = document.querySelector(".status-card span");

  if (!toggle || !sidebarStatusDot || !sidebarStatusText) {
    return;
  }

  const updateStatus = () => {
    if (toggle.checked) {
      sidebarStatusDot.style.background = "#48d889";
      sidebarStatusText.lastChild.textContent = "Online";
    } else {
      sidebarStatusDot.style.background = "#f6b028";
      sidebarStatusText.lastChild.textContent = "Offline";
    }
  };

  updateStatus();
  toggle.addEventListener("change", updateStatus);
});