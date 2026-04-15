// ========================================
// IMPORTANT:
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BELOW
// ========================================
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbH6vs-uQ6KeP-vCtV2Fz0MPF_POhFphoJKXZfOXO6iIGjdON0PAj3uuwAaC_Qrg343g/exec";

// Screen elements
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");

// Login form elements
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const loginMessage = document.getElementById("login-message");

// User display elements
const sidebarUserName = document.getElementById("sidebar-user-name");
const sidebarUserRole = document.getElementById("sidebar-user-role");
const topbarUserName = document.getElementById("topbar-user-name");
const userAvatar = document.getElementById("user-avatar");

// Logout button
const logoutBtn = document.getElementById("logout-btn");

// Navigation elements
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".content-section");
const pageTitle = document.getElementById("page-title");

// ----------------------------------------
// Helper: Show login screen
// ----------------------------------------
function showLoginScreen() {
  loginScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
}

// ----------------------------------------
// Helper: Show app screen
// ----------------------------------------
function showAppScreen() {
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
}

// ----------------------------------------
// Helper: Set login message
// ----------------------------------------
function setLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className = "login-message";

  if (type) {
    loginMessage.classList.add(type);
  }
}

// ----------------------------------------
// Helper: Update user info in UI
// ----------------------------------------
function updateUserUI(user) {
  const userName = user.name || "User";
  const userRole = user.role || "Employee";
  const firstLetter = userName.charAt(0).toUpperCase();

  sidebarUserName.textContent = userName;
  sidebarUserRole.textContent = userRole;
  topbarUserName.textContent = userName;
  userAvatar.textContent = firstLetter;
}

// ----------------------------------------
// Helper: Save user to browser
// ----------------------------------------
function saveUserToLocalStorage(user) {
  localStorage.setItem("ttm_logged_in_user", JSON.stringify(user));
}

// ----------------------------------------
// Helper: Read user from browser
// ----------------------------------------
function getUserFromLocalStorage() {
  const savedUser = localStorage.getItem("ttm_logged_in_user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    return null;
  }
}

// ----------------------------------------
// Helper: Remove user from browser
// ----------------------------------------
function clearUserFromLocalStorage() {
  localStorage.removeItem("ttm_logged_in_user");
}

// ----------------------------------------
// Sidebar navigation logic
// ----------------------------------------
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

// ----------------------------------------
// Login form submit
// ----------------------------------------
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

// ----------------------------------------
// Logout logic
// ----------------------------------------
logoutBtn.addEventListener("click", function () {
  clearUserFromLocalStorage();
  showLoginScreen();
});

// ----------------------------------------
// Check if user already logged in
// ----------------------------------------
function checkExistingLogin() {
  const savedUser = getUserFromLocalStorage();

  if (savedUser) {
    updateUserUI(savedUser);
    showAppScreen();
  } else {
    showLoginScreen();
  }
}

// ----------------------------------------
// Initial app setup
// ----------------------------------------
setupNavigation();
checkExistingLogin();
