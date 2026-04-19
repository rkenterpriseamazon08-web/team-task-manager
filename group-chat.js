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

    // ✅ FIXED HERE (ONLY CHANGE)
    div.innerHTML = `
      <strong>${msg.sender || "Unknown"}:</strong> ${msg.text}
    `;

    groupChatMessages.appendChild(div);
  });

  groupChatMessages.scrollTop = groupChatMessages.scrollHeight;
}
