// Get all sidebar navigation buttons
const navItems = document.querySelectorAll(".nav-item");

// Get all content sections
const sections = document.querySelectorAll(".content-section");

// Get page title element
const pageTitle = document.getElementById("page-title");

// Add click event to each nav item
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remove active class from all buttons
    navItems.forEach((btn) => btn.classList.remove("active"));

    // Add active class to clicked button
    item.classList.add("active");

    // Hide all sections
    sections.forEach((section) => section.classList.remove("active-section"));

    // Show the selected section
    const targetSectionId = item.getAttribute("data-section");
    document.getElementById(targetSectionId).classList.add("active-section");

    // Update page title
    pageTitle.textContent = item.textContent;
  });
});
