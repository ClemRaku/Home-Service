const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

// Get logged-in employee
let authUser = null;
try {
  const raw = localStorage.getItem('hsAuthUser');
  authUser = raw ? JSON.parse(raw) : null;
} catch (e) { /* ignore parse errors */ }

if (!authUser || authUser.role !== 'employee') {
  window.location.href = '../Html/Login.html';
}

// Fetch bookings for this employee
async function fetchEmployeeBookings(email) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&employee_email=eq.${encodeURIComponent(email)}`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) { return []; }
}

// Update sidebar monthly earnings
const updateSidebarMonthlyEarnings = async () => {
  if (!authUser || !authUser.email) return;
  const bookings = await fetchEmployeeBookings(authUser.email);
  const el = document.getElementById('sidebarMonthlyEarnings');
  if (!el) return;
  const now = new Date();
  const cm = now.getMonth(), cy = now.getFullYear();
  const completed = bookings.filter(b => b.status === 'completed');
  const thisMonth = completed.filter(b => { const d = new Date(b.completed_at || b.created_at || b.scheduled_date); return d.getMonth() === cm && d.getFullYear() === cy; });
  const total = thisMonth.reduce((s, b) => s + (b.price || 0), 0);
  el.textContent = total >= 1000 ? `৳${(total / 1000).toFixed(0)}k` : `৳${total}`;
};

// Sync sidebar status from availability database column
const syncSidebarStatus = async () => {
  if (!authUser || !authUser.email) return;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=availability&email=eq.${encodeURIComponent(authUser.email)}`,
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
};

// DOM Elements
const conversationList = document.getElementById('conversationList');
const conversationItems = document.getElementById('conversationItems');
const searchInput = document.getElementById('searchInput');
const chatName = document.getElementById('chatName');
const chatStatus = document.getElementById('chatStatus');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const attachBtn = document.getElementById('attachBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const emojiGrid = document.getElementById('emojiGrid');
const fileInput = document.getElementById('fileInput');

let conversations = [];
let customerNames = {};
let activeConversationId = null;

// Helpers
const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
};

const formatTime12 = (dateStr) => {
  const d = new Date(dateStr);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
};

const initials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const avatarColors = ['#16b8ad', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#10b981'];
const getColorForEmail = (email) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const getCurrentTime = () => {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
};

// Load customer names
const loadCustomerNames = async () => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/customers?select=email,full_name,phone_number`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (res.ok) {
      const customers = await res.json();
      customers.forEach((c) => { customerNames[c.email] = { name: c.full_name, phone: c.phone_number }; });
    }
  } catch (err) { console.warn('Could not load customer names:', err); }
};

// Load conversations for this employee
const loadConversations = async () => {
  if (!authUser || !authUser.email) {
    if (conversationItems) {
      conversationItems.innerHTML = '<p style="text-align:center;color:#5a6675;padding:20px;">Please sign in to view messages.</p>';
    }
    return;
  }

  try {
    await loadCustomerNames();

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/conversations?employee_email=eq.${encodeURIComponent(authUser.email)}&order=last_message_at.desc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`Failed (${res.status})`);
    conversations = await res.json();
    renderConversations(conversations);
  } catch (err) {
    console.error('Error loading conversations:', err);
    if (conversationItems) {
      conversationItems.innerHTML = '<p style="text-align:center;color:#5a6675;padding:20px;">Could not load conversations.</p>';
    }
  }
};

// Get category from booking_id
const getCategoryForConversation = async (bookingId) => {
  if (!bookingId) return '';
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}&select=service_name`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (res.ok) {
      const data = await res.json();
      return data.length > 0 ? data[0].service_name : '';
    }
  } catch (err) { /* ignore */ }
  return '';
};

const renderConversations = async (convs) => {
  if (!conversationItems) return;
  conversationItems.innerHTML = '';

  if (!convs.length) {
    conversationItems.innerHTML = '<p style="text-align:center;color:#5a6675;padding:20px;">No conversations found.</p>';
    return;
  }

  for (const conv of convs) {
    const cust = customerNames[conv.customer_email] || {};
    const custName = cust.name || conv.customer_email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const color = getColorForEmail(conv.customer_email);
    const isActive = conv.id === activeConversationId;

    // Get category from booking
    const category = await getCategoryForConversation(conv.booking_id);

    const card = document.createElement('div');
    card.className = `conversation-item${isActive ? ' active' : ''}`;
    card.dataset.conversationId = conv.id;
    card.innerHTML = `
      <div class="conv-avatar">
        <div style="width:44px;height:44px;border-radius:50%;background:${color};display:grid;place-items:center;color:#fff;font-size:14px;font-weight:600;">${initials(custName)}</div>
      </div>
      <div class="conv-content">
        <div class="conv-header">
          <h4>${custName}</h4>
          <span class="conv-time">${timeAgo(conv.last_message_at)}</span>
        </div>
        <p class="conv-preview">${conv.last_message || 'No messages yet'}</p>
        ${category ? `<span class="conv-category">${category}</span>` : ''}
      </div>
    `;

    card.addEventListener('click', () => switchConversation(conv.id));
    conversationItems.appendChild(card);
  }
};

