let currentFormType = '';
let historyData = JSON.parse(localStorage.getItem('qr_history')) || [];

function switchTab(tabId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const targetSection = document.getElementById(tabId + '-section');
    if (targetSection) targetSection.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick'].includes(tabId)) {
            item.classList.add('active');
        }
    });

    if (tabId === 'scanner') {
        startCamera();
    } else {
        stopCamera();
    }

    if (tabId === 'history') {
        renderHistory();
    }
}

function openTypeForm(type) {
    currentFormType = type;
    document.getElementById('types-menu-view').style.display = 'none';
    const formView = document.getElementById('dynamic-form-view');
    formView.style.display = 'block';

    const titleText = document.getElementById('form-title-text');
    const titleIcon = document.getElementById('form-title-icon');
    const container = document.getElementById('form-inputs-container');
    
    container.innerHTML = '';
    document.getElementById('qr-result').innerHTML = '';

    let html = '';

    switch (type) {
        case 'clipboard':
            titleText.innerText = 'Contenu du presse-papiers';
            titleIcon.className = 'fa-solid fa-clipboard';
            html = `<div class="input-group"><label>Texte récupéré</label><textarea id="input-field-1" placeholder="Collez le texte ici..."></textarea></div>`;
            break;
        case 'url':
            titleText.innerText = 'URL';
            titleIcon.className = 'fa-solid fa-link';
            html = `<div class="input-group"><label>Lien Web (URL)</label><input type="url" id="input-field-1" value="http://" placeholder="http://"></div>`;
            break;
        case 'text':
            titleText.innerText = 'Texte en clair';
            titleIcon.className = 'fa-solid fa-font';
            html = `<div class="input-group"><label>Texte en clair trouvé</label><textarea id="input-field-1" placeholder="Entrez votre texte ici..."></textarea></div>`;
            break;
        case 'contact':
            titleText.innerText = 'Contact';
            titleIcon.className = 'fa-solid fa-user';
            html = `
                <div class="input-group"><label>Nom complet</label><input type="text" id="input-field-1" placeholder="Nom complet"></div>
                <div class="input-group"><label>Organisation</label><input type="text" id="input-field-2" placeholder="Nom de l'entreprise"></div>
                <div class="input-group"><label>Adresse</label><input type="text" id="input-field-3" placeholder="Adresse physique"></div>
                <div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="input-field-4" placeholder="Numéro de téléphone"></div>
                <div class="input-group"><label>Adresse courriel</label><input type="email" id="input-field-5" placeholder="Adresse courriel"></div>
                <div class="input-group"><label>Remarques</label><textarea id="input-field-6" placeholder="Remarques..."></textarea></div>
            `;
            break;
        case 'email':
            titleText.innerText = 'Adresse courriel';
            titleIcon.className = 'fa-solid fa-envelope';
            html = `
                <div class="input-group"><label>Adresse courriel</label><input type="email" id="input-field-1" placeholder="Adresse courriel"></div>
                <div class="input-group"><label>Sujet</label><input type="text" id="input-field-2" placeholder="Sujet"></div>
                <div class="input-group"><label>Corps</label><textarea id="input-field-3" placeholder="Corps du message..."></textarea></div>
            `;
            break;
        case 'sms':
            titleText.innerText = 'Adresse SMS';
            titleIcon.className = 'fa-solid fa-comment-sms';
            html = `
                <div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="input-field-1" placeholder="Numéro de téléphone"></div>
                <div class="input-group"><label>Message</label><textarea id="input-field-2" placeholder="Message..."></textarea></div>
            `;
            break;
        case 'coordinates':
            titleText.innerText = 'Coordonnées géographiques';
            titleIcon.className = 'fa-solid fa-location-dot';
            html = `
                <div class="input-group"><label>Latitude</label><input type="text" id="input-field-1" placeholder="Latitude"></div>
                <div class="input-group"><label>Longitude</label><input type="text" id="input-field-2" placeholder="Longitude"></div>
            `;
            break;
        case 'phone':
            titleText.innerText = 'Numéro de téléphone';
            titleIcon.className = 'fa-solid fa-phone';
            html = `<div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="input-field-1" placeholder="Numéro de téléphone"></div>`;
            break;
        case 'agenda':
            titleText.innerText = 'Agenda';
            titleIcon.className = 'fa-solid fa-calendar-days';
            html = `
                <div class="input-group"><label>Titre de l'événement</label><input type="text" id="input-field-1" placeholder="Titre"></div>
                <div class="input-group"><label>Lieu</label><input type="text" id="input-field-2" placeholder="Lieu"></div>
                <div class="input-group"><label>Description</label><textarea id="input-field-3" placeholder="Description"></textarea></div>
            `;
            break;
        case 'wifi':
            titleText.innerText = 'Wi-Fi';
            titleIcon.className = 'fa-solid fa-wifi';
            html = `
                <div class="input-group"><label>Nom du réseau (SSID)</label><input type="text" id="input-field-1" placeholder="Nom du Wi-Fi"></div>
                <div class="input-group"><label>Mot de passe</label><input type="text" id="input-field-2" placeholder="Mot de passe"></div>
                <div class="input-group"><label>Type de sécurité</label><select id="input-field-3"><option value="WPA">WPA / WPA2</option><option value="WEP">WEP</option><option value="nopass">Aucun</option></select></div>
            `;
            break;
    }

    container.innerHTML = html;
}

function backToTypesMenu() {
    document.getElementById('dynamic-form-view').style.display = 'none';
    document.getElementById('types-menu-view').style.display = 'block';
    document.getElementById('qr-result').innerHTML = '';
}

