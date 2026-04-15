const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfqF9IkxNX0hEaBqXAA3XumeH_C05ebGFAGLfGKAxl3CgA-0W-abGLJ5UpI63pehJHfQ/exec";

const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
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

// Chat elements
const chatInput = document.getElementById("chat-message-input");
const sendMessageBtn = document.getElementById("send-message-btn");
const chatMessages = document.getElementById("chat-messages");
const chatUsersList = document.getElementById("chat-users-list");

// Task modal elements
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

// Dashboard/task UI elements
const recentTaskList = document.getElementById("recent-task-list");
const pendingTaskColumn = document.getElementById("pending-task-column");
const inprogressTaskColumn = document.getElementById("inprogress-task-column");
const completedTaskColumn = document.getElementById("completed-task-column");

const totalTasksCount = document.getElementById("total-tasks-count");
const inProgressCount = document.getElementById("in-progress-count");
const completedCount = document.getElementById("completed-count");
const notificationsCount = document.getElementById("notifications-count");

// -----------------------------------
// DYNAMIC GROUP MEMBERS
// -----------------------------------
const groupMembers = [
  { name: "Rahul", role: "Project Manager", active: true },
  { name: "Sneha", role: "Business Analyst", active: true },
  { name: "Amit", role: "Developer", active: true },
  { name: "Priya", role: "Designer", active: true }
];

// -----------------------------------
// DEFAULT TASKS
// -----------------------------------
const defaultTasks = [
  {
    id: Date.now() + 1,
    title: "Prepare sales presentation",
    description: "Prepare the sales presentation for leadership review",
    severity: "High",
    deadline: "2026-04-20",
    assignedTo: "Rahul",
    status: "In Progress"
  },
  {
    id: Date.now() + 2,
    title: "Update product pricing sheet",
    description: "Refresh pricing sheet with latest numbers",
    severity: "Low",
    deadline: "2026-04-18",
    assignedTo: "Sneha",
    status: "Completed"
  },
  {
    id: Date.now() + 3,
    title: "Client follow-up email",
    description: "Send follow-up email to the client",
    severity: "Medium",
    deadline: "2026-04-17",
    assignedTo: "Amit",
    status: "Pending"
  }
];

// -----------------------------------
// CHAT REPLY RULES
// -----------------------------------
const replyRules = [
  {
    keywords: ["hello", "hi", "hey", "hellooo", "hii"],
    replies: [
      "Hi! I am here.",
      "Hello, what do you need?",
      "Hey! Any update?",
      "Hi, how can I help?"
    ]
  },
  {
    keywords: ["task", "tasks", "status", "update"],
    replies: [
      "I will share the latest task update shortly.",
      "Task status is being updated.",
      "I am checking the current progress.",
      "Let us sync on the task status."
    ]
  },
  {
    keywords: ["report", "deck", "presentation", "chart", "charts"],
    replies: [
      "I will share the latest version soon.",
      "The report is in progress.",
      "Let me review the deck once.",
      "I can help finalize the presentation."
    ]
  },
  {
    keywords: ["deadline", "urgent", "priority", "high"],
    replies: [
      "Understood, I will prioritize this.",
      "This looks urgent. I am checking it now.",
      "Let us close this on priority.",
      "I will take this up first."
    ]
  },
  {
    keywords: ["thanks", "thank you", "great"],
    replies: [
      "You are welcome.",
      "Glad to help.",
      "No problem at all.",
      "Happy to help."
    ]
  }
];

const defaultReplies = [
  "Noted.",
  "Okay, understood.",
  "I will check and update.",
  "Sounds good.",
  "Let us discuss this further.",
  "Understood, working on it.",
  "Thanks for the update."
];

// -----------------------------------
// LOGIN SCREEN HELPERS
// -----------------------------------
function showLoginScreen() {
  loginScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
}

function showAppScreen() {
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
}

function setLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className = "login-message";
  if (type) loginMessage.classList.add(type);
}

