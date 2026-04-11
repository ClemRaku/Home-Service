document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".toggle input");
  const statusDot = document.querySelector(".status-card .dot");
  const statusText = document.querySelector(".status-card span");

  if (!toggle || !statusDot || !statusText) {
    return;
  }

  const updateStatus = () => {
    if (toggle.checked) {
      statusDot.style.background = "#48d889";
      statusText.lastChild.textContent = "Online";
    } else {
      statusDot.style.background = "#f6b028";
      statusText.lastChild.textContent = "Offline";
    }
  };

  updateStatus();
  toggle.addEventListener("change", updateStatus);

  // Edit Profile Modal
  const openModalBtn = document.getElementById("openEditModal");
  const closeModalBtn = document.getElementById("cancelModal");
  const modalCloseIcon = document.querySelector(".modal-close");
  const modal = document.getElementById("editProfileModal");
  const editForm = document.getElementById("editProfileForm");

  const openModal = () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    lucide.createIcons();
  };

  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  if (openModalBtn) {
    openModalBtn.addEventListener("click", openModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  if (modalCloseIcon) {
    modalCloseIcon.addEventListener("click", closeModal);
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Handle form submission
  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const formData = new FormData(editForm);
      const data = Object.fromEntries(formData.entries());
      
      console.log("Profile updated:", data);
      
      // Here you would typically send the data to your backend
      // For now, we'll just show a success message
      alert("Profile updated successfully!");
      
      closeModal();
    });
  }
});