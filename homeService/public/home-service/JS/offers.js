const nav = document.querySelector('.navbar');
const filterButtons = document.querySelectorAll('.filter-pill');
const offerCards = document.querySelectorAll('.offer-card');

const setActiveFilter = (targetButton) => {
  filterButtons.forEach((button) => button.classList.remove('active'));
  targetButton.classList.add('active');
};

const filterOffers = (category) => {
  offerCards.forEach((card) => {
    const matches = category === 'all' || card.dataset.category === category;
    card.classList.toggle('hidden', !matches);
  });
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const { filter } = button.dataset;
    setActiveFilter(button);
    filterOffers(filter);
  });
});

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});