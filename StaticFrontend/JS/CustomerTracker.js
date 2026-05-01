const modal = document.getElementById("locationModal");
const modalCloseBtn = modal?.querySelector(".location-modal__close");
const modalTitle = document.getElementById("locationModalTitle");
const modalStatus = document.getElementById("locationModalStatus");
const modalEta = document.getElementById("locationModalEta");
const modalAddress = document.getElementById("locationModalAddress");
const modalDistance = document.getElementById("locationModalDistance");
const modalMap = document.getElementById("locationModalMap");
const modalMapLink = document.getElementById("locationModalMapLink");
const modalAvatar = document.getElementById("locationModalAvatar");
const callModal = document.getElementById("callModal");
const callModalName = document.getElementById("callModalName");
const callModalRole = document.getElementById("callModalRole");
const callModalStatus = document.getElementById("callModalStatus");
const callModalAvatarImg = document.getElementById("callModalAvatarImg");
const callModalEnd = callModal?.querySelector(".call-modal__end");
const ratingModal = document.getElementById("ratingModal");
const ratingModalName = document.getElementById("ratingModalName");
const ratingModalRole = document.getElementById("ratingModalRole");
const ratingModalQuestion = document.getElementById("ratingModalQuestion");
const ratingModalAvatarImg = document.getElementById("ratingModalAvatarImg");
const ratingStars = ratingModal?.querySelectorAll(".rating-star") || [];
const ratingSubmit = ratingModal?.querySelector(".rating-modal__submit");
const ratingCancel = ratingModal?.querySelector(".rating-modal__cancel");
const ratingComment = ratingModal?.querySelector(".rating-modal__comment");

const updateModalContent = (button) => {
    if (!button) return;
    const name = button.dataset.name || "";
    const status = button.dataset.status || "";
    const statusClass = button.dataset.statusClass || "";
    const eta = button.dataset.eta || "";
    const distance = button.dataset.distance || "";
    const location = button.dataset.location || "";
    const mapSrc = button.dataset.map || "";
    const mapLink = button.dataset.mapLink || "";

    if (modalTitle) modalTitle.textContent = name;
    if (modalStatus) {
        modalStatus.textContent = status;
        modalStatus.className = `status location-modal__status-pill ${statusClass}`;
    }
    if (modalEta) modalEta.innerHTML = `<i class="bi bi-clock"></i> ${eta}`;
    if (modalAddress) modalAddress.innerHTML = `<i class="bi bi-geo-alt"></i> ${location}`;
    if (modalDistance) modalDistance.textContent = distance;
    if (modalMap) modalMap.setAttribute("src", mapSrc);
    if (modalMapLink) modalMapLink.setAttribute("href", mapLink);
    if (modalAvatar) {
        const initials = name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
        modalAvatar.textContent = initials || "HS";
    }
};

const openModal = () => {
    if (modal) {
        modal.classList.add("is-visible");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
};

const closeModal = () => {
    if (modal) {
        modal.classList.remove("is-visible");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
};

document.querySelectorAll(".location-btn").forEach((button) => {
    button.addEventListener("click", () => {
        updateModalContent(button);
        openModal();
    });
});

const updateCallModal = (button) => {
    if (!button) return;
    if (callModalName) callModalName.textContent = button.dataset.name || "";
    if (callModalRole) callModalRole.textContent = button.dataset.role || "";
    if (callModalStatus) callModalStatus.textContent = button.dataset.status || "Connected";
    if (callModalAvatarImg) {
        callModalAvatarImg.src = button.dataset.avatar || "https://i.pravatar.cc/120?img=12";
    }
};

const openCallModal = () => {
    if (callModal) {
        callModal.classList.add("is-visible");
        callModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
};

const closeCallModal = () => {
    if (callModal) {
        callModal.classList.remove("is-visible");
        callModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
};

const resetRatingModal = () => {
    ratingStars.forEach((star) => star.classList.remove("is-active", "is-hover"));
    if (ratingSubmit) {
        ratingSubmit.classList.remove("is-enabled");
        ratingSubmit.style.pointerEvents = "none";
    }
    if (ratingComment) ratingComment.value = "";
};

const openRatingModal = () => {
    if (ratingModal) {
        ratingModal.classList.add("is-visible");
        ratingModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }
};

const closeRatingModal = () => {
    if (ratingModal) {
        ratingModal.classList.remove("is-visible");
        ratingModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        resetRatingModal();
    }
};

const updateRatingModal = (button) => {
    if (!button) return;
    const name = button.dataset.name || "";
    const role = button.dataset.role || "";
    const avatar = button.dataset.avatar || "https://i.pravatar.cc/120?img=28";
    if (ratingModalName) ratingModalName.textContent = name;
    if (ratingModalRole) ratingModalRole.textContent = role;
    if (ratingModalAvatarImg) ratingModalAvatarImg.src = avatar;
    if (ratingModalQuestion) {
        ratingModalQuestion.textContent = `How was your experience with ${name}?`;
    }
};

document.querySelectorAll(".call-btn").forEach((button) => {
    button.addEventListener("click", () => {
        updateCallModal(button);
        openCallModal();
    });
});

callModalEnd?.addEventListener("click", closeCallModal);

callModal?.addEventListener("click", (event) => {
    if (event.target === callModal) {
        closeCallModal();
    }
});

document.querySelectorAll(".rate-btn").forEach((button) => {
    button.addEventListener("click", () => {
        updateRatingModal(button);
        openRatingModal();
    });
});

ratingStars.forEach((star) => {
    star.addEventListener("click", () => {
        const value = Number(star.dataset.value || 0);
        ratingStars.forEach((item) => {
            const itemValue = Number(item.dataset.value || 0);
            item.classList.toggle("is-active", itemValue <= value);
        });
        if (ratingSubmit) {
            ratingSubmit.classList.add("is-enabled");
            ratingSubmit.style.pointerEvents = "auto";
        }
    });

    star.addEventListener("mouseenter", () => {
        const value = Number(star.dataset.value || 0);
        ratingStars.forEach((item) => {
            const itemValue = Number(item.dataset.value || 0);
            item.classList.toggle("is-hover", itemValue <= value);
        });
    });

    star.addEventListener("mouseleave", () => {
        ratingStars.forEach((item) => item.classList.remove("is-hover"));
    });
});

ratingCancel?.addEventListener("click", closeRatingModal);
ratingSubmit?.addEventListener("click", (event) => {
    if (!ratingSubmit?.classList.contains("is-enabled")) {
        event.preventDefault();
        return;
    }
    closeRatingModal();
});

ratingModal?.addEventListener("click", (event) => {
    if (event.target === ratingModal) {
        closeRatingModal();
    }
});

modalCloseBtn?.addEventListener("click", closeModal);

modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
        closeCallModal();
        closeRatingModal();
    }
});