function updateUserUI(user) {
  const userName = user.name || "User";
  const userRole = user.role || "Employee";
  const firstLetter = userName.charAt(0).toUpperCase();

  sidebarUserName.textContent = userName;
  sidebarUserRole.textContent = userRole;
  topbarUserName.textContent = userName;
  userAvatar.textContent = firstLetter;
}

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

// -----------------------------------
// NAVIGATION
// -----------------------------------
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

      pageTitle.textContent = item.textContent;
    });
  });
}

// -----------------------------------
// CHAT USER LIST
// -----------------------------------
function renderChatUsers() {
  if (!chatUsersList) return;

  chatUsersList.innerHTML = "";

  const activeMembers = groupMembers.filter(member => member.active);

  activeMembers.forEach((member, index) => {
    const userDiv = document.createElement("div");
    userDiv.className = index === 0 ? "chat-user active-chat-user" : "chat-user";
    userDiv.innerHTML = `
      <strong>${member.name}</strong><br>
      <small>${member.role}</small>
    `;
    chatUsersList.appendChild(userDiv);
  });
}

// -----------------------------------
// CHAT HELPERS
// -----------------------------------
function scrollChatToBottom() {
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function createMessageBubble(sender, text, type) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message-bubble", type);
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  return messageDiv;
}

