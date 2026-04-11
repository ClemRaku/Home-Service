document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  // DOM Elements
  const conversationItems = document.querySelectorAll(".conversation-item");
  const conversationList = document.getElementById("conversationItems");
  const searchInput = document.getElementById("searchInput");
  const chatArea = document.getElementById("chatArea");
  const chatName = document.getElementById("chatName");
  const chatStatus = document.getElementById("chatStatus");
  const chatMessages = document.getElementById("chatMessages");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const attachBtn = document.getElementById("attachBtn");
  const callBtn = document.getElementById("callBtn");
  const moreBtn = document.getElementById("moreBtn");
  const statusToggle = document.getElementById("statusToggle");
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");
  const logoutBtn = document.getElementById("logoutBtn");

  // Conversation data
  const conversations = {
    fatima: {
      name: "Fatima Begum",
      status: "Online · AC Repair & Servicing",
      online: true,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
      category: "AC Repair & Servicing",
      messages: [
        { from: "them", text: "Hello, is the AC repair done?", time: "10:15 AM" },
        { from: "me", text: "Yes, I just finished the servicing. The AC is running perfectly now.", time: "10:20 AM" },
        { from: "them", text: "That was so fast! How much do I owe you?", time: "10:25 AM" },
        { from: "me", text: "The total is ৳1,200 as agreed. You can pay via bKash or cash.", time: "10:28 AM" },
        { from: "them", text: "Thank you so much! The AC is working perfectly now.", time: "10:32 AM" },
      ],
    },
    karim: {
      name: "Karim Ahmed",
      status: "Online · Fan Installation",
      online: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
      category: "Fan Installation",
      messages: [
        { from: "them", text: "Hi, I need 3 ceiling fans installed in my new apartment.", time: "9:30 AM" },
        { from: "me", text: "Sure! I can help with that. When would you like me to come?", time: "9:35 AM" },
        { from: "them", text: "Can you come at 2 PM today for the installation?", time: "9:45 AM" },
      ],
    },
    nasreen: {
      name: "Nasreen Akter",
      status: "Last seen yesterday · Circuit Breaker Replacement",
      online: false,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
      category: "Circuit Breaker Replacement",
      messages: [
        { from: "them", text: "The main circuit breaker keeps tripping. Can you fix it?", time: "Yesterday, 3:00 PM" },
        { from: "me", text: "Yes, I can replace it. Do you have the right circuit breaker?", time: "Yesterday, 3:15 PM" },
        { from: "them", text: "Please bring the right circuit breaker for a 3-phase system.", time: "Yesterday, 3:20 PM" },
        { from: "me", text: "No problem, I'll bring one. I'll come tomorrow morning.", time: "Yesterday, 3:30 PM" },
      ],
    },
    rafiq: {
      name: "Rafiq Islam",
      status: "Last seen Apr 8 · LED Lighting Installation",
      online: false,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
      category: "LED Lighting Installation",
      messages: [
        { from: "them", text: "I want to install LED lights throughout my house.", time: "Apr 8, 10:00 AM" },
        { from: "me", text: "Great! I can help with LED installation. Let me know when you're available.", time: "Apr 8, 10:30 AM" },
        { from: "them", text: "Great! See you on Friday then.", time: "Apr 8, 11:00 AM" },
      ],
    },
    support: {
      name: "HomeServe Support",
      status: "Online · Support",
      online: true,
      avatar: null,
      isSupport: true,
      category: "Support",
      messages: [
        { from: "them", text: "Welcome to HomeServe! Your profile has been verified successfully!", time: "Apr 7, 9:00 AM" },
        { from: "me", text: "Thank you! I'm excited to start working.", time: "Apr 7, 9:15 AM" },
        { from: "them", text: "You're all set! You'll start receiving job requests soon. Good luck!", time: "Apr 7, 9:20 AM" },
      ],
    },
  };

  let currentConversation = "fatima";

  function renderChat(convKey) {
    const conv = conversations[convKey];
    if (!conv) return;

    currentConversation = convKey;

    // Update header
    chatName.textContent = conv.name;
    chatStatus.textContent = conv.status;

    // Update messages
    chatMessages.innerHTML = "";

    conv.messages.forEach((msg) => {
      const msgDiv = document.createElement("div");
      msgDiv.className = `message ${msg.from === "me" ? "sent" : "received"}`;

      let avatarHtml = "";
      if (msg.from === "them") {
        if (conv.isSupport) {
          avatarHtml = `<div class="msg-avatar" style="width:32px;height:32px;border-radius:50%;background:#0d9488;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:4px;"><i data-lucide="headphones" style="width:16px;height:16px;color:#fff;"></i></div>`;
        } else {
          avatarHtml = `<img class="msg-avatar" src="${conv.avatar}" alt="${conv.name}" />`;
        }
      }

      msgDiv.innerHTML = `
        ${avatarHtml}
        <div class="msg-bubble">
          <p>${msg.text}</p>
          <span class="msg-time">${msg.time}</span>
        </div>
      `;

      chatMessages.appendChild(msgDiv);
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    lucide.createIcons();
  }

  function selectConversation(convKey) {
    // Update active state
    document.querySelectorAll(".conversation-item").forEach((item) => {
      item.classList.remove("active");
    });
    const activeItem = document.querySelector(`[data-conversation="${convKey}"]`);
    if (activeItem) {
      activeItem.classList.add("active");
      // Remove unread badge
      const badge = activeItem.querySelector(".unread-badge");
      if (badge) badge.remove();
    }

    renderChat(convKey);
  }

  function sendMessage(text) {
    if (!text.trim()) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const timeStr = `${displayHours}:${minutes} ${ampm}`;

    // Add to data
    conversations[currentConversation].messages.push({
      from: "me",
      text: text.trim(),
      time: timeStr,
    });

    // Update preview
    updateConversationPreview(currentConversation, text.trim(), timeStr);

    // Re-render chat
    renderChat(currentConversation);
    messageInput.value = "";

    // Simulate reply after 1-2 seconds
    setTimeout(() => simulateReply(), 1000 + Math.random() * 1000);
  }

  function updateConversationPreview(convKey, text, time) {
    const item = document.querySelector(`[data-conversation="${convKey}"]`);
    if (!item) return;

    item.querySelector(".conv-preview").textContent = text.length > 40 ? text.substring(0, 40) + "..." : text;
    item.querySelector(".conv-time").textContent = time;
  }

  const replies = [
    "That sounds great, thank you!",
    "Perfect, I'll be waiting.",
    "Okay, see you then!",
    "Thanks for the update!",
    "Got it, I appreciate your help.",
    "That works for me!",
    "Thank you so much!",
  ];

  function simulateReply() {
    const conv = conversations[currentConversation];
    if (!conv) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const timeStr = `${displayHours}:${minutes} ${ampm}`;

    const reply = replies[Math.floor(Math.random() * replies.length)];

    conv.messages.push({
      from: "them",
      text: reply,
      time: timeStr,
    });

    updateConversationPreview(currentConversation, reply, timeStr);
    renderChat(currentConversation);
  }

  // Event Listeners

  // Conversation selection
  conversationItems.forEach((item) => {
    item.addEventListener("click", () => {
      const convKey = item.getAttribute("data-conversation");
      selectConversation(convKey);
    });
  });

  // Search
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    conversationItems.forEach((item) => {
      const name = item.querySelector("h4").textContent.toLowerCase();
      const preview = item.querySelector(".conv-preview").textContent.toLowerCase();
      const category = item.querySelector(".conv-category").textContent.toLowerCase();
      const match = name.includes(query) || preview.includes(query) || category.includes(query);
      item.style.display = match ? "" : "none";
    });
  });

  // Send message
  sendBtn.addEventListener("click", () => {
    sendMessage(messageInput.value);
  });

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageInput.value);
    }
  });

  // Attach button
  attachBtn.addEventListener("click", () => {
    showToast("File attachment coming soon!", "info");
  });

  // Call button
  callBtn.addEventListener("click", () => {
    showToast(`Calling ${conversations[currentConversation].name}...`, "info");
  });

  // More options button
  moreBtn.addEventListener("click", () => {
    showToast("Options menu coming soon!", "info");
  });

  // Status toggle
  if (statusToggle) {
    statusToggle.addEventListener("change", () => {
      if (statusToggle.checked) {
        statusDot.style.background = "#4ade80";
        statusLabel.textContent = "Online";
        showToast("You are now Online", "success");
      } else {
        statusDot.style.background = "#ef4444";
        statusLabel.textContent = "Offline";
        showToast("You are now Offline", "warning");
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Logging out...", "info");
      setTimeout(() => {
        window.location.href = "../Html/Login.html";
      }, 1000);
    });
  }

  // Toast notification
  function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer") || createToastContainer();

    const toast = document.createElement("div");
    toast.className = "toast";

    const iconMap = {
      success: "check-circle",
      info: "info",
      warning: "alert-circle",
    };

    toast.innerHTML = `
      <div class="toast-icon ${type}">
        <i data-lucide="${iconMap[type] || "info"}"></i>
      </div>
      <div class="toast-content">
        <p>${message}</p>
      </div>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function createToastContainer() {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
    return container;
  }

  // Initialize
  selectConversation(currentConversation);
});
