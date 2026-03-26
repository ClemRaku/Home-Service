const navbar = document.querySelector('.navbar');
const messageField = document.querySelector('.contact-form textarea');
const charCount = document.querySelector('.char-count');

if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

if (messageField && charCount) {
  const updateCount = () => {
    charCount.textContent = `${messageField.value.length}/500 characters`;
  };

  messageField.addEventListener('input', updateCount);
  updateCount();
}