function addUserMessage(text) {
  if (!chatMessages) return;
  const messageDiv = createMessageBubble("You", text, "sent");
  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

function addBotMessage(sender, text) {
  if (!chatMessages) return;
  const messageDiv = createMessageBubble(sender, text, "received");
  chatMessages.appendChild(messageDiv);
  scrollChatToBottom();
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function generateReplyText(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  for (const rule of replyRules) {
    const matched = rule.keywords.some((keyword) => lowerMessage.includes(keyword));
    if (matched) {
      return getRandomItem(rule.replies);
    }
  }

  return getRandomItem(defaultReplies);
}

function simulateGroupReplies(userMessage) {
  const activeMembers = groupMembers.filter(member => member.active);
  if (activeMembers.length === 0) return;

  const shuffledMembers = shuffleArray(activeMembers);
  const maxReplies = Math.min(3, shuffledMembers.length);
  const replyCount = Math.floor(Math.random() * maxReplies) + 1;
  const selectedMembers = shuffledMembers.slice(0, replyCount);

  selectedMembers.forEach((member, index) => {
    const replyText = generateReplyText(userMessage);

    setTimeout(() => {
      addBotMessage(member.name, replyText);
    }, 1000 + index * 1200);
  });
}

function sendMessage() {
  if (!chatInput || !chatMessages) return;

  const messageText = chatInput.value.trim();
  if (messageText === "") return;

  addUserMessage(messageText);
  chatInput.value = "";
  simulateGroupReplies(messageText);
}

// -----------------------------------
// TASK STORAGE HELPERS
// -----------------------------------
function getTasksFromStorage() {
  const savedTasks = localStorage.getItem("ttm_tasks");

  if (!savedTasks) {
    localStorage.setItem("ttm_tasks", JSON.stringify(defaultTasks));
    return [...defaultTasks];
  }

  try {
    return JSON.parse(savedTasks);
  } catch {
    localStorage.setItem("ttm_tasks", JSON.stringify(defaultTasks));
    return [...defaultTasks];
  }
}

function saveTasksToStorage(tasks) {
  localStorage.setItem("ttm_tasks", JSON.stringify(tasks));
}

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

// -----------------------------------
// RENDER RECENT TASKS
// -----------------------------------
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

// -----------------------------------
// RENDER TASK BOARD
// -----------------------------------
function renderTaskBoard() {
  if (!pendingTaskColumn || !inprogressTaskColumn || !completedTaskColumn) return;

  const tasks = getTasksFromStorage();

  pendingTaskColumn.innerHTML = "";
  inprogressTaskColumn.innerHTML = "";
  completedTaskColumn.innerHTML = "";

  const pendingTasks = tasks.filter(task => task.status === "Pending");
  const inProgressTasks = tasks.filter(task => task.status === "In Progress");
  const completedTasks = tasks.filter(task => task.status === "Completed");

  renderTaskCardsIntoColumn(pendingTaskColumn, pendingTasks);
  renderTaskCardsIntoColumn(inprogressTaskColumn, inProgressTasks);
  renderTaskCardsIntoColumn(completedTaskColumn, completedTasks);
}

function renderTaskCardsIntoColumn(columnElement, tasks) {
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

// -----------------------------------
// UPDATE DASHBOARD COUNTS
// -----------------------------------
function updateDashboardCounts() {
  const tasks = getTasksFromStorage();

  const total = tasks.length;
  const inProgress = tasks.filter(task => task.status === "In Progress").length;
  const completed = tasks.filter(task => task.status === "Completed").length;
  const notifications = tasks.filter(task => task.status === "Pending").length;

  if (totalTasksCount) totalTasksCount.textContent = total;
  if (inProgressCount) inProgressCount.textContent = inProgress;
  if (completedCount) completedCount.textContent = completed;
  if (notificationsCount) notificationsCount.textContent = notifications;
}

// -----------------------------------
// RENDER ALL TASK UI
// -----------------------------------
function renderAllTaskUI() {
  renderRecentTasks();
  renderTaskBoard();
  updateDashboardCounts();
}

// -----------------------------------
// TASK MODAL
// -----------------------------------
function openTaskModal() {
  if (taskModalOverlay) {
    taskModalOverlay.classList.remove("hidden");
  }
}

function closeTaskModal() {
  if (taskModalOverlay) {
    taskModalOverlay.classList.add("hidden");
  }

  if (taskForm) {
    taskForm.reset();
  }
}

function createNewTask(taskData) {
  const tasks = getTasksFromStorage();

  const newTask = {
    id: Date.now(),
    title: taskData.title,
    description: taskData.description,
    severity: taskData.severity,
    status: taskData.status,
    deadline: taskData.deadline,
    assignedTo: taskData.assignedTo
  };

  tasks.push(newTask);
  saveTasksToStorage(tasks);
  renderAllTaskUI();
}

// -----------------------------------
// TASK FORM SUBMIT
// -----------------------------------
if (taskForm) {
  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const severity = taskSeverityInput.value;
    const status = taskStatusInput.value;
    const deadline = taskDeadlineInput.value;
    const assignedTo = taskAssignedToInput.value.trim();

    if (!title || !description || !severity || !status || !deadline || !assignedTo) {
      alert("Please fill all task fields.");
      return;
    }

    createNewTask({
      title,
      description,
      severity,
      status,
      deadline,
      assignedTo
    });

    closeTaskModal();
  });
}

// -----------------------------------
// BUTTON EVENTS
// -----------------------------------
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

// -----------------------------------
// LOGIN
// -----------------------------------
loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    setLoginMessage("Please enter both email and password.", "error");
    return;
  }

  if (APPS_SCRIPT_URL === "PASTE_YOUR_WEB_APP_URL_HERE") {
    setLoginMessage("Please paste your Apps Script Web App URL in script.js first.", "error");
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    setLoginMessage("Checking your credentials...", "");

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const result = await response.json();

    if (result.success) {
      setLoginMessage("Login successful!", "success");

      const user = result.user;
      saveUserToLocalStorage(user);
      updateUserUI(user);

      setTimeout(() => {
        showAppScreen();
        loginForm.reset();
        setLoginMessage("", "");
      }, 700);
    } else {
      setLoginMessage(result.message || "Login failed.", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    setLoginMessage("Unable to connect to server. Please check your Apps Script URL and deployment.", "error");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});

logoutBtn.addEventListener("click", function () {
  clearUserFromLocalStorage();
  showLoginScreen();
});

function checkExistingLogin() {
  const savedUser = getUserFromLocalStorage();

  if (savedUser) {
    updateUserUI(savedUser);
    showAppScreen();
  } else {
    showLoginScreen();
  }
}

// -----------------------------------
// INIT
// -----------------------------------
setupNavigation();
checkExistingLogin();
renderChatUsers();
renderAllTaskUI();
