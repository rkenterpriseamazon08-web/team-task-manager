import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
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
  appId: "1:958317121497:web:7abd2d7ae0207d344dd3c8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -----------------------------
// GROUP CHAT ELEMENTS
// -----------------------------
const groupChatMessages = document.getElementById("group-chat-messages");
const groupChatInput = document.getElementById("group-chat-input");
const groupSendBtn = document.getElementById("group-send-btn");

// -----------------------------
// SEND MESSAGE
// -----------------------------
async function sendGroupMessage() {
  const text = groupChatInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "groupMessages"), {
    sender: "You",
    text: text,
    createdAt: serverTimestamp()
  });

  groupChatInput.value = "";
}

// -----------------------------
// REALTIME LISTENER
// -----------------------------
const q = query(collection(db, "groupMessages"), orderBy("createdAt"));

onSnapshot(q, (snapshot) => {
  groupChatMessages.innerHTML = "";

  snapshot.forEach((doc) => {
    const msg = doc.data();

    const div = document.createElement("div");
    div.className = "message-bubble received";
    div.innerHTML = `<strong>${msg.sender}:</strong> ${msg.text}`;

    groupChatMessages.appendChild(div);
  });

  groupChatMessages.scrollTop = groupChatMessages.scrollHeight;
});

// -----------------------------
// EVENTS
// -----------------------------
groupSendBtn.addEventListener("click", sendGroupMessage);

groupChatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendGroupMessage();
});
