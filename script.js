let currentFormType = '';
let historyData = JSON.parse(localStorage.getItem('qr_history')) || [];
let videoStream = null;
let currentFacingMode = 'environment';
let flashOn = false;

// دالة الانتقال بين الصفحات الرئيسية
function switchTab(tabId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const targetSection = document.getElementById(tabId + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-target') === tabId) {
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

// ربط أزرار التنقل السفلية
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        if (target) {
            switchTab(target);
        }
    });
});

// ربط أزرار الواجهة الرئيسية (Accueil)
const gotoGenBtn = document.getElementById('goto-generator-btn');
if (gotoGenBtn) {
    gotoGenBtn.addEventListener('click', () => switchTab('generator'));
}

const gotoScanBtn = document.getElementById('goto-scanner-btn');
if (gotoScanBtn) {
    gotoScanBtn.addEventListener('click', () => switchTab('scanner'));
}

// دالة فتح نموذج النوع المختار
function openTypeForm(type) {
    currentFormType = type;
    const menuView = document.getElementById('types-menu-view');
    const formView = document.getElementById('dynamic-form-view');
    
    if (menuView) menuView.style.display = 'none';
    if (formView) formView.style.display = 'block';

    const titleText = document.getElementById('form-title-text');
    const titleIcon = document.getElementById('form-title-icon');
    const container = document.getElementById('form-inputs-container');
    
    if (container) container.innerHTML = '';
    const resultArea = document.getElementById('qr-result');
    if (resultArea) resultArea.innerHTML = '';

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

    if (container) container.innerHTML = html;
}

// ربط أزرار اختيار أنواع الـ QR
document.querySelectorAll('.type-item-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const type = this.getAttribute('data-type');
        if (type) {
            openTypeForm(type);
        }
    });
});

// العودة للقائمة في المولد
const backMenuBtn = document.getElementById('back-to-menu-btn');
if (backMenuBtn) {
    backMenuBtn.addEventListener('click', () => {
        const formView = document.getElementById('dynamic-form-view');
        const menuView = document.getElementById('types-menu-view');
        if (formView) formView.style.display = 'none';
        if (menuView) menuView.style.display = 'block';
        const resultArea = document.getElementById('qr-result');
        if (resultArea) resultArea.innerHTML = '';
    });
}

