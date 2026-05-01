// Supabase configuration
const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

document.addEventListener('DOMContentLoaded', async () => {
    // Load content
    await Promise.all([
        loadLatestServices(),
        loadPopularServices()
    ]);
});

function showError(message) {
    const grid = document.getElementById('homeServicesGrid');
    if (grid) {
        grid.innerHTML = `<p class="error">${message}</p>`;
    }
}

async function loadLatestServices() {
    const grid = document.getElementById('homeServicesGrid');
    if (!grid) return;

    try {
        console.log('Fetching latest services...');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/services?select=service_name,category,created_at&is_active=eq.true&order=created_at.desc&limit=8`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            grid.innerHTML = '<p class="services-status">No services currently available.</p>';
            return;
        }

        grid.innerHTML = '';
        data.forEach(service => {
            const card = document.createElement('article');
            card.className = 'card';
            
            // Map table fields to UI
            const name = service.service_name || 'Home Service';
            const description = service.category || 'Professional maintenance service';
            const icon = getIconForService(service.category || '');

            card.innerHTML = `
                <div class="icon-chip"><i data-lucide="${icon}"></i></div>
                <h3>${name}</h3>
                <p>${description}</p>
            `;
            grid.appendChild(card);
        });

        // Initialize Lucide icons for the new elements
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    } catch (err) {
        console.error('Error loading latest services:', err);
        grid.innerHTML = '<p class="error">Failed to load services. Please try again later.</p>';
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) return;

        // Simple shuffle for variety
        const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 6);
        
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
    const cat = (category || '').toLowerCase();
    if (cat.includes('cleaning')) return 'sparkles';
    if (cat.includes('plumbing')) return 'wrench';
    if (cat.includes('electrical')) return 'zap';
    if (cat.includes('painting') || cat.includes('renovation')) return 'paint-roller';
    if (cat.includes('appliance')) return 'settings';
    if (cat.includes('pest')) return 'bug';
    if (cat.includes('improvement') || cat.includes('handyman')) return 'hammer';
    if (cat.includes('garden')) return 'leaf';
    if (cat.includes('moving') || cat.includes('logistics')) return 'truck';
    if (cat.includes('security')) return 'shield';
    if (cat.includes('health')) return 'heart-pulse';
    return 'check-circle';
}
