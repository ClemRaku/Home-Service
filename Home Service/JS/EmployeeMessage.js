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
  const emojiBtn = document.getElementById("emojiBtn");
  const callBtn = document.getElementById("callBtn");
  const moreBtn = document.getElementById("moreBtn");
  const fileInput = document.getElementById("fileInput");
  const emojiPicker = document.getElementById("emojiPicker");
  const emojiGrid = document.getElementById("emojiGrid");
  const statusToggle = document.getElementById("statusToggle");
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");
  const logoutBtn = document.getElementById("logoutBtn");

  // Call popup elements
  const callPopup = document.getElementById("callPopup");
  const callPopupAvatarImg = document.getElementById("callPopupAvatarImg");
  const callPopupName = document.getElementById("callPopupName");
  const callPopupCategory = document.getElementById("callPopupCategory");
  const callPopupStatus = document.getElementById("callPopupStatus");
  const callPopupTimer = document.getElementById("callPopupTimer");
  const callPopupMute = document.getElementById("callPopupMute");
  const callPopupSpeaker = document.getElementById("callPopupSpeaker");
  const callPopupEnd = document.getElementById("callPopupEnd");

  const moreDropdown = document.getElementById("moreDropdown");
  const viewProfileBtn = document.getElementById("viewProfileBtn");
  const muteNotifBtn = document.getElementById("muteNotifBtn");
  const clearChatBtn = document.getElementById("clearChatBtn");
  const blockUserBtn = document.getElementById("blockUserBtn");
  const deleteChatBtn = document.getElementById("deleteChatBtn");

  const clearChatModalOverlay = document.getElementById("clearChatModalOverlay");
  const clearChatModalClose = document.getElementById("clearChatModalClose");
  const clearChatCancel = document.getElementById("clearChatCancel");
  const clearChatConfirm = document.getElementById("clearChatConfirm");

  const deleteChatModalOverlay = document.getElementById("deleteChatModalOverlay");
  const deleteChatModalClose = document.getElementById("deleteChatModalClose");
  const deleteChatCancel = document.getElementById("deleteChatCancel");
  const deleteChatConfirm = document.getElementById("deleteChatConfirm");

  const blockModalOverlay = document.getElementById("blockModalOverlay");
  const blockModalClose = document.getElementById("blockModalClose");
  const blockCancel = document.getElementById("blockCancel");
  const blockConfirm = document.getElementById("blockConfirm");
  const blockUserText = document.getElementById("blockUserText");

  const logoutModalOverlay = document.getElementById("logoutModalOverlay");
  const logoutModalClose = document.getElementById("logoutModalClose");
  const logoutCancel = document.getElementById("logoutCancel");
  const logoutConfirm = document.getElementById("logoutConfirm");

  // Emoji data
  const emojis = [
    "😀","😂","","😎","","👍","","🙏",
    "❤️","🔥","⭐","🎉","✅","❌","💡","📌",
    "😊","😄","🥳","😇","🤝","💪","","🙌",
    "😍","","😋","🤩","💯","","📎","📞",
  ];

  // Conversation data
  const conversations = {
    fatima: {
      name: "Fatima Begum",
      status: "Online · AC Repair & Servicing",
      online: true,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
      category: "AC Repair & Servicing",
      muted: false,
      blocked: false,
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
      muted: false,
      blocked: false,
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
      muted: false,
      blocked: false,
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
      muted: false,
      blocked: false,
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
      muted: false,
      blocked: false,
      messages: [
        { from: "them", text: "Welcome to HomeServe! Your profile has been verified successfully!", time: "Apr 7, 9:00 AM" },
        { from: "me", text: "Thank you! I'm excited to start working.", time: "Apr 7, 9:15 AM" },
        { from: "them", text: "You're all set! You'll start receiving job requests soon. Good luck!", time: "Apr 7, 9:20 AM" },
      ],
    },
  };

  let currentConversation = "fatima";
  let callInterval = null;
  let callSeconds = 0;
  let isMuted = false;
  let isSpeaker = true;

  // Build emoji picker
  emojis.forEach((emoji) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "emoji-item";
    btn.textContent = emoji;
    btn.addEventListener("click", () => {
      messageInput.value += emoji;
      messageInput.focus();
    });
    emojiGrid.appendChild(btn);
  });

  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }

  function renderChat(convKey) {
    const conv = conversations[convKey];
    if (!conv) return;

    currentConversation = convKey;

    // Update header
    chatName.textContent = conv.name;
    chatStatus.textContent = conv.status;

    // Update chat avatar
    const chatAvatarImg = document.querySelector(".chat-avatar img");
    const chatAvatarDot = document.querySelector(".chat-avatar .online-dot");
    if (conv.avatar) {
      chatAvatarImg.src = conv.avatar;
      chatAvatarImg.style.display = "";
      chatAvatarImg.parentElement.querySelector(".support-icon")?.remove();
    } else {
      chatAvatarImg.style.display = "none";
    }
    chatAvatarDot.style.display = conv.online ? "" : "none";

    // Update messages
    chatMessages.innerHTML = "";

    if (conv.messages.length === 0) {
      chatMessages.innerHTML = `
        <div class="no-conversation">
          <i data-lucide="message-circle"></i>
          <p>No messages yet. Say hello!</p>
        </div>
      `;
    } else {
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

        let contentHtml = "";
        if (msg.file) {
          if (msg.file.type && msg.file.type.startsWith("image/")) {
            contentHtml = `<img class="file-preview-img" src="${msg.file.url}" alt="${msg.file.name}" /><span class="msg-time">${msg.time}</span>`;
          } else {
            contentHtml = `
              <div class="file-attachment">
                <i data-lucide="file"></i>
                <div class="file-info">
                  <span class="file-name">${msg.file.name}</span>
                  <span class="file-size">${msg.file.size}</span>
                </div>
              </div>
              <span class="msg-time">${msg.time}</span>
            `;
          }
        } else {
          contentHtml = `<p>${msg.text}</p><span class="msg-time">${msg.time}</span>`;
        }

        msgDiv.innerHTML = `
          ${avatarHtml}
          <div class="msg-bubble">
            ${contentHtml}
          </div>
        `;

        chatMessages.appendChild(msgDiv);
      });
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
    lucide.createIcons();
  }

  function selectConversation(convKey) {
    const conv = conversations[convKey];
    if (!conv) return;

    // Update active state
    document.querySelectorAll(".conversation-item").forEach((item) => {
      item.classList.remove("active");
    });
    const activeItem = document.querySelector(`[data-conversation="${convKey}"]`);
    if (activeItem) {
      activeItem.classList.add("active");
      const badge = activeItem.querySelector(".unread-badge");
      if (badge) badge.remove();
    }

    renderChat(convKey);
    closeMoreDropdown();
  }

  function sendMessage(text, fileData) {
    const conv = conversations[currentConversation];
    if (!conv) return;

    const timeStr = getCurrentTime();

    const msg = {
      from: "me",
      text: text.trim(),
      time: timeStr,
    };

    if (fileData) {
      msg.file = fileData;
      if (!msg.text) msg.text = "";
    }

    if (!msg.text && !msg.file) return;

    conv.messages.push(msg);
    updateConversationPreview(currentConversation, msg.text || (msg.file ? `📎 ${msg.file.name}` : ""), timeStr);
    renderChat(currentConversation);
    messageInput.value = "";
    closeEmojiPicker();

    if (!conv.blocked) {
      setTimeout(() => simulateReply(), 1000 + Math.random() * 1500);
    }
  }

  function sendFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const fileData = {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        url: e.target.result,
      };
      sendMessage("", fileData);
      showToast(`Sent ${file.name}`, "success");
    };
    reader.readAsDataURL(file);
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
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
    "Sure, no problem!",
    "I'll take a look at that.",
  ];

  function simulateReply() {
    const conv = conversations[currentConversation];
    if (!conv) return;

    const timeStr = getCurrentTime();
    const reply = replies[Math.floor(Math.random() * replies.length)];

    conv.messages.push({ from: "them", text: reply, time: timeStr });
    updateConversationPreview(currentConversation, reply, timeStr);
    renderChat(currentConversation);

    if (!conv.muted) {
      showToast(`New message from ${conv.name}`, "info");
    }
  }

  function closeEmojiPicker() {
    emojiPicker.classList.add("hidden");
  }

  function closeMoreDropdown() {
    moreDropdown.classList.add("hidden");
  }

  function closeModal(overlay) {
    overlay.classList.add("hidden");
    endCall();
  }

  function startCall() {
    const conv = conversations[currentConversation];
    if (!conv) return;

    callPopupName.textContent = conv.name;
    callPopupCategory.textContent = conv.category || "";
    callPopupAvatarImg.src = conv.avatar || "";
    callPopupStatus.textContent = "Ringing...";
    callPopupTimer.textContent = "00:00";
    callPopup.classList.remove("hidden");
    isMuted = false;
    isSpeaker = true;
    callSeconds = 0;
    callPopupMute.classList.remove("active");
    callPopupSpeaker.classList.add("active");
    lucide.createIcons();

    setTimeout(() => {
      if (!callPopup.classList.contains("hidden")) {
        callPopupStatus.textContent = "Connected";
        callInterval = setInterval(() => {
          callSeconds++;
          const m = Math.floor(callSeconds / 60).toString().padStart(2, "0");
          const s = (callSeconds % 60).toString().padStart(2, "0");
          callPopupTimer.textContent = `${m}:${s}`;
        }, 1000);
      }
    }, 2000);
  }

  function endCall() {
    if (callInterval) {
      clearInterval(callInterval);
      callInterval = null;
    }
    callPopup.classList.add("hidden");
    if (callSeconds > 0) {
      showToast(`Call ended · ${callPopupTimer.textContent}`, "info");
    }
  }

  // Event Listeners

  // Conversation selection
  conversationItems.forEach((item) => {
    item.addEventListener("click", () => {
      const convKey = item.getAttribute("data-conversation");
      const conv = conversations[convKey];
      if (conv && conv.blocked) {
        showToast("This user is blocked. Unblock them to chat.", "warning");
        return;
      }
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

  // Emoji picker
  emojiBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    emojiPicker.classList.toggle("hidden");
    closeMoreDropdown();
  });

  // Attach file
  attachBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast("File size must be less than 10MB", "warning");
        fileInput.value = "";
        return;
      }
      sendFile(file);
      fileInput.value = "";
    }
  });

  // Call button
  callBtn.addEventListener("click", () => {
    const conv = conversations[currentConversation];
    if (conv && conv.blocked) {
      showToast("Cannot call a blocked user", "warning");
      return;
    }
    startCall();
  });

  // More options button
  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    moreDropdown.classList.toggle("hidden");
    closeEmojiPicker();
  });

  // View Profile
  viewProfileBtn.addEventListener("click", () => {
    const conv = conversations[currentConversation];
    showToast(`Opening ${conv.name}'s profile...`, "info");
    closeMoreDropdown();
  });

  // Mute Notifications
  muteNotifBtn.addEventListener("click", () => {
    const conv = conversations[currentConversation];
    conv.muted = !conv.muted;
    const item = document.querySelector(`[data-conversation="${currentConversation}"]`);
    if (conv.muted) {
      item.classList.add("muted");
      showToast(`Notifications muted for ${conv.name}`, "success");
      muteNotifBtn.querySelector("span").textContent = "Unmute Notifications";
    } else {
      item.classList.remove("muted");
      showToast(`Notifications unmuted for ${conv.name}`, "success");
      muteNotifBtn.querySelector("span").textContent = "Mute Notifications";
    }
    closeMoreDropdown();
  });

  // Clear Chat
  clearChatBtn.addEventListener("click", () => {
    clearChatModalOverlay.classList.remove("hidden");
    closeMoreDropdown();
  });

  clearChatConfirm.addEventListener("click", () => {
    const conv = conversations[currentConversation];
    conv.messages = [];
    updateConversationPreview(currentConversation, "Chat cleared", getCurrentTime());
    renderChat(currentConversation);
    clearChatModalOverlay.classList.add("hidden");
    showToast("Chat cleared", "success");
  });

  // Delete Chat
  deleteChatBtn.addEventListener("click", () => {
    deleteChatModalOverlay.classList.remove("hidden");
    closeMoreDropdown();
  });

  deleteChatConfirm.addEventListener("click", () => {
    deleteConversation(currentConversation);
    deleteChatModalOverlay.classList.add("hidden");
    showToast("Conversation deleted", "success");
  });

  // Block User
  blockUserBtn.addEventListener("click", () => {
    const conv = conversations[currentConversation];
    blockUserText.textContent = `Are you sure you want to block ${conv.name}? They won't be able to message you.`;
    blockModalOverlay.classList.remove("hidden");
    closeMoreDropdown();
  });

  blockConfirm.addEventListener("click", () => {
    const conv = conversations[currentConversation];
    conv.blocked = true;
    const item = document.querySelector(`[data-conversation="${currentConversation}"]`);
    item.classList.add("blocked");
    blockModalOverlay.classList.add("hidden");
    showToast(`${conv.name} has been blocked`, "warning");
  });

  // Close modals via close buttons
  function setupModalClose(overlay, closeBtn) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));
    }
  }
  setupModalClose(clearChatModalOverlay, clearChatModalClose);
  setupModalClose(deleteChatModalOverlay, deleteChatModalClose);
  setupModalClose(blockModalOverlay, blockModalClose);

  clearChatCancel.addEventListener("click", () => clearChatModalOverlay.classList.add("hidden"));
  deleteChatCancel.addEventListener("click", () => deleteChatModalOverlay.classList.add("hidden"));
  blockCancel.addEventListener("click", () => blockModalOverlay.classList.add("hidden"));

  // Mute/Speaker/End Call
  callPopupMute.addEventListener("click", () => {
    isMuted = !isMuted;
    callPopupMute.classList.toggle("active", isMuted);
    const icon = callPopupMute.querySelector("i");
    icon.setAttribute("data-lucide", isMuted ? "mic-off" : "mic");
    lucide.createIcons();
    showToast(isMuted ? "Microphone muted" : "Microphone unmuted", "info");
  });

  callPopupSpeaker.addEventListener("click", () => {
    isSpeaker = !isSpeaker;
    callPopupSpeaker.classList.toggle("active", isSpeaker);
    showToast(isSpeaker ? "Speaker on" : "Speaker off", "info");
  });

  callPopupEnd.addEventListener("click", endCall);

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
      logoutModalOverlay.classList.remove("hidden");
    });
  }

  setupModalClose(logoutModalOverlay, logoutModalClose);
  logoutCancel.addEventListener("click", () => logoutModalOverlay.classList.add("hidden"));
  logoutConfirm.addEventListener("click", () => {
    logoutModalOverlay.classList.add("hidden");
    showToast("Logging out...", "info");
    setTimeout(() => { window.location.href = "../Html/Login.html"; }, 1000);
  });

  // Close dropdowns/emoji on outside click
  document.addEventListener("click", (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn && !emojiBtn.contains(e.target)) {
      closeEmojiPicker();
    }
    if (!moreDropdown.contains(e.target) && e.target !== moreBtn && !moreBtn.contains(e.target)) {
      closeMoreDropdown();
    }
  });

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeEmojiPicker();
      closeMoreDropdown();
      endCall();
      clearChatModalOverlay.classList.add("hidden");
      deleteChatModalOverlay.classList.add("hidden");
      blockModalOverlay.classList.add("hidden");
      logoutModalOverlay.classList.add("hidden");
    }
  });

  // Helper: delete conversation
  function deleteConversation(convKey) {
    delete conversations[convKey];
    const item = document.querySelector(`[data-conversation="${convKey}"]`);
    if (item) {
      item.style.transition = "all 0.3s ease";
      item.style.opacity = "0";
      item.style.transform = "translateX(-20px)";
      setTimeout(() => item.remove(), 300);
    }

    // Select another conversation
    const remainingKeys = Object.keys(conversations);
    if (remainingKeys.length > 0) {
      selectConversation(remainingKeys[0]);
    } else {
      chatMessages.innerHTML = `
        <div class="no-conversation">
          <i data-lucide="message-circle"></i>
          <p>No conversations left</p>
        </div>
      `;
      chatName.textContent = "";
      chatStatus.textContent = "";
    }
    lucide.createIcons();
  }

  // Toast notification
  function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = "toast";
    const iconMap = { success: "check-circle", info: "info", warning: "alert-circle" };
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
