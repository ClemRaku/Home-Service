document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('type') || 'the requested page';
    
    const targetMap = {
        'privacy': 'Privacy Policy',
        'terms': 'Terms of Service',
        'powered': 'Powered by Ready Info'
    };

    const targetElement = document.getElementById('targetName');
    if (targetElement) {
        targetElement.textContent = targetMap[target] || target;
    }
});
