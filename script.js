// دالة الانتقال بين الأقسام والشاشات
function switchTab(tabId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    const targetSection = document.getElementById(tabId + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    navItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(tabId)) {
            item.classList.add('active');
        }
    });

    if (tabId !== 'scanner') {
        stopCamera();
    } else {
        startCamera();
    }
}

// برمجة القائمة الجانبية (Drawer & Settings)
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const settingsDrawer = document.getElementById('settings-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

function openDrawer() {
    settingsDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
}

function closeDrawer() {
    settingsDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
}

if (menuToggleBtn) menuToggleBtn.addEventListener('click', openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

// تغيير لون التطبيق عبر الأزرار الدائرية في الإعدادات
const colorDots = document.querySelectorAll('.color-dot');
colorDots.forEach(dot => {
    dot.addEventListener('click', function() {
        const colorName = this.getAttribute('data-color');
        document.body.setAttribute('data-theme-color', colorName);
        
        let hexColor = '#4f46e5';
        if (colorName === 'red') hexColor = '#dc2626';
        else if (colorName === 'orange') hexColor = '#ea580c';
        else if (colorName === 'yellow') hexColor = '#ca8a04';
        else if (colorName === 'green') hexColor = '#16a34a';
        else if (colorName === 'emerald') hexColor = '#0d9488';
        else if (colorName === 'purple') hexColor = '#9333ea';
        else if (colorName === 'pink') hexColor = '#db2777';

        document.documentElement.style.setProperty('--primary-color', hexColor);
        document.documentElement.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${hexColor}, #333333)`);
        
        localStorage.setItem('app_theme_color', colorName);
        localStorage.setItem('app_primary_hex', hexColor);
        closeDrawer();
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('app_theme_color');
    const savedHex = localStorage.getItem('app_primary_hex');
    if (savedTheme && savedHex) {
        document.body.setAttribute('data-theme-color', savedTheme);
        document.documentElement.style.setProperty('--primary-color', savedHex);
    }
    loadHistory();
});

// زر المشاركة في الهيدر
const shareAppBtn = document.getElementById('share-app-btn');
if (shareAppBtn) {
    shareAppBtn.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'QR Master Pro',
                    text: 'Découvrez cette application puissante pour générer et scanner des QR codes !',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Partage annulé');
            }
        } else {
            alert('Le partage n\'est pas supporté sur ce navigateur.');
        }
    });
}

// توليد وحفظ الـ QR Code
const generateBtn = document.getElementById('generate-btn');
if (generateBtn) {
    generateBtn.addEventListener('click', function() {
        const inputVal = document.getElementById('qr-input').value.trim();
        const qrSize = document.getElementById('qr-size').value;
        const resultContainer = document.getElementById('qr-result');

        if (!inputVal) {
            alert('Veuillez entrer un lien ou un texte valide !');
            return;
        }

        resultContainer.innerHTML = '';
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(inputVal)}`;

        const qrImage = document.createElement('img');
        qrImage.src = qrApiUrl;
        qrImage.alt = 'Generated QR Code';
        qrImage.style.borderRadius = '12px';
        qrImage.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';

        resultContainer.appendChild(qrImage);
        saveToHistory(inputVal, qrApiUrl);
    });
}

// إدارة السجل (History)
function saveToHistory(text, url) {
    let history = JSON.parse(localStorage.getItem('qr_history')) || [];
    history.unshift({ text: text, url: url, date: new Date().toLocaleDateString() });
    if (history.length > 10) history.pop();
    localStorage.setItem('qr_history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    let history = JSON.parse(localStorage.getItem('qr_history')) || [];

    if (history.length === 0) {
        historyList.innerHTML = `<p class="empty-text">Aucun historique pour le moment.</p>`;
        return;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.style.cssText = "display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 10px 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0;";
        
        historyItem.innerHTML = `
            <div style="text-align: left; overflow: hidden; max-width: 70%;">
                <p style="font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.text}</p>
                <span style="font-size: 10px; color: #64748b;">${item.date}</span>
            </div>
            <img src="${item.url}" alt="QR" style="width: 40px; height: 40px; border-radius: 6px;">
        `;
        historyList.appendChild(historyItem);
    });
}

// التحكم في الكاميرا والماسح الضوئي (Scanner)
let videoStream = null;
let currentFacingMode = 'environment';
const scannerVideo = document.getElementById('scanner-video');

async function startCamera() {
    if (!scannerVideo) return;
    try {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode }
        });
        scannerVideo.srcObject = videoStream;
    } catch (err) {
        console.log('Erreur d\'accès à la caméra:', err);
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

const flipCameraBtn = document.getElementById('flip-camera-btn');
if (flipCameraBtn) {
    flipCameraBtn.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        startCamera();
    });
}

let torchOn = false;
const flashBtn = document.getElementById('flash-btn');
if (flashBtn) {
    flashBtn.addEventListener('click', async () => {
        if (!videoStream) return;
        const track = videoStream.getVideoTracks()[0];
        try {
            torchOn = !torchOn;
            await track.applyConstraints({
                advanced: [{ torch: torchOn }]
            });
            flashBtn.style.background = torchOn ? 'var(--primary-color)' : '#f1f5f9';
            flashBtn.style.color = torchOn ? '#fff' : '#334155';
        } catch (err) {
            alert('Le flash n\'est pas supporté sur cet appareil.');
        }
    });
}

const galleryBtn = document.getElementById('gallery-btn');
const galleryFileInput = document.getElementById('gallery-file-input');
if (galleryBtn && galleryFileInput) {
    galleryBtn.addEventListener('click', () => {
        galleryFileInput.click();
    });

    galleryFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const scannerResult = document.getElementById('scanner-result');
                scannerResult.innerHTML = `
                    <div style="text-align:center;">
                        <p style="font-size:13px; color:#16a34a; font-weight:600; margin-bottom:8px;">Image chargée avec succès !</p>
                        <img src="${event.target.result}" alt="Uploaded QR" style="max-width:150px; border-radius:8px;">
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    });
}