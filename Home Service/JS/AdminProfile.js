const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileModal = document.getElementById("editProfileModal");
const closeEditProfile = document.getElementById("closeEditProfile");
const cancelEdit = document.getElementById("cancelEdit");

if (editProfileBtn && editProfileModal) {
  const openModal = () => {
    editProfileModal.classList.add("active");
    editProfileModal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    editProfileModal.classList.remove("active");
    editProfileModal.setAttribute("aria-hidden", "true");
  };

  editProfileBtn.addEventListener("click", openModal);
  closeEditProfile?.addEventListener("click", closeModal);
  cancelEdit?.addEventListener("click", closeModal);
  editProfileModal.addEventListener("click", (event) => {
    if (event.target === editProfileModal) {
      closeModal();
    }
  });
}

if (typeof lucide !== "undefined") {
  lucide.createIcons();
}