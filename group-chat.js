import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// -----------------------------
// FIREBASE CONFIG
// -----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDZWGaDwj3K6ofuTyBMUIjEUg0jn37iSwI",
  authDomain: "team-task-manager-chat.firebaseapp.com",
  projectId: "team-task-manager-chat",
  storageBucket: "team-task-manager-chat.firebasestorage.app",
  messagingSenderId: "958317121497",
  appId: "1:958317121497:web:7abd2d7ae0207d344dd3c8",
  measurementId: "G-3CVLV0J9RP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -----------------------------
// GROUP CHAT ELEMENTS
// -----------------------------
const groupChatMessages = document.getElementById("group-chat-messages");
const groupChatInput = document.getElementById("group-chat-input");
const groupSendBtn = document.getElementById("group-send-btn");
const groupRoomButtons = document.querySelectorAll(".group-room-btn");
const activeGroupRoomLabel = document.getElementById("active-group-room-label");
const groupTypingIndicator = document.getElementById("group-typing-indicator");

// -----------------------------
// CONFIG
// -----------------------------
const GROUP_CHAT_COLLECTION = "groupMessages";
const GROUP_TYPING_COLLECTION = "groupTypingStatus";

let activeRoom = "general";
let unsubscribeGroupListener = null;
let unsubscribeTypingListener = null;
let typingTimeout = null;
let isCurrentlyTyping = false;

