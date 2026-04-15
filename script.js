// Step 1 only: basic UI interactions placeholder

document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all menu items
      menuItems.forEach((link) => link.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");
    });
  });

  const newTaskButton = document.querySelector(".primary-btn");

  newTaskButton.addEventListener("click", function () {
    alert("New Task form will be added in a later step.");
  });
});