// Load messages for a conversation
const loadMessages = async (convId) => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?conversation_id=eq.${convId}&order=created_at.asc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`Failed (${res.status})`);
    const msgs = await res.json();
    renderMessages(msgs);

    // Update header
    const conv = conversations.find((c) => c.id === convId);
    if (conv) {
      const cust = customerNames[conv.customer_email] || {};
      const custName = cust.name || conv.customer_email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const category = await getCategoryForConversation(conv.booking_id);

      if (chatName) chatName.textContent = custName;
      if (chatStatus) chatStatus.textContent = `Online${category ? ` · ${category}` : ''}`;
    }
  } catch (err) {
    console.error('Error loading messages:', err);
    if (chatMessages) chatMessages.innerHTML = '<p class="no-messages">Could not load messages.</p>';
  }
};

const renderMessages = (msgs) => {
  if (!chatMessages) return;

  if (!msgs.length) {
    chatMessages.innerHTML = '<p class="no-messages">No messages yet. Start the conversation!</p>';
    return;
  }

  chatMessages.innerHTML = msgs.map((msg) => {
    const isSent = msg.sender_type === 'employee';
    return `
      <div class="message ${isSent ? 'sent' : 'received'}">
        <div class="msg-bubble">
          <p>${msg.content}</p>
          <span class="msg-time">${formatTime12(msg.created_at)}</span>
        </div>
      </div>
    `;
  }).join('');

  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const switchConversation = (convId) => {
  activeConversationId = convId;

  document.querySelectorAll('.conversation-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.conversationId === convId);
  });

  loadMessages(convId);
};

// Search filter
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = conversations.filter((conv) => {
      const cust = customerNames[conv.customer_email] || {};
      const custName = (cust.name || '').toLowerCase();
      const lastMsg = (conv.last_message || '').toLowerCase();
      return custName.includes(query) || lastMsg.includes(query);
    });
    renderConversations(filtered);
  });
}

// Send message
const sendMessage = async () => {
  if (!messageInput) return;
  const content = messageInput.value.trim();
  if (!content || !activeConversationId) return;

  try {
    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          conversation_id: activeConversationId,
          sender_email: authUser.email,
          sender_type: 'employee',
          content,
        }),
      }
    );

    if (!insertRes.ok) throw new Error(`Failed to send (${insertRes.status})`);

    messageInput.value = '';
    messageInput.focus();

    // Update conversation last_message
    await fetch(
      `${SUPABASE_URL}/rest/v1/conversations?id=eq.${activeConversationId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          last_message: content,
          last_message_at: new Date().toISOString(),
        }),
      }
    );

    loadMessages(activeConversationId);
    loadConversations();
  } catch (err) {
    console.error('Error sending message:', err);
    window.alert('Failed to send message. Please try again.');
  }
};

if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (messageInput) {
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

// Emoji picker
const emojis = ['😀','😂','🥰','😎','👍','🙏','❤️','🔥','⭐','🎉','✅','💡','😊','😄','🤝','💪','😍','😋','💯','📎'];
if (emojiGrid && emojis.length) {
  emojis.forEach((emoji) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-item';
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      if (messageInput) {
        messageInput.value += emoji;
        messageInput.focus();
      }
    });
    emojiGrid.appendChild(btn);
  });
}

if (emojiBtn) {
  emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.classList.toggle('hidden');
  });
}

// File attach (UI only for now)
if (attachBtn && fileInput) {
  attachBtn.addEventListener('click', () => fileInput.click());
}

// Status toggle
const statusToggle = document.getElementById('statusToggle');
const statusDot = document.getElementById('statusDot');
const statusLabel = document.getElementById('statusLabel');
if (statusToggle) {
  statusToggle.addEventListener('change', () => {
    if (statusToggle.checked) {
      statusDot.style.background = '#4ade80';
      statusLabel.textContent = 'Online';
    } else {
      statusDot.style.background = '#ef4444';
      statusLabel.textContent = 'Offline';
    }
  });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '../Html/Login.html';
  });
}

// Keyboard: Escape to close modals/pickers
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    emojiPicker?.classList.add('hidden');
  }
});

document.addEventListener('click', (e) => {
  if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    emojiPicker.classList.add('hidden');
  }
});

// Toast notification
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div class="toast-icon ${type}"><i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i></div><div class="toast-content"><p>${message}</p></div>`;
  container.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();
  setTimeout(() => { toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  syncSidebarStatus();
  updateSidebarMonthlyEarnings();
  loadConversations();
});
