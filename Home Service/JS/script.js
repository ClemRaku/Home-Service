// Get the navbar element
const navbar = document.querySelector('.navbar');

// Get the filter element
const filter = document.querySelector('.filters');

// Add an event listener to the window to listen for the scroll event
window.addEventListener('scroll', () => {
  // Check if the user has scrolled down
  if (window.scrollY > 0) {
    // Change the navbar background color to white
    navbar.style.backgroundColor = 'white';
  } else {
    // Revert the navbar background color to its original design
    navbar.style.backgroundColor = '';
  }
});