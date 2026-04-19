const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvsOgYah2WrM4_r_yGMlZrRgg-HAs0A9_ZGt9n5yjfyxS8yhpC4eAlEDWAElJBzFKDsQ/exec";
const APP_STORAGE_VERSION = "team-task-manager-dashboard-2026-04-19";

// -----------------------------
// BASIC ELEMENTS
// -----------------------------
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");

const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const loginMessage = document.getElementById("login-message");

const sidebarUserName = document.getElementById("sidebar-user-name");
const sidebarUserRole = document.getElementById("sidebar-user-role");
const topbarUserName = document.getElementById("topbar-user-name");
const userAvatar = document.getElementById("user-avatar");
const logoutBtn = document.getElementById("logout-btn");

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".content-section");
const pageTitle = document.getElementById("page-title");

// -----------------------------
// CHAT ELEMENTS
// -----------------------------
const chatInput = document.getElementById("chat-message-input");
const sendMessageBtn = document.getElementById("send-message-btn");
const chatMessages = document.getElementById("chat-messages");
const chatUsersList = document.getElementById("chat-users-list");

// -----------------------------
// TASK ELEMENTS
// -----------------------------
const openTaskModalBtn = document.getElementById("open-task-modal-btn");
const closeTaskModalBtn = document.getElementById("close-task-modal-btn");
const taskModalOverlay = document.getElementById("task-modal-overlay");
const taskForm = document.getElementById("task-form");

const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskSeverityInput = document.getElementById("task-severity");
const taskStatusInput = document.getElementById("task-status");
const taskDeadlineInput = document.getElementById("task-deadline");
const taskAssignedToInput = document.getElementById("task-assigned-to");

const recentTaskList = document.getElementById("recent-task-list");
const pendingTaskColumn = document.getElementById("pending-task-column");
const inprogressTaskColumn = document.getElementById("inprogress-task-column");
const completedTaskColumn = document.getElementById("completed-task-column");

const totalTasksCount = document.getElementById("total-tasks-count");
const inProgressCount = document.getElementById("in-progress-count");
const completedCount = document.getElementById("completed-count");
const notificationsCount = document.getElementById("notifications-count");

// -----------------------------
// NOTIFICATION ELEMENTS
// -----------------------------
const notificationList = document.getElementById("notification-list");
const enableBrowserNotificationsBtn = document.getElementById("enable-browser-notifications-btn");
const disableBrowserNotificationsBtn = document.getElementById("disable-browser-notifications-btn");
const notificationPermissionStatus = document.getElementById("notification-permission-status");
const inAppToastToggle = document.getElementById("in-app-toast-toggle");
const notificationSoundToggle = document.getElementById("notification-sound-toggle");
const clearNotificationsBtn = document.getElementById("clear-notifications-btn");
const resetAppDataBtn = document.getElementById("reset-app-data-btn");

// -----------------------------
// TOAST CONTAINER
// -----------------------------
let toastContainer = document.getElementById("toast-container");
if (!toastContainer) {
  toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.className = "toast-container";
  document.body.appendChild(toastContainer);
}

// -----------------------------
// DATA
// -----------------------------
const groupMembers = [
  { name: "Rahul", role: "Project Manager", active: true },
  { name: "Sneha", role: "Business Analyst", active: true },
  { name: "Amit", role: "Developer", active: true },
  { name: "Priya", role: "Designer", active: true }
];