// توليد الـ QR Code
const generateCustomBtn = document.getElementById('generate-custom-btn');
if (generateCustomBtn) {
    generateCustomBtn.addEventListener('click', function() {
        let qrData = '';
        const sizeElem = document.getElementById('qr-size');
        const size = sizeElem ? sizeElem.value : 300;
        const resultContainer = document.getElementById('qr-result');

        if (currentFormType === 'clipboard' || currentFormType === 'text' || currentFormType === 'url') {
            const field = document.getElementById('input-field-1');
            qrData = field ? field.value.trim() : '';
        } else if (currentFormType === 'phone') {
            const phoneNum = document.getElementById('input-field-1');
            qrData = phoneNum && phoneNum.value.trim() ? `tel:${phoneNum.value.trim()}` : '';
        } else if (currentFormType === 'email') {
            const email = document.getElementById('input-field-1');
            const subject = document.getElementById('input-field-2');
            const body = document.getElementById('input-field-3');
            qrData = email && email.value.trim() ? `mailto:${email.value.trim()}?subject=${encodeURIComponent(subject ? subject.value : '')}&body=${encodeURIComponent(body ? body.value : '')}` : '';
        } else if (currentFormType === 'wifi') {
            const ssid = document.getElementById('input-field-1');
            const pass = document.getElementById('input-field-2');
            const sec = document.getElementById('input-field-3');
            qrData = `WIFI:S:${ssid ? ssid.value.trim() : ''};T:${sec ? sec.value : 'WPA'};P:${pass ? pass.value.trim() : ''};;`;
        } else if (currentFormType === 'contact') {
            const name = document.getElementById('input-field-1')?.value || '';
            const org = document.getElementById('input-field-2')?.value || '';
            const addr = document.getElementById('input-field-3')?.value || '';
            const tel = document.getElementById('input-field-4')?.value || '';
            const mail = document.getElementById('input-field-5')?.value || '';
            qrData = `MECARD:N:${name};ORG:${org};ADR:${addr};TEL:${tel};EMAIL:${mail};;`;
        } else if (currentFormType === 'sms') {
            const tel = document.getElementById('input-field-1')?.value || '';
            const msg = document.getElementById('input-field-2')?.value || '';
            qrData = `SMSTO:${tel}:${msg}`;
        } else if (currentFormType === 'coordinates') {
            const lat = document.getElementById('input-field-1')?.value || '';
            const lng = document.getElementById('input-field-2')?.value || '';
            qrData = `geo:${lat},${lng}`;
        } else if (currentFormType === 'agenda') {
            const title = document.getElementById('input-field-1')?.value || '';
            const loc = document.getElementById('input-field-2')?.value || '';
            const desc = document.getElementById('input-field-3')?.value || '';
            qrData = `BEGIN:VEVENT\nSUMMARY:${title}\nLOCATION:${loc}\nDESCRIPTION:${desc}\nEND:VEVENT`;
        } else {
            const field = document.getElementById('input-field-1');
            qrData = field && field.value.trim() ? field.value.trim() : 'QR Code';
        }

        if (!qrData) {
            alert('Veuillez remplir les informations requises !');
            return;
        }

        if (resultContainer) {
            resultContainer.innerHTML = '<p style="color: var(--accent-color);">Génération du QR Code...</p>';
        }
        
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}`;

        historyData.unshift({ text: qrData, url: apiUrl, date: new Date().toLocaleDateString() });
        localStorage.setItem('qr_history', JSON.stringify(historyData));

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = apiUrl;
        img.onload = function() {
            if (resultContainer) {
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
            }
        };
    });
}

// عرض السجل
function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
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

// إعدادات القائمة الجانبية (Drawer)
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const settingsDrawer = document.getElementById('settings-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

if (menuToggleBtn) menuToggleBtn.addEventListener('click', () => { settingsDrawer.classList.add('open'); drawerOverlay.classList.add('active'); });
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => { settingsDrawer.classList.remove('open'); drawerOverlay.classList.remove('active'); });
if (drawerOverlay) drawerOverlay.addEventListener('click', () => { settingsDrawer.classList.remove('open'); drawerOverlay.classList.remove('active'); });

// تبديل الثيم والألوان
const darkModeBtn = document.getElementById('dark-mode-btn');
const lightModeBtn = document.getElementById('light-mode-btn');

if (darkModeBtn) darkModeBtn.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeBtn.classList.add('active');
    if (lightModeBtn) lightModeBtn.classList.remove('active');
});

if (lightModeBtn) lightModeBtn.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    lightModeBtn.classList.add('active');
    if (darkModeBtn) darkModeBtn.classList.remove('active');
});

document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', function() {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        this.classList.add('active');
        const color = this.getAttribute('data-color');
        document.body.setAttribute('data-theme-color', color);
    });
});

// مشاركة التطبيق
const shareAppBtn = document.getElementById('share-app-btn');
if (shareAppBtn) {
    shareAppBtn.addEventListener('click', () => {
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
});

// الكاميرا والماسح الضوئي
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

const flashBtn = document.getElementById('flash-btn');
if (flashBtn) {
    flashBtn.addEventListener('click', async () => {
        if (!videoStream) return;
        const track = videoStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        
        if (capabilities.torch) {
            flashOn = !flashOn;
            try {
                await track.applyConstraints({ advanced: [{ torch: flashOn }] });
                flashBtn.classList.toggle('active-flash', flashOn);
            } catch (e) {
                console.log(e);
            }
        } else {
            alert("Le flash n'est pas disponible sur cet appareil.");
        }
    });
}

const flipCameraBtn = document.getElementById('flip-camera-btn');
if (flipCameraBtn) {
    flipCameraBtn.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        startCamera();
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
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const resultArea = document.getElementById('scanner-result');
            if (resultArea) {
                resultArea.innerHTML = `<p style="color: var(--accent-color);">Image importée avec succès !</p>`;
            }
        };
        reader.readAsDataURL(file);
    });
}