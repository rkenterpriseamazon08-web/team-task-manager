// -----------------------------
// LOCAL REAL-TIME GROUP CHAT
// -----------------------------
// Uses localStorage for persistence and BroadcastChannel for same-browser-tab
// real-time updates. This avoids external Firebase import failures breaking the UI.

const GROUP_ROOMS = {
  general: {
    label: "General",
    seed: [
      { sender: "Rahul", text: "Please review the latest task updates." },
      { sender: "Sneha", text: "Pricing sheet has been updated." }
    ]
  },
  tasks: {
    label: "Tasks",
    seed: [
      { sender: "Rahul", text: "Please update your task status before EOD." },
      { sender: "Amit", text: "Development tasks are on track." }
    ]
  },
  announcements: {
    label: "Announcements",
    seed: [
      { sender: "Rahul", text: "Sprint review is scheduled for Friday at 3 PM." }
    ]
  }
};

const GROUP_STORAGE_KEY = "ttm_group_messages";
const GROUP_CHANNEL_NAME = "ttm_group_chat_channel";

const groupChatMessages = document.getElementById("group-chat-messages");
const groupChatInput = document.getElementById("group-chat-input");
const groupSendBtn = document.getElementById("group-send-btn");
const groupRoomButtons = document.querySelectorAll(".group-room-btn");
const activeGroupRoomLabel = document.getElementById("active-group-room-label");
const groupTypingIndicator = document.getElementById("group-typing-indicator");

let activeGroupRoom = "general";
let groupChannel = null;

function getInitial(name) {
  return (name || "U").trim().charAt(0).toUpperCase() || "U";
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCurrentUserName() {
  try {
    const savedUser = localStorage.getItem("ttm_logged_in_user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    return user?.name || "Demo User";
  } catch {
    return "Demo User";
  }
}

function saveGroupMessages(messages) {
  localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(messages));
}

function getSeedMessages() {
  const initialMessages = {};
  Object.entries(GROUP_ROOMS).forEach(([room, config]) => {
    initialMessages[room] = config.seed.map((message, index) => ({
      id: `${room}-${index + 1}`,
      sender: message.sender,
      text: message.text,
      timestamp: new Date(Date.now() - (config.seed.length - index) * 60000).toISOString()
    }));
  });
  return initialMessages;
}

function getGroupMessages() {
  try {
    const saved = localStorage.getItem(GROUP_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Fall through to defaults.
  }

  const initialMessages = getSeedMessages();
  saveGroupMessages(initialMessages);
  return initialMessages;
}

function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderTypingIndicator(name = "") {
  if (!groupTypingIndicator) return;

  if (!name) {
    groupTypingIndicator.classList.add("hidden");
    groupTypingIndicator.innerHTML = "";
    return;
  }

  groupTypingIndicator.classList.remove("hidden");
  groupTypingIndicator.innerHTML = `
    <div class="typing-indicator-inner">
      <span class="typing-dots"><span></span><span></span><span></span></span>
      <span class="typing-indicator-text">${escapeHTML(name)} is typing...</span>
    </div>
  `;
}

function renderGroupMessages() {
  if (!groupChatMessages) return;

  const messagesByRoom = getGroupMessages();
  const messages = messagesByRoom[activeGroupRoom] || [];
  const currentUserName = getCurrentUserName();

  groupChatMessages.innerHTML = "";

  if (messages.length === 0) {
    groupChatMessages.innerHTML = `
      <div class="message-bubble received">
        <strong>System:</strong> No messages yet in ${escapeHTML(GROUP_ROOMS[activeGroupRoom].label)}.
      </div>
    `;
    return;
  }

  messages.forEach((message) => {
    const isMine = message.sender === currentUserName || message.sender === "You";
    const row = document.createElement("div");
    row.className = `group-message-row ${isMine ? "mine" : "other"}`;

    row.innerHTML = `
      <div class="group-chat-avatar">${escapeHTML(getInitial(message.sender))}</div>
      <div class="group-chat-content">
        <div class="group-chat-meta">
          <span class="group-chat-sender">${isMine ? "You" : escapeHTML(message.sender)}</span>
          <span class="group-chat-time">${escapeHTML(formatMessageTime(message.timestamp))}</span>
        </div>
        <div class="message-bubble ${isMine ? "sent" : "received"}">
          ${escapeHTML(message.text)}
        </div>
      </div>
    `;

    groupChatMessages.appendChild(row);
  });

  groupChatMessages.scrollTop = groupChatMessages.scrollHeight;
}

function setActiveRoom(room) {
  if (!GROUP_ROOMS[room]) return;

  activeGroupRoom = room;

  groupRoomButtons.forEach((button) => {
    button.classList.toggle("active-room-btn", button.dataset.room === room);
  });

  if (activeGroupRoomLabel) {
    activeGroupRoomLabel.textContent = `Active room: ${GROUP_ROOMS[room].label}`;
  }

  if (groupChatInput) {
    groupChatInput.placeholder = `Type ${GROUP_ROOMS[room].label.toLowerCase()} message...`;
  }

  renderTypingIndicator("");
  renderGroupMessages();
}

function appendGroupMessage(room, message, shouldBroadcast = true) {
  const messagesByRoom = getGroupMessages();
  if (!messagesByRoom[room]) messagesByRoom[room] = [];

  if (messagesByRoom[room].some((item) => item.id === message.id)) return;

  messagesByRoom[room].push(message);
  saveGroupMessages(messagesByRoom);

  if (room === activeGroupRoom) renderGroupMessages();

  if (shouldBroadcast && groupChannel) {
    groupChannel.postMessage({ room, message });
  }
}

function sendGroupMessage() {
  if (!groupChatInput) return;

  const text = groupChatInput.value.trim();
  if (!text) return;

  const sender = getCurrentUserName();
  const room = activeGroupRoom;
  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sender,
    text,
    timestamp: new Date().toISOString()
  };

  appendGroupMessage(room, message);
  groupChatInput.value = "";
  renderTypingIndicator("");

  if (typeof window.addAppNotification === "function") {
    window.addAppNotification("Group chat", `Message sent in ${GROUP_ROOMS[room].label}.`);
  }
}

function setupGroupChannel() {
  if (!("BroadcastChannel" in window)) return;

  groupChannel = new BroadcastChannel(GROUP_CHANNEL_NAME);
  groupChannel.addEventListener("message", (event) => {
    const { room, message } = event.data || {};
    if (!room || !message) return;
    appendGroupMessage(room, message, false);
  });
}

groupRoomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveRoom(button.dataset.room);
  });
});

if (groupSendBtn) {
  groupSendBtn.addEventListener("click", sendGroupMessage);
}

if (groupChatInput) {
  groupChatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendGroupMessage();
    }
  });

  groupChatInput.addEventListener("input", () => {
    if (groupChatInput.value.trim()) {
      renderTypingIndicator(getCurrentUserName());
    } else {
      renderTypingIndicator("");
    }
  });

  groupChatInput.addEventListener("blur", () => renderTypingIndicator(""));
}

setupGroupChannel();
setActiveRoom(activeGroupRoom);
