const closeButton = document.querySelector('.close-btn');

if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.location.href = 'Home.html';
  });
}