document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".message-input input");
  const sendButton = document.querySelector(".send-btn");
  const menuWrapper = document.querySelector(".menu-wrapper");
  const menuTrigger = document.querySelector(".menu-trigger");
  const menuPopup = document.querySelector(".menu-popup");
  const callTrigger = document.querySelector("#callTrigger");
  const videoTrigger = document.querySelector("#videoTrigger");
  const callOverlay = document.querySelector("#callOverlay");
  const videoOverlay = document.querySelector("#videoOverlay");
  const closeButtons = document.querySelectorAll("[data-close]");

  if (input && sendButton) {
    sendButton.addEventListener("click", () => {
      input.value = "";
      input.focus();
    });
  }

  if (menuWrapper && menuTrigger && menuPopup) {
    const closeMenu = () => {
      menuWrapper.classList.remove("open");
      menuTrigger.setAttribute("aria-expanded", "false");
      menuPopup.setAttribute("aria-hidden", "true");
    };

    menuTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = menuWrapper.classList.toggle("open");
      menuTrigger.setAttribute("aria-expanded", String(isOpen));
      menuPopup.setAttribute("aria-hidden", String(!isOpen));
    });

    document.addEventListener("click", closeMenu);
    menuPopup.addEventListener("click", (event) => event.stopPropagation());
  }

  const openOverlay = (overlay) => {
    if (!overlay) return;
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
  };

  const closeOverlay = (overlay) => {
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
  };

  if (callTrigger) {
    callTrigger.addEventListener("click", () => openOverlay(callOverlay));
  }

  if (videoTrigger) {
    videoTrigger.addEventListener("click", () => openOverlay(videoOverlay));
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-close");
      if (target === "call") {
        closeOverlay(callOverlay);
      }
      if (target === "video") {
        closeOverlay(videoOverlay);
      }
    });
  });

  if (callOverlay) {
    callOverlay.addEventListener("click", (event) => {
      if (event.target === callOverlay) {
        closeOverlay(callOverlay);
      }
    });
  }

  if (videoOverlay) {
    videoOverlay.addEventListener("click", (event) => {
      if (event.target === videoOverlay) {
        closeOverlay(videoOverlay);
      }
    });
  }
});