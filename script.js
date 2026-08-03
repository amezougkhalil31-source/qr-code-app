const qrText = document.getElementById('qr-text');
const qrSize = document.getElementById('qr-size');
const generateBtn = document.getElementById('generate-btn');
const resultCard = document.getElementById('result-card');
const qrCodeContainer = document.getElementById('qr-code');
const downloadBtn = document.getElementById('download-btn');
const clearInputBtn = document.getElementById('clear-input-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const toastNotification = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');
const htmlElement = document.documentElement;

let qrCodeInstance = null;

// Function to show live toast notifications
function showToast(message) {
    toastMessage.textContent = message;
    toastNotification.classList.remove('hidden');
    setTimeout(() => {
        toastNotification.classList.add('show');
    }, 10);

    setTimeout(() => {
        toastNotification.classList.remove('show');
        setTimeout(() => {
            toastNotification.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Theme Switcher Logic
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    
    const icon = themeToggleBtn.querySelector('i');
    if (newTheme === 'light') {
        icon.className = 'fa-solid fa-sun';
        showToast('Switched to Light Mode');
    } else {
        icon.className = 'fa-solid fa-moon';
        showToast('Switched to Dark Mode');
    }
});

// Clear Input Text
clearInputBtn.addEventListener('click', () => {
    qrText.value = '';
    qrText.focus();
});

// Generate QR Code Logic
generateBtn.addEventListener('click', () => {
    const text = qrText.value.trim();
    if (!text) {
        showToast('Please enter a valid text or URL!');
        return;
    }

    const size = parseInt(qrSize.value);

    // Clear previous QR if exists
    qrCodeContainer.innerHTML = '';

    // Create new QR Code instance
    qrCodeInstance = new QRCode(qrCodeContainer, {
        text: text,
        width: size,
        height: size,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Show result card smoothly
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('QR Code generated successfully!');
});

// Download QR Code Image Logic
downloadBtn.addEventListener('click', () => {
    const img = qrCodeContainer.querySelector('img');
    if (img) {
        const imageUrl = img.src;
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = 'qrcode-master-pro.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        showToast('QR Code downloaded successfully!');
    } else {
        showToast('No QR code found to download.');
    }
});