const defaultTasks = [
  {
    id: 1,
    title: "Prepare sales presentation",
    description: "Prepare the sales presentation for leadership review",
    severity: "High",
    deadline: "2026-04-20",
    assignedTo: "Rahul",
    status: "In Progress"
  },
  {
    id: 2,
    title: "Update product pricing sheet",
    description: "Refresh pricing sheet with latest numbers",
    severity: "Low",
    deadline: "2026-04-18",
    assignedTo: "Sneha",
    status: "Completed"
  },
  {
    id: 3,
    title: "Client follow-up email",
    description: "Send follow-up email to the client",
    severity: "Medium",
    deadline: "2026-04-17",
    assignedTo: "Amit",
    status: "Pending"
  },
  {
    id: 4,
    title: "Prepare charts",
    description: "Prepare charts for the team dashboard",
    severity: "Medium",
    deadline: "2026-04-22",
    assignedTo: "Priya",
    status: "Pending"
  },
  {
    id: 5,
    title: "Prepare charts",
    description: "Prepare charts for the manager dashboard",
    severity: "Medium",
    deadline: "2026-04-23",
    assignedTo: "priya",
    status: "In Progress"
  }
];

const defaultNotifications = [
  {
    id: 1,
    title: "New task assigned",
    message: 'You have been assigned "Prepare weekly status report"',
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    title: "Task completed",
    message: 'Sneha completed "Update pricing sheet"',
    timestamp: new Date().toISOString()
  },
  {
    id: 3,
    title: "New message",
    message: "Rahul sent you a message",
    timestamp: new Date().toISOString()
  },
  {
    id: 4,
    title: "Task due soon",
    message: '"Prepare sales presentation" is due soon',
    timestamp: new Date().toISOString()
  },
  {
    id: 5,
    title: "Task updated",
    message: 'Priya updated "Prepare charts"',
    timestamp: new Date().toISOString()
  }
];

let selectedChatMember = "Rahul";

const defaultChatConversations = {
  Rahul: [
    { sender: "Rahul", text: "Hi, please share the task status.", type: "received" },
    { sender: "You", text: "I am working on it.", type: "sent" }
  ],
  Sneha: [
    { sender: "Sneha", text: "Pricing sheet has been updated.", type: "received" }
  ],
  Amit: [
    { sender: "Amit", text: "Okay, please update by evening.", type: "received" }
  ],
  Priya: [
    { sender: "Priya", text: "Please share the latest design version.", type: "received" }
  ]
};

// -----------------------------
// UI HELPERS
// -----------------------------
function showLoginScreen() {
  if (loginScreen) loginScreen.classList.remove("hidden");
  if (appScreen) appScreen.classList.add("hidden");
}

function showAppScreen() {
  if (loginScreen) loginScreen.classList.add("hidden");
  if (appScreen) appScreen.classList.remove("hidden");
  showDashboardSection();
}

function setLoginMessage(message, type = "") {
  if (!loginMessage) return;
  loginMessage.textContent = message;
  loginMessage.className = "login-message";
  if (type) loginMessage.classList.add(type);
}

function updateUserUI(user) {
  const userName = user?.name || "User";
  const userRole = user?.role || "Employee";
  const firstLetter = userName.charAt(0).toUpperCase();

  if (sidebarUserName) sidebarUserName.textContent = userName;
  if (sidebarUserRole) sidebarUserRole.textContent = userRole;
  if (topbarUserName) topbarUserName.textContent = userName;
  if (userAvatar) userAvatar.textContent = firstLetter;
}

function isInAppToastEnabled() {
  return localStorage.getItem("ttm_in_app_toast_enabled") !== "false";
}

function setInAppToastEnabled(value) {
  localStorage.setItem("ttm_in_app_toast_enabled", value ? "true" : "false");
}

function isNotificationSoundEnabled() {
  return localStorage.getItem("ttm_notification_sound_enabled") === "true";
}

function setNotificationSoundEnabled(value) {
  localStorage.setItem("ttm_notification_sound_enabled", value ? "true" : "false");
}

function playNotificationSound() {
  if (!isNotificationSoundEnabled()) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 820;
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
  } catch (error) {
    console.warn("Notification sound could not be played:", error);
  }
}

