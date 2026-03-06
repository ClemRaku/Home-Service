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

// Booking modal logic (Services page)
const bookingModalOverlay = document.querySelector('#bookingModalOverlay');
const bookingModal = document.querySelector('#bookingModal');
const bookingCloseBtn = document.querySelector('#bookingCloseBtn');
const bookingCancelBtn = document.querySelector('#bookingCancelBtn');
const bookingServiceType = document.querySelector('#bookingServiceType');
const bookButtons = document.querySelectorAll('.book-btn');

if (bookingModalOverlay && bookingModal && bookButtons.length) {
  const openBookingModal = (serviceTypeText = '') => {
    bookingModalOverlay.classList.add('active');
    bookingModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    if (bookingServiceType && serviceTypeText) {
      const hasOption = Array.from(bookingServiceType.options).some(
        (option) => option.textContent.trim() === serviceTypeText
      );

      bookingServiceType.value = hasOption ? serviceTypeText : '';
    }
  };

  const closeBookingModal = () => {
    bookingModalOverlay.classList.remove('active');
    bookingModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  bookButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.card');
      const serviceTypeText = card?.querySelector('p')?.textContent.trim() || '';
      openBookingModal(serviceTypeText);
    });
  });

  bookingCloseBtn?.addEventListener('click', closeBookingModal);
  bookingCancelBtn?.addEventListener('click', closeBookingModal);

  bookingModalOverlay.addEventListener('click', (event) => {
    if (event.target === bookingModalOverlay) {
      closeBookingModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && bookingModalOverlay.classList.contains('active')) {
      closeBookingModal();
    }
  });
}
