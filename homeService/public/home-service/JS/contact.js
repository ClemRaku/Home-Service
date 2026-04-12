const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const navbar = document.querySelector('.navbar');
const messageField = document.querySelector('.contact-form textarea');
const charCount = document.querySelector('.char-count');
const contactForm = document.querySelector('.contact-form');

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

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = contactForm.querySelector('input[type="text"]').value.trim();
    const email = contactForm.querySelector('input[type="email"]').value.trim();
    const phone = contactForm.querySelector('input[type="tel"]').value.trim();
    const serviceInterested = contactForm.querySelector('select').value;
    const message = contactForm.querySelector('textarea').value.trim();

    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify([{
          full_name: fullName,
          email: email,
          phone_number: phone,
          service_interest: serviceInterested,
          message: message,
        }]),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      alert('Your message has been sent successfully! We will get back to you soon.');
      contactForm.reset();
      if (charCount) {
        charCount.textContent = '0/500 characters';
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}