document.getElementById('generate-custom-btn').addEventListener('click', function() {
    let qrData = '';
    const size = document.getElementById('qr-size').value;
    const resultContainer = document.getElementById('qr-result');

    if (currentFormType === 'clipboard' || currentFormType === 'text' || currentFormType === 'url') {
        qrData = document.getElementById('input-field-1').value.trim();
    } else if (currentFormType === 'phone') {
        const phoneNum = document.getElementById('input-field-1').value.trim();
        qrData = phoneNum ? `tel:${phoneNum}` : '';
    } else if (currentFormType === 'email') {
        const email = document.getElementById('input-field-1').value.trim();
        const subject = document.getElementById('input-field-2').value.trim();
        const body = document.getElementById('input-field-3').value.trim();
        qrData = email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : '';
    } else if (currentFormType === 'wifi') {
        const ssid = document.getElementById('input-field-1').value.trim();
        const pass = document.getElementById('input-field-2').value.trim();
        const sec = document.getElementById('input-field-3').value;
        qrData = `WIFI:S:${ssid};T:${sec};P:${pass};;`;
    } else {
        qrData = document.getElementById('input-field-1') ? document.getElementById('input-field-1').value.trim() : 'QR Code';
    }

    if (!qrData) {
        alert('Veuillez remplir les informations requises !');
        return;
    }

    resultContainer.innerHTML = '<p style="color: var(--accent-color);">Génération du QR Code...</p>';
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}`;

    // إضافة الكود إلى السجل وحفظه نهائياً
    historyData.unshift({ text: qrData, url: apiUrl, date: new Date().toLocaleDateString() });
    localStorage.setItem('qr_history', JSON.stringify(historyData));

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = apiUrl;
    img.onload = function() {
        resultContainer.innerHTML = '';
        resultContainer.appendChild(img);
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Télécharger le QR Code';
        
        downloadBtn.onclick = async function() {
            try {
                const response = await fetch(apiUrl);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = 'qrcode.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
            } catch (err) {
                const a = document.createElement('a');
                a.href = apiUrl;
                a.target = '_blank';
                a.download = 'qrcode.png';
                a.click();
            }
        };
        resultContainer.appendChild(downloadBtn);
    };
});

// عرض السجل
function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (historyData.length === 0) {
        historyList.innerHTML = `<p class="empty-msg">Aucun élément enregistré dans l'historique.</p>`;
        return;
    }

    let html = '';
    historyData.forEach((item) => {
        html += `
            <div class="history-item">
                <span><i class="fa-solid fa-qrcode" style="color: var(--accent-color); margin-right: 8px;"></i> ${item.text}</span>
                <a href="${item.url}" target="_blank" download="qrcode.png" class="download-btn" style="padding: 6px 12px; font-size: 12px;"><i class="fa-solid fa-download"></i></a>
            </div>
        `;
    });
    historyList.innerHTML = html;
}

// إعدادات القائمة الجانبية
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const settingsDrawer = document.getElementById('settings-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

menuToggleBtn.addEventListener('click', () => { settingsDrawer.classList.add('open'); drawerOverlay.classList.add('active'); });
closeDrawerBtn.addEventListener('click', () => { settingsDrawer.classList.remove('open'); drawerOverlay.classList.remove('active'); });
drawerOverlay.addEventListener('click', () => { settingsDrawer.classList.remove('open'); drawerOverlay.classList.remove('active'); });

// تيم التطبيق (Dark / Light)
const darkModeBtn = document.getElementById('dark-mode-btn');
const lightModeBtn = document.getElementById('light-mode-btn');

darkModeBtn.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeBtn.classList.add('active');
    lightModeBtn.classList.remove('active');
});

lightModeBtn.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    lightModeBtn.classList.add('active');
    darkModeBtn.classList.remove('active');
});

// ألوان التطبيق
document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', function() {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        this.classList.add('active');
        const color = this.getAttribute('data-color');
        document.body.setAttribute('data-theme-color', color);
    });
});

// زر المشاركة الشامل عبر السوشيال ميديا
document.getElementById('share-app-btn').addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'QR Master Pro',
            text: 'Découvrez cette application incroyable pour générer et scanner des QR codes !',
            url: window.location.href
        }).catch(() => {});
    } else {
        alert("Le partage n'est pas supporté sur ce navigateur.");
    }
});

// الكاميرا، الفلاش، قلب الكاميرا، والمعرض
let videoStream = null;
let currentFacingMode = 'environment';
let flashOn = false;

async function startCamera() {
    const video = document.getElementById('scanner-video');
    if (!video) return;

    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: currentFacingMode } 
        });
        video.srcObject = videoStream;
    } catch (e) {
        console.log("Erreur d'accès à la caméra:", e);
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// زر الفلاش
document.getElementById('flash-btn').addEventListener('click', async () => {
    if (!videoStream) return;
    const track = videoStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    
    if (capabilities.torch) {
        flashOn = !flashOn;
        try {
            await track.applyConstraints({ advanced: [{ torch: flashOn }] });
            document.getElementById('flash-btn').classList.toggle('active-flash', flashOn);
        } catch (e) {
            console.log(e);
        }
    } else {
        alert("Le flash n'est pas disponible sur cet appareil.");
    }
});

// زر قلب الكاميرا (Avant / Arrière)
document.getElementById('flip-camera-btn').addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    startCamera();
});

// زر استيراد صورة من المعرض
const galleryBtn = document.getElementById('gallery-btn');
const galleryFileInput = document.getElementById('gallery-file-input');

galleryBtn.addEventListener('click', () => {
    galleryFileInput.click();
});

galleryFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const resultArea = document.getElementById('scanner-result');
        resultArea.innerHTML = `<p style="color: var(--accent-color);">Image importée avec succès !</p>`;
    };
    reader.readAsDataURL(file);
});