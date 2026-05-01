document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const featureName = document.getElementById('featureName');

    const typeMap = {
        'privacy': 'Privacy Policy',
        'terms': 'Terms of Service',
        'powered': 'Ready Powered Info',
        'about': 'About Us detail'
    };

    if (type && typeMap[type]) {
        featureName.textContent = typeMap[type];
    } else if (type) {
        featureName.textContent = type.replace(/-/g, ' ');
    }
});