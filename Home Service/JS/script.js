// Get the navbar element
const navbar = document.querySelector('.navbar');

// Add an event listener to the window to listen for the scroll event
window.addEventListener('scroll', () => {
  // Check if the user has scrolled down
  if (window.scrollY > 50) {
    // Add scrolled class for better styling control
    navbar.classList.add('scrolled');
  } else {
    // Remove scrolled class when at top
    navbar.classList.remove('scrolled');
  }
});