// -----------------------------
// HELPERS
// -----------------------------
function getCurrentUser() {
  try {
    const raw = localStorage.getItem("ttm_logged_in_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getCurrentUserName() {
  const user = getCurrentUser();
  return (
    user?.name ||
    document.getElementById("sidebar-user-name")?.textContent?.trim() ||
    localStorage.getItem("userName") ||
    "Demo User"
  );
}

function getCurrentUserEmail() {
  const user = getCurrentUser();
  return user?.email || "";
}

function safeNotify(title, message) {
  if (typeof window.addAppNotification === "function") {
    window.addAppNotification(title, message);
  }
}

function formatRoomName(room) {
  if (room === "general") return "General";
  if (room === "tasks") return "Tasks";
  if (room === "announcements") return "Announcements";
  return room;
}

function setActiveRoomUI(room) {
  groupRoomButtons.forEach((btn) => {
    btn.classList.toggle("active-room-btn", btn.dataset.room === room);
  });

  if (activeGroupRoomLabel) {
    activeGroupRoomLabel.textContent = `Active room: ${formatRoomName(room)}`;
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getInitial(name) {
  return (name || "U").trim().charAt(0).toUpperCase() || "U";
}

function formatMessageTime(timestamp) {
  try {
    if (!timestamp) return "";
    const date = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

function renderTypingIndicator(typingUsers) {
  if (!groupTypingIndicator) return;

  if (!typingUsers.length) {
    groupTypingIndicator.classList.add("hidden");
    groupTypingIndicator.innerHTML = "";
    return;
  }

  const names = typingUsers.map((name) => escapeHTML(name));

  let label = "";
  if (names.length === 1) {
    label = `${names[0]} is typing`;
  } else if (names.length === 2) {
    label = `${names[0]} and ${names[1]} are typing`;
  } else {
    label = `${names[0]} and ${names.length - 1} others are typing`;
  }

  groupTypingIndicator.classList.remove("hidden");
  groupTypingIndicator.innerHTML = `
    <div class="typing-indicator-inner">
      <span class="typing-dots">
        <span></span><span></span><span></span>
      </span>
      <span class="typing-indicator-text">${label}...</span>
    </div>
  `;
}

function renderGroupChatMessages(messages) {
  if (!groupChatMessages) return;

  const myEmail = getCurrentUserEmail();

  groupChatMessages.innerHTML = "";

  if (messages.length === 0) {
    groupChatMessages.innerHTML = `
      <div class="message-bubble received">
        <strong>System:</strong> No messages yet in ${formatRoomName(activeRoom)}.
      </div>
    `;
    return;
  }

  messages.forEach((msg) => {
    const isMine = msg.email === myEmail;
    const senderName = msg.sender || "Unknown";
    const senderLabel = isMine ? `You - ${senderName}` : senderName;
    const timeLabel = formatMessageTime(msg.timestamp);

    const row = document.createElement("div");
    row.className = `group-message-row ${isMine ? "mine" : "other"}`;

    row.innerHTML = `
      <div class="group-chat-avatar">${escapeHTML(getInitial(senderName))}</div>
      <div class="group-chat-content">
        <div class="group-chat-meta">
          <span class="group-chat-sender">${escapeHTML(senderLabel)}</span>
          ${timeLabel ? `<span class="group-chat-time">${escapeHTML(timeLabel)}</span>` : ""}
        </div>
        <div class="message-bubble ${isMine ? "sent" : "received"}">
          ${escapeHTML(msg.text)}
        </div>
      </div>
    `;

    groupChatMessages.appendChild(row);
  });

  groupChatMessages.scrollTop = groupChatMessages.scrollHeight;
}

// -----------------------------
// REAL-TIME MESSAGE LISTENER
// -----------------------------
function startGroupChatListener(room) {
  if (!groupChatMessages) return;

  if (unsubscribeGroupListener) {
    unsubscribeGroupListener();
  }

  const q = query(
    collection(db, GROUP_CHAT_COLLECTION),
    where("room", "==", room),
    orderBy("timestamp", "asc")
  );

  unsubscribeGroupListener = onSnapshot(
    q,
    (snapshot) => {
      const messages = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        messages.push({
          sender: data.sender || "Unknown",
          email: data.email || "",
          text: data.text || "",
          room: data.room || "general",
          timestamp: data.timestamp || null
        });
      });

      renderGroupChatMessages(messages);
    },
    (error) => {
      console.error("Group chat listener error:", error);

      groupChatMessages.innerHTML = `
        <div class="message-bubble received">
          <strong>System:</strong> ${error.message}
        </div>
      `;
    }
  );
}

// -----------------------------
// REAL-TIME TYPING LISTENER
// -----------------------------
function startTypingListener(room) {
  if (unsubscribeTypingListener) {
    unsubscribeTypingListener();
  }

  const myEmail = getCurrentUserEmail();

  const q = query(
    collection(db, GROUP_TYPING_COLLECTION),
    where("room", "==", room)
  );

  unsubscribeTypingListener = onSnapshot(
    q,
    (snapshot) => {
      const typingUsers = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data?.email && data.email !== myEmail && data.isTyping) {
          typingUsers.push(data.sender || "Someone");
        }
      });

      renderTypingIndicator(typingUsers);
    },
    (error) => {
      console.error("Typing listener error:", error);
    }
  );
}

// -----------------------------
// TYPING STATUS
// -----------------------------
async function setTypingStatus(isTyping) {
  const user = getCurrentUser();
  if (!user?.email) return;

  const typingDocId = `${activeRoom}_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const typingDocRef = doc(db, GROUP_TYPING_COLLECTION, typingDocId);

  try {
    if (isTyping) {
      await setDoc(typingDocRef, {
        room: activeRoom,
        sender: user.name || "User",
        email: user.email || "",
        isTyping: true,
        updatedAt: serverTimestamp()
      });
      isCurrentlyTyping = true;
    } else {
      await deleteDoc(typingDocRef);
      isCurrentlyTyping = false;
    }
  } catch (error) {
    console.error("Typing status update error:", error);
  }
}

async function stopTypingNow() {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }

  if (isCurrentlyTyping) {
    await setTypingStatus(false);
  }
}

function handleTypingInput() {
  const text = groupChatInput?.value?.trim() || "";

  if (!text) {
    stopTypingNow();
    return;
  }

  setTypingStatus(true);

  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  typingTimeout = setTimeout(() => {
    setTypingStatus(false);
  }, 1500);
}

// -----------------------------
// SEND MESSAGE
// -----------------------------
async function sendGroupMessage() {
  if (!groupChatInput) return;

  const text = groupChatInput.value.trim();
  if (!text) return;

  const user = getCurrentUser();

  if (!user) {
    alert("Please log in first.");
    return;
  }

  try {
    await addDoc(collection(db, GROUP_CHAT_COLLECTION), {
      room: activeRoom,
      sender: user.name || "User",
      email: user.email || "",
      text: text,
      timestamp: serverTimestamp()
    });

    groupChatInput.value = "";
    await stopTypingNow();
    safeNotify("Group chat", `Message sent in ${formatRoomName(activeRoom)}.`);
  } catch (error) {
    console.error("Error sending group message:", error);
    alert("Unable to send group message.");
  }
}

// -----------------------------
// ROOM SWITCHING
// -----------------------------
groupRoomButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const selectedRoom = btn.dataset.room;
    await stopTypingNow();
    activeRoom = selectedRoom;
    setActiveRoomUI(activeRoom);
    startGroupChatListener(activeRoom);
    startTypingListener(activeRoom);
  });
});

// -----------------------------
// EVENTS
// -----------------------------
if (groupSendBtn) {
  groupSendBtn.addEventListener("click", sendGroupMessage);
}

if (groupChatInput) {
  groupChatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendGroupMessage();
    }
  });

  groupChatInput.addEventListener("input", handleTypingInput);

  groupChatInput.addEventListener("blur", () => {
    stopTypingNow();
  });
}

window.addEventListener("beforeunload", () => {
  stopTypingNow();
});

// -----------------------------
// INIT
// -----------------------------
setActiveRoomUI(activeRoom);
startGroupChatListener(activeRoom);
startTypingListener(activeRoom);