function showToast(title, message) {
  if (!toastContainer) return;
  if (!isInAppToastEnabled()) return;

  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.innerHTML = `
    <h4>${title}</h4>
    <p>${message}</p>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(18px)";
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// -----------------------------
// LOCAL STORAGE HELPERS
// -----------------------------
function saveUserToLocalStorage(user) {
  localStorage.setItem("ttm_logged_in_user", JSON.stringify(user));
}

function getUserFromLocalStorage() {
  const savedUser = localStorage.getItem("ttm_logged_in_user");
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function clearUserFromLocalStorage() {
  localStorage.removeItem("ttm_logged_in_user");
}

function cloneDefaultTasks() {
  return JSON.parse(JSON.stringify(defaultTasks));
}

function cloneDefaultNotifications() {
  return JSON.parse(JSON.stringify(defaultNotifications));
}

function isValidTaskList(tasks) {
  if (!Array.isArray(tasks)) return false;
  if (tasks.length === 0) return true;

  return tasks.every((task) => (
    task &&
    typeof task.title === "string" &&
    typeof task.status === "string" &&
    ["Pending", "In Progress", "Completed"].includes(task.status)
  ));
}

function isValidNotificationList(notifications) {
  if (!Array.isArray(notifications)) return false;
  if (notifications.length === 0) return true;

  return notifications.every((notification) => (
    notification &&
    typeof notification.title === "string" &&
    typeof notification.message === "string"
  ));
}

function showDashboardSection() {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.getAttribute("data-section") === "dashboard-section");
  });

  sections.forEach((section) => {
    section.classList.toggle("active-section", section.id === "dashboard-section");
  });

  if (pageTitle) pageTitle.textContent = "Dashboard";
}

function getTasksFromStorage() {
  const savedTasks = localStorage.getItem("ttm_tasks");

  if (!savedTasks) {
    const tasks = cloneDefaultTasks();
    localStorage.setItem("ttm_tasks", JSON.stringify(tasks));
    return tasks;
  }

  try {
    const tasks = JSON.parse(savedTasks);
    if (!isValidTaskList(tasks)) throw new Error("Invalid task storage");
    return tasks;
  } catch {
    const tasks = cloneDefaultTasks();
    localStorage.setItem("ttm_tasks", JSON.stringify(tasks));
    return tasks;
  }
}

function saveTasksToStorage(tasks) {
  localStorage.setItem("ttm_tasks", JSON.stringify(tasks));
}

function getNotificationsFromStorage() {
  const savedNotifications = localStorage.getItem("ttm_notifications");

  if (!savedNotifications) {
    const notifications = cloneDefaultNotifications();
    localStorage.setItem("ttm_notifications", JSON.stringify(notifications));
    return notifications;
  }

  try {
    const notifications = JSON.parse(savedNotifications);
    if (!isValidNotificationList(notifications)) throw new Error("Invalid notification storage");
    return notifications;
  } catch {
    const notifications = cloneDefaultNotifications();
    localStorage.setItem("ttm_notifications", JSON.stringify(notifications));
    return notifications;
  }
}

function saveNotificationsToStorage(notifications) {
  localStorage.setItem("ttm_notifications", JSON.stringify(notifications));
}

function getChatsFromStorage() {
  const savedChats = localStorage.getItem("ttm_chats");

  if (!savedChats) {
    localStorage.setItem("ttm_chats", JSON.stringify(defaultChatConversations));
    return JSON.parse(JSON.stringify(defaultChatConversations));
  }

  try {
    return JSON.parse(savedChats);
  } catch {
    localStorage.setItem("ttm_chats", JSON.stringify(defaultChatConversations));
    return JSON.parse(JSON.stringify(defaultChatConversations));
  }
}

function saveChatsToStorage(chats) {
  localStorage.setItem("ttm_chats", JSON.stringify(chats));
}

function migrateAppStorageIfNeeded() {
  if (localStorage.getItem("ttm_app_storage_version") === APP_STORAGE_VERSION) return;

  localStorage.setItem("ttm_tasks", JSON.stringify(cloneDefaultTasks()));
  localStorage.setItem("ttm_notifications", JSON.stringify(cloneDefaultNotifications()));
  localStorage.setItem("ttm_chats", JSON.stringify(defaultChatConversations));
  localStorage.removeItem("ttm_group_messages");
  localStorage.setItem("ttm_app_storage_version", APP_STORAGE_VERSION);
}

// -----------------------------
// NAVIGATION
// -----------------------------
function setupNavigation() {
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((btn) => btn.classList.remove("active"));
      item.classList.add("active");

      sections.forEach((section) => section.classList.remove("active-section"));

      const targetSectionId = item.getAttribute("data-section");
      const targetSection = document.getElementById(targetSectionId);

      if (targetSection) {
        targetSection.classList.add("active-section");
      }

      if (pageTitle) pageTitle.textContent = item.textContent;
    });
  });
}

// -----------------------------
// CHAT
// -----------------------------
function renderChatUsers() {
  if (!chatUsersList) return;

  chatUsersList.innerHTML = "";

  const activeMembers = groupMembers.filter((member) => member.active);

  activeMembers.forEach((member) => {
    const userDiv = document.createElement("div");
    userDiv.className =
      member.name === selectedChatMember ? "chat-user active-chat-user" : "chat-user";

    userDiv.innerHTML = `
      <strong>${member.name}</strong><br>
      <small>${member.role}</small>
    `;

    userDiv.addEventListener("click", function () {
      selectedChatMember = member.name;
      renderChatUsers();
      renderSelectedChatMessages();
    });

    chatUsersList.appendChild(userDiv);
  });
}

function scrollChatToBottom() {
  if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createMessageBubble(sender, text, type) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message-bubble", type);
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  return messageDiv;
}

function renderSelectedChatMessages() {
  if (!chatMessages) return;

  const chats = getChatsFromStorage();
  const selectedConversation = chats[selectedChatMember] || [];

  chatMessages.innerHTML = "";

  selectedConversation.forEach((message) => {
    const bubble = createMessageBubble(message.sender, message.text, message.type);
    chatMessages.appendChild(bubble);
  });

  scrollChatToBottom();
}

function sendMessage() {
  if (!chatInput) return;

  const messageText = chatInput.value.trim();
  if (!messageText) return;

  const chats = getChatsFromStorage();

  if (!chats[selectedChatMember]) {
    chats[selectedChatMember] = [];
  }

  chats[selectedChatMember].push({
    sender: "You",
    text: messageText,
    type: "sent"
  });

  saveChatsToStorage(chats);
  chatInput.value = "";
  renderSelectedChatMessages();

  addNotification("New chat message", `You sent a message to ${selectedChatMember}`);
}

// -----------------------------
// NOTIFICATIONS
// -----------------------------
function formatNotificationTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderNotifications() {
  if (!notificationList) return;

  const notifications = getNotificationsFromStorage();
  notificationList.innerHTML = "";

  if (notifications.length === 0) {
    notificationList.innerHTML = `
      <div class="notification-item">
        <h4>No notifications</h4>
        <p>You do not have any notifications yet.</p>
      </div>
    `;
    return;
  }

  notifications.forEach((notification) => {
    const item = document.createElement("div");
    item.className = "notification-item";
    item.innerHTML = `
      <h4>${notification.title}</h4>
      <p>${notification.message}</p>
      <p style="margin-top:8px; font-size:12px; color:#94a3b8;">
        ${formatNotificationTime(notification.timestamp)}
      </p>
    `;
    notificationList.appendChild(item);
  });
}

function isBrowserNotificationEnabled() {
  return localStorage.getItem("ttm_browser_notifications_enabled") === "true";
}

function setBrowserNotificationEnabled(value) {
  localStorage.setItem("ttm_browser_notifications_enabled", value ? "true" : "false");
  updateNotificationPermissionUI();
}

function updateNotificationPermissionUI() {
  if (!notificationPermissionStatus) return;

  let permissionText = "Permission status: Unsupported";
  if ("Notification" in window) {
    permissionText = `Permission status: ${Notification.permission}`;
  }

  const enabledText = isBrowserNotificationEnabled() ? "Enabled" : "Disabled";
  notificationPermissionStatus.textContent = `${permissionText} | App notifications: ${enabledText}`;
}

async function enableBrowserNotifications() {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    setBrowserNotificationEnabled(true);
    alert("Browser notifications enabled.");
  } else {
    setBrowserNotificationEnabled(false);
    alert("Notification permission was not granted.");
  }
}

function disableBrowserNotifications() {
  setBrowserNotificationEnabled(false);
  alert("Browser notifications disabled for this app.");
}

function triggerBrowserNotification(title, message) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!isBrowserNotificationEnabled()) return;
  if (document.visibilityState === "visible") return;

  new Notification(title, {
    body: message
  });
}

function addNotification(title, message) {
  const notifications = getNotificationsFromStorage();

  const newNotification = {
    id: Date.now(),
    title,
    message,
    timestamp: new Date().toISOString()
  };

  notifications.unshift(newNotification);
  saveNotificationsToStorage(notifications);
  renderNotifications();
  updateDashboardCounts();
  triggerBrowserNotification(title, message);
  playNotificationSound();
  showToast(title, message);
}

window.addAppNotification = addNotification;

// -----------------------------
// TASKS
// -----------------------------
function getBadgeClass(status) {
  if (status === "In Progress") return "warning";
  if (status === "Completed") return "success";
  return "danger";
}

function formatDate(dateString) {
  if (!dateString) return "No deadline";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function renderRecentTasks() {
  if (!recentTaskList) return;

  const tasks = getTasksFromStorage();
  recentTaskList.innerHTML = "";

  tasks.slice().reverse().forEach((task) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task-item";
    taskDiv.innerHTML = `
      <div>
        <h4>${task.title}</h4>
        <p>Assigned to: ${task.assignedTo}</p>
      </div>
      <span class="badge ${getBadgeClass(task.status)}">${task.status}</span>
    `;
    recentTaskList.appendChild(taskDiv);
  });
}

function renderTaskCardsIntoColumn(columnElement, tasks) {
  if (!columnElement) return;

  if (tasks.length === 0) {
    columnElement.innerHTML = `<p class="empty-task-text">No tasks here.</p>`;
    return;
  }

  tasks.slice().reverse().forEach((task) => {
    const card = document.createElement("div");
    card.className = "kanban-card";
    card.innerHTML = `
      <h5>${task.title}</h5>
      <p><strong>Severity:</strong> ${task.severity}</p>
      <p><strong>Assigned To:</strong> ${task.assignedTo}</p>
      <p><strong>Deadline:</strong> ${formatDate(task.deadline)}</p>
    `;
    columnElement.appendChild(card);
  });
}

function renderTaskBoard() {
  const tasks = getTasksFromStorage();

  if (pendingTaskColumn) pendingTaskColumn.innerHTML = "";
  if (inprogressTaskColumn) inprogressTaskColumn.innerHTML = "";
  if (completedTaskColumn) completedTaskColumn.innerHTML = "";

  const pendingTasks = tasks.filter((task) => task.status === "Pending");
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress");
  const completedTasks = tasks.filter((task) => task.status === "Completed");

  renderTaskCardsIntoColumn(pendingTaskColumn, pendingTasks);
  renderTaskCardsIntoColumn(inprogressTaskColumn, inProgressTasks);
  renderTaskCardsIntoColumn(completedTaskColumn, completedTasks);
}

function updateDashboardCounts() {
  const tasks = getTasksFromStorage();

  const total = tasks.length;
  const inProgress = tasks.filter((task) => task.status === "In Progress").length;
  const completed = tasks.filter((task) => task.status === "Completed").length;
  const notifications = getNotificationsFromStorage().length;

  if (totalTasksCount) totalTasksCount.textContent = total;
  if (inProgressCount) inProgressCount.textContent = inProgress;
  if (completedCount) completedCount.textContent = completed;
  if (notificationsCount) notificationsCount.textContent = notifications;
}

function renderAllTaskUI() {
  renderRecentTasks();
  renderTaskBoard();
  updateDashboardCounts();
}

function openTaskModal() {
  if (taskModalOverlay) taskModalOverlay.classList.remove("hidden");

  if (taskStatusInput && !taskStatusInput.value) {
    taskStatusInput.value = "Pending";
  }

  if (taskSeverityInput && !taskSeverityInput.value) {
    taskSeverityInput.value = "Medium";
  }

  setTimeout(() => {
    taskTitleInput?.focus();
  }, 50);
}

function closeTaskModal() {
  if (taskModalOverlay) taskModalOverlay.classList.add("hidden");
  if (taskForm) taskForm.reset();
}

function createNewTask(taskData) {
  const tasks = getTasksFromStorage();

  const newTask = {
    id: Date.now(),
    title: taskData.title.trim(),
    description: taskData.description.trim(),
    severity: taskData.severity,
    status: taskData.status,
    deadline: taskData.deadline,
    assignedTo: taskData.assignedTo.trim()
  };

  tasks.push(newTask);
  saveTasksToStorage(tasks);
  renderAllTaskUI();

  addNotification("New task created", `${taskData.title} was assigned to ${taskData.assignedTo}`);
}

function getTaskFormValues() {
  return {
    title: taskTitleInput?.value.trim() || "",
    description: taskDescriptionInput?.value.trim() || "",
    severity: taskSeverityInput?.value || "",
    status: taskStatusInput?.value || "",
    deadline: taskDeadlineInput?.value || "",
    assignedTo: taskAssignedToInput?.value.trim() || ""
  };
}

function validateTaskForm(taskData) {
  if (!taskData.title) {
    alert("Please enter task title.");
    taskTitleInput?.focus();
    return false;
  }

  if (!taskData.description) {
    alert("Please enter task description.");
    taskDescriptionInput?.focus();
    return false;
  }

  if (!taskData.severity) {
    alert("Please select severity.");
    taskSeverityInput?.focus();
    return false;
  }

  if (!taskData.status) {
    alert("Please select status.");
    taskStatusInput?.focus();
    return false;
  }

  if (!taskData.deadline) {
    alert("Please select deadline.");
    taskDeadlineInput?.focus();
    return false;
  }

  if (!taskData.assignedTo) {
    alert("Please enter assigned member name.");
    taskAssignedToInput?.focus();
    return false;
  }

  return true;
}

function submitTaskForm() {
  const taskData = getTaskFormValues();

  if (!validateTaskForm(taskData)) return;

  createNewTask(taskData);
  closeTaskModal();
}

// -----------------------------
// LOGIN
// -----------------------------
async function handleLoginSubmit(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");

  const email = emailField ? emailField.value.trim() : "";
  const password = passwordField ? passwordField.value.trim() : "";

  if (!email || !password) {
    setLoginMessage("Please enter both email and password.", "error");
    return;
  }

  if (email.toLowerCase() === "demo@company.com" && password === "123456") {
    const user = {
      email,
      name: "Demo User",
      role: "Manager",
      status: "Active"
    };

    saveUserToLocalStorage(user);
    updateUserUI(user);
    setLoginMessage("Login successful!", "success");

    setTimeout(() => {
      showAppScreen();
      setLoginMessage("");
    }, 200);
    return;
  }

  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
    setLoginMessage("Apps Script URL is missing in script.js.", "error");
    return;
  }

  try {
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.textContent = "Logging in...";
    }

    setLoginMessage("Checking your credentials...");

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const result = await response.json();

    if (result.success) {
      const user = result.user || {
        email,
        name: "User",
        role: "Employee",
        status: "Active"
      };

      saveUserToLocalStorage(user);
      updateUserUI(user);
      setLoginMessage("Login successful!", "success");

      setTimeout(() => {
        showAppScreen();
        if (loginForm) loginForm.reset();
        setLoginMessage("");
      }, 400);
    } else {
      setLoginMessage(result.message || "Login failed.", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    setLoginMessage("Unable to connect to server. Please check your Apps Script URL and deployment.", "error");
  } finally {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  }
}

// -----------------------------
// EVENTS
// -----------------------------
if (loginBtn) {
  loginBtn.addEventListener("click", function () {
    handleLoginSubmit({
      preventDefault: function () {}
    });
  });
}

const loginEmailInput = document.getElementById("email");
const loginPasswordInput = document.getElementById("password");

[loginEmailInput, loginPasswordInput].forEach((field) => {
  if (field) {
    field.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleLoginSubmit({
          preventDefault: function () {}
        });
      }
    });
  }
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    clearUserFromLocalStorage();
    showLoginScreen();
  });
}

if (sendMessageBtn) {
  sendMessageBtn.addEventListener("click", sendMessage);
}

if (chatInput) {
  chatInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
}

if (taskForm) {
  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    submitTaskForm();
  });
}

if (openTaskModalBtn) {
  openTaskModalBtn.addEventListener("click", openTaskModal);
}

if (closeTaskModalBtn) {
  closeTaskModalBtn.addEventListener("click", closeTaskModal);
}

if (taskModalOverlay) {
  taskModalOverlay.addEventListener("click", function (event) {
    if (event.target === taskModalOverlay) {
      closeTaskModal();
    }
  });
}

const taskModalInputs = [
  taskTitleInput,
  taskSeverityInput,
  taskStatusInput,
  taskDeadlineInput,
  taskAssignedToInput
];

taskModalInputs.forEach((field) => {
  if (field) {
    field.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submitTaskForm();
      }
    });
  }
});

if (taskDescriptionInput) {
  taskDescriptionInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      submitTaskForm();
    }
  });
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && taskModalOverlay && !taskModalOverlay.classList.contains("hidden")) {
    closeTaskModal();
  }
});

if (enableBrowserNotificationsBtn) {
  enableBrowserNotificationsBtn.addEventListener("click", enableBrowserNotifications);
}

if (disableBrowserNotificationsBtn) {
  disableBrowserNotificationsBtn.addEventListener("click", disableBrowserNotifications);
}

if (inAppToastToggle) {
  inAppToastToggle.checked = isInAppToastEnabled();
  inAppToastToggle.addEventListener("change", function () {
    setInAppToastEnabled(inAppToastToggle.checked);
  });
}

if (notificationSoundToggle) {
  notificationSoundToggle.checked = isNotificationSoundEnabled();
  notificationSoundToggle.addEventListener("change", function () {
    setNotificationSoundEnabled(notificationSoundToggle.checked);
  });
}

if (clearNotificationsBtn) {
  clearNotificationsBtn.addEventListener("click", function () {
    saveNotificationsToStorage([]);
    renderNotifications();
    updateDashboardCounts();
    showToast("Notifications cleared", "All notifications have been removed.");
  });
}

if (resetAppDataBtn) {
  resetAppDataBtn.addEventListener("click", function () {
    const confirmed = window.confirm("Reset all app data on this device?");
    if (!confirmed) return;

    localStorage.removeItem("ttm_tasks");
    localStorage.removeItem("ttm_notifications");
    localStorage.removeItem("ttm_chats");
    localStorage.removeItem("ttm_group_messages");

    renderChatUsers();
    renderSelectedChatMessages();
    renderAllTaskUI();
    renderNotifications();
    showToast("App data reset", "Default tasks, chats, and notifications were restored.");
  });
}

// -----------------------------
// INIT
// -----------------------------
function checkExistingLogin() {
  const savedUser = getUserFromLocalStorage();

  if (savedUser) {
    updateUserUI(savedUser);
    showAppScreen();
  } else {
    showLoginScreen();
  }
}

migrateAppStorageIfNeeded();
setupNavigation();
checkExistingLogin();
renderChatUsers();
renderSelectedChatMessages();
renderAllTaskUI();
renderNotifications();
updateNotificationPermissionUI();
