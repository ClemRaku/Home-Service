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
});