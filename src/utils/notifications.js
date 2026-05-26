export function showNotification(message, type = 'info') {
    let container = document.getElementById('custom-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'custom-toast-container';
        container.className = 'custom-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'error')   icon = '⚠️';
    if (type === 'success') icon = '✅';

    toast.innerHTML = `
        <div class="custom-toast-icon">${icon}</div>
        <div class="custom-toast-message">${message}</div>
        <button class="custom-toast-close">✖</button>
    `;

    container.appendChild(toast);

    const removeToast = () => {
        if (toast.classList.contains('hiding')) return;
        toast.classList.add('hiding');
        setTimeout(() => { if (toast.parentElement) toast.parentElement.removeChild(toast); }, 300);
    };

    toast.querySelector('.custom-toast-close').addEventListener('click', removeToast);
    setTimeout(removeToast, 5000);
}

// Disponible globalmente para los onclick generados dinámicamente en el tutorial
window.showNotification = showNotification;
