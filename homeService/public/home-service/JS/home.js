// Supabase configuration
const SUPABASE_URL = window.SUPABASE_URL || 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

document.addEventListener('DOMContentLoaded', async () => {
    await loadLatestServices();
    await loadPopularServices();
});

async function loadLatestServices() {
    const grid = document.getElementById('homeServicesGrid');
    if (!grid) return;

    console.log('Loading latest services...');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/services?select=*&is_active=eq.true&order=created_at.desc&limit=10`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch services (${response.status})`);
        }

        const data = await response.json();
        console.log('Data received:', data);

        if (!data || data.length === 0) {
            grid.innerHTML = '<p class="no-data">No services found in database.</p>';
            return;
        }

        grid.innerHTML = '';
        data.forEach(service => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="icon-chip"><i data-lucide="${getIconForService(service.category)}"></i></div>
                <h3>${service.service_name}</h3>
                <p>${service.category}</p>
            `;
            grid.appendChild(card);
        });

        if (window.lucide) window.lucide.createIcons();
    } catch (err) {
        console.error('Error loading services:', err);
        grid.innerHTML = `<p class="error">Error: ${err.message || 'Failed to load services'}</p>`;
    }
}

async function loadPopularServices() {
    const footerDiv = document.getElementById('popularServicesFooter');
    if (!footerDiv) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/services?select=service_name&is_active=eq.true&limit=20`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch popular services (${response.status})`);
        }

        const data = await response.json();
        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 6);
        
        // Keep the heading
        footerDiv.innerHTML = '<h6>Popular Services</h6>';
        shuffled.forEach(service => {
            const link = document.createElement('a');
            link.href = '../Html/Services.html';
            link.textContent = service.service_name;
            footerDiv.appendChild(link);
        });
    } catch (err) {
        console.error('Error loading popular services:', err);
    }
}

function getIconForService(category) {
    const cat = category.toLowerCase();
    if (cat.includes('cleaning')) return 'sparkles';
    if (cat.includes('plumbing')) return 'wrench';
    if (cat.includes('electrical')) return 'zap';
    if (cat.includes('painting') || cat.includes('renovation')) return 'paint-roller';
    if (cat.includes('appliance')) return 'settings';
    if (cat.includes('pest')) return 'bug';
    if (cat.includes('improvement') || cat.includes('handyman')) return 'hammer';
    if (cat.includes('garden')) return 'leaf';
    return 'check-circle';
}

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});