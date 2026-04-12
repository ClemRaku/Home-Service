const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const getStoredAuthUser = () => {
  try {
    const raw = localStorage.getItem('hsAuthUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── DOM refs ──
const messageList = document.getElementById('messageList');
const searchInput = document.getElementById('searchInput');
const messageBody = document.getElementById('messageBody');
const detailName = document.getElementById('detailName');
const detailStatus = document.getElementById('detailStatus');
const detailAvatar = document.getElementById('detailAvatar');
const callTrigger = document.getElementById('callTrigger');
const videoTrigger = document.getElementById('videoTrigger');
const callOverlay = document.getElementById('callOverlay');
const videoOverlay = document.getElementById('videoOverlay');
const menuWrapper = document.querySelector('.menu-wrapper');
const menuTrigger = document.querySelector('.menu-trigger');
const menuPopup = document.querySelector('.menu-popup');

let conversations = [];
let employeeNames = {};
let activeConversationId = null;

// ── Helpers ──
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

const avatarColors = [
  '#16b8ad', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#10b981',
];
const getColorForEmail = (email) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

// ── Load employee names ──
const loadEmployeeNames = async () => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=email,full_name,role`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (res.ok) {
      const emps = await res.json();
      emps.forEach((e) => { employeeNames[e.email] = { name: e.full_name, role: e.role }; });
    }
  } catch (err) { console.warn('Could not load employee names:', err); }
};

// ── Load conversations ──
const loadConversations = async () => {
  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) {
    if (messageList) messageList.innerHTML = '<p class="conversations-status">Please sign in to view messages.</p>';
    return;
  }

  await loadEmployeeNames();

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/conversations?customer_email=eq.${encodeURIComponent(authUser.email)}&order=last_message_at.desc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`Failed (${res.status})`);
    conversations = await res.json();
    renderConversations(conversations);
  } catch (err) {
    console.error('Error loading conversations:', err);
    if (messageList) messageList.innerHTML = '<p class="conversations-status">Could not load messages.</p>';
  }
};

const renderConversations = (convs) => {
  if (!messageList) return;

  // Keep the search bar, remove the rest
  const searchBar = messageList.querySelector('.search-bar');
  messageList.innerHTML = '';
  if (searchBar) messageList.appendChild(searchBar);

  if (!convs.length) {
    messageList.innerHTML += '<p class="conversations-status">No conversations found.</p>';
    return;
  }

  convs.forEach((conv) => {
    const emp = employeeNames[conv.employee_email] || {};
    const empName = emp.name || conv.employee_email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const empRole = emp.role || '';
    const color = getColorForEmail(conv.employee_email);
    const isActive = conv.id === activeConversationId;

    // Count unread messages (messages sent by employee, not read)
    const unread = 0; // We'll compute this when loading messages

    const card = document.createElement('div');
    card.className = `chat-card${isActive ? ' active' : ''}`;
    card.dataset.conversationId = conv.id;
    card.innerHTML = `
      <div class="chat-avatar">
        <div class="avatar-placeholder" style="background:${color};width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:14px;font-weight:600;">${initials(empName)}</div>
        ${empRole.includes('Online') || true ? '<span class="status-dot"></span>' : ''}
      </div>
      <div class="chat-info">
        <div class="chat-name-row">
          <h4>${empName}</h4>
          <span>${timeAgo(conv.last_message_at)}</span>
        </div>
        <p>${conv.last_message || 'No messages yet'}</p>
        <small>${empRole || 'Worker'}</small>
      </div>
    `;

    card.addEventListener('click', () => switchConversation(conv.id));
    messageList.appendChild(card);
  });
};

// ── Load messages for a conversation ──
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
      const emp = employeeNames[conv.employee_email] || {};
      const empName = emp.name || conv.employee_email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (detailName) detailName.textContent = empName;
      if (detailStatus) detailStatus.textContent = 'Online';
      if (detailAvatar) {
        detailAvatar.src = '';
        detailAvatar.alt = empName;
        detailAvatar.style.display = 'none';
        // Show initials via the detail header
        let avatarWrap = detailAvatar.parentElement.querySelector('.avatar-initials');
        if (!avatarWrap) {
          avatarWrap = document.createElement('div');
          avatarWrap.className = 'avatar-initials';
          detailAvatar.parentElement.insertBefore(avatarWrap, detailAvatar);
        }
        avatarWrap.textContent = initials(empName);
        avatarWrap.style.cssText = `width:44px;height:44px;border-radius:50%;background:${getColorForEmail(conv.employee_email)};display:grid;place-items:center;color:#fff;font-size:14px;font-weight:600;`;
      }
    }
  } catch (err) {
    console.error('Error loading messages:', err);
    if (messageBody) messageBody.innerHTML = '<p class="no-messages">Could not load messages.</p>';
  }
};

const renderMessages = (msgs) => {
  if (!messageBody) return;

  if (!msgs.length) {
    messageBody.innerHTML = '<p class="no-messages">No messages yet. Start the conversation!</p>';
    return;
  }

  messageBody.innerHTML = msgs
    .map((msg) => {
      const isSent = msg.sender_type === 'customer';
      return `
        <div class="bubble ${isSent ? 'sent' : 'received'}">
          <p>${msg.content}</p>
          <span>${formatTime12(msg.created_at)}</span>
        </div>
      `;
    })
    .join('');

  messageBody.scrollTop = messageBody.scrollHeight;
};

const switchConversation = (convId) => {
  activeConversationId = convId;

  // Update active state
  document.querySelectorAll('.chat-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.conversationId === convId);
  });

  loadMessages(convId);
};

// ── Search filter ──
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = conversations.filter((conv) => {
      const emp = employeeNames[conv.employee_email] || {};
      const empName = (emp.name || '').toLowerCase();
      const lastMsg = (conv.last_message || '').toLowerCase();
      return empName.includes(query) || lastMsg.includes(query);
    });
    renderConversations(filtered);
  });
}

// ── Call / Video modals ──
const openOverlay = (overlay) => {
  if (!overlay) return;
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
};

const closeOverlay = (overlay) => {
  if (!overlay) return;
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
};

if (callTrigger) callTrigger.addEventListener('click', () => openOverlay(callOverlay));
if (videoTrigger) videoTrigger.addEventListener('click', () => openOverlay(videoOverlay));

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.close;
    if (target === 'call') closeOverlay(callOverlay);
    if (target === 'video') closeOverlay(videoOverlay);
  });
});

if (callOverlay) callOverlay.addEventListener('click', (e) => { if (e.target === callOverlay) closeOverlay(callOverlay); });
if (videoOverlay) videoOverlay.addEventListener('click', (e) => { if (e.target === videoOverlay) closeOverlay(videoOverlay); });

// ── Menu popup ──
if (menuWrapper && menuTrigger && menuPopup) {
  menuTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menuWrapper.classList.toggle('open');
    menuTrigger.setAttribute('aria-expanded', String(isOpen));
    menuPopup.setAttribute('aria-hidden', String(!isOpen));
  });
  document.addEventListener('click', () => {
    menuWrapper.classList.remove('open');
    menuTrigger.setAttribute('aria-expanded', 'false');
    menuPopup.setAttribute('aria-hidden', 'true');
  });
  menuPopup.addEventListener('click', (e) => e.stopPropagation());
}

// ── Send message ──
const sendBtn = document.querySelector('.send-btn');
const msgInput = document.querySelector('.message-textarea');

const autoResize = () => {
  if (!msgInput) return;
  msgInput.style.height = 'auto';
  msgInput.style.height = Math.min(msgInput.scrollHeight, 120) + 'px';
};

const sendMessage = async () => {
  if (!msgInput) return;
  const content = msgInput.value.trim();
  if (!content || !activeConversationId) return;

  const authUser = getStoredAuthUser();
  if (!authUser || !authUser.email) return;

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
          sender_type: 'customer',
          content,
        }),
      }
    );

    if (!insertRes.ok) throw new Error(`Failed to send (${insertRes.status})`);

    msgInput.value = '';
    msgInput.style.height = 'auto';
    msgInput.focus();

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
if (msgInput) {
  msgInput.addEventListener('input', autoResize);
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

// ── Init ──
loadConversations();
