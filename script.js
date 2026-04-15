const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbH6vs-uQ6KeP-vCtV2Fz0MPF_POhFphoJKXZfOXO6iIGjdON0PAj3uuwAaC_Qrg343g/exec";

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
const chatMessages = document.querySelector(".chat-messages");

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

// -----------------------------
// SIMPLE CHAT SEND FUNCTION
// -----------------------------
function sendMessage() {
  if (!chatInput || !chatMessages) return;

  const messageText = chatInput.value.trim();

  if (messageText === "") {
    return;
  }

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message-bubble", "sent");
  messageDiv.textContent = messageText;

  chatMessages.appendChild(messageDiv);

  chatInput.value = "";

  // Auto scroll to latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send on button click
if (sendMessageBtn) {
  sendMessageBtn.addEventListener("click", sendMessage);
}

// Send on Enter key
if (chatInput) {
  chatInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
}

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

setupNavigation();
checkExistingLogin();
