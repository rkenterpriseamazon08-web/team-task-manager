import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
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

// -----------------------------
// CONFIG
// -----------------------------
const GROUP_CHAT_COLLECTION = "groupMessages";
let activeRoom = "general";
let unsubscribeGroupListener = null;

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

function renderGroupChatMessages(messages) {
  if (!groupChatMessages) return;

  const currentUser = getCurrentUser();
  const myEmail = currentUser?.email || "";

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

    const div = document.createElement("div");
    div.className = `message-bubble ${isMine ? "sent" : "received"}`;
    div.innerHTML = `
      <strong>${isMine ? "You" : msg.sender}:</strong> ${msg.text}
    `;

    groupChatMessages.appendChild(div);
  });

  groupChatMessages.scrollTop = groupChatMessages.scrollHeight;
}

// -----------------------------
// REAL-TIME LISTENER
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

      snapshot.forEach((doc) => {
        const data = doc.data();
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
          <strong>System:</strong> Unable to load group chat messages.
        </div>
      `;
    }
  );
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
  btn.addEventListener("click", () => {
    const selectedRoom = btn.dataset.room;
    activeRoom = selectedRoom;
    setActiveRoomUI(activeRoom);
    startGroupChatListener(activeRoom);
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
}

// -----------------------------
// INIT
// -----------------------------
setActiveRoomUI(activeRoom);
startGroupChatListener(activeRoom);
