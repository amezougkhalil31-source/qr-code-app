let currentFormType = '';
let historyData = JSON.parse(localStorage.getItem('qr_history')) || [];
let videoStream = null;
let currentFacingMode = 'environment';
let flashOn = false;

// دالة الانتقال بين الصفحات الأساسية
function switchTab(tabId) {
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.remove('active');
    });

    const targetSection = document.getElementById(tabId + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
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

// تشغيل الأكواد فور تحميل الصفحة لمنع أي تجميد
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. ربط أزرار الشريط السفلي بالكامل
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            if (target) {
                switchTab(target);
            }
        });
    });

    // 2. ربط أزرار واجهة الاستقبال الرئيسية
    const gotoGen = document.getElementById('goto-generator-btn');
    if (gotoGen) {
        gotoGen.addEventListener('click', () => switchTab('generator'));
    }

    const gotoScan = document.getElementById('goto-scanner-btn');
    if (gotoScan) {
        gotoScan.addEventListener('click', () => switchTab('scanner'));
    }

    // 3. ربط قائمة أنواع الـ QR
    document.querySelectorAll('.type-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            if (type) {
                openTypeForm(type);
            }
        });
    });

    // 4. زر العودة من النموذج
    const backBtn = document.getElementById('back-to-menu-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const formView = document.getElementById('dynamic-form-view');
            const menuView = document.getElementById('types-menu-view');
            if (formView) formView.style.display = 'none';
            if (menuView) menuView.style.display = 'block';
            const res = document.getElementById('qr-result');
            if (res) res.innerHTML = '';
        });
    }

    // 5. زر توليد الرمز
    const genBtn = document.getElementById('generate-custom-btn');
    if (genBtn) {
        genBtn.addEventListener('click', function() {
            let qrData = '';
            const sizeElem = document.getElementById('qr-size');
            const size = sizeElem ? sizeElem.value : 300;
            const resultContainer = document.getElementById('qr-result');

            if (['clipboard', 'text', 'url'].includes(currentFormType)) {
                const field = document.getElementById('input-field-1');
                qrData = field ? field.value.trim() : '';
            } else if (currentFormType === 'phone') {
                const phone = document.getElementById('input-field-1');
                qrData = phone && phone.value.trim() ? `tel:${phone.value.trim()}` : '';
            } else if (currentFormType === 'email') {
                const email = document.getElementById('input-field-1');
                const sub = document.getElementById('input-field-2');
                const body = document.getElementById('input-field-3');
                qrData = email && email.value.trim() ? `mailto:${email.value.trim()}?subject=${encodeURIComponent(sub ? sub.value : '')}&body=${encodeURIComponent(body ? body.value : '')}` : '';
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
                resultContainer.innerHTML = '<p style="color: var(--accent-color);">Génération en cours...</p>';
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
                    downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Télécharger';
                    downloadBtn.onclick = function() {
                        const a = document.createElement('a');
                        a.href = apiUrl;
                        a.target = '_blank';
                        a.download = 'qrcode.png';
                        a.click();
                    };
                    resultContainer.appendChild(downloadBtn);
                }
            };
        });
    }

    // 6. القائمة الجانبية والإعدادات
    const menuToggle = document.getElementById('menu-toggle-btn');
    const drawer = document.getElementById('settings-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const closeDrawer = document.getElementById('close-drawer-btn');

    if (menuToggle && drawer && overlay) {
        menuToggle.addEventListener('click', () => {
            drawer.classList.add('open');
            overlay.classList.add('active');
        });
    }
    if (closeDrawer && drawer && overlay) {
        closeDrawer.addEventListener('click', () => {
            drawer.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
    if (overlay && drawer) {
        overlay.addEventListener('click', () => {
            drawer.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // 7. الثيم والألوان
    const darkBtn = document.getElementById('dark-mode-btn');
    const lightBtn = document.getElementById('light-mode-btn');

    if (darkBtn) {
        darkBtn.addEventListener('click', () => {
            document.documentElement.setAttribute('data-theme', 'dark');
            darkBtn.classList.add('active');
            if (lightBtn) lightBtn.classList.remove('active');
        });
    }
    if (lightBtn) {
        lightBtn.addEventListener('click', () => {
            document.documentElement.setAttribute('data-theme', 'light');
            lightBtn.classList.add('active');
            if (darkBtn) darkBtn.classList.remove('active');
        });
    }

    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            this.classList.add('active');
            document.body.setAttribute('data-theme-color', this.getAttribute('data-color'));
        });
    });

    // 8. مشاركة التطبيق
    const shareBtn = document.getElementById('share-app-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({ title: 'QR Master Pro', url: window.location.href }).catch(() => {});
            } else {
                alert("Le partage n'est pas supporté.");
            }
        });
    }

    loadHistory();
});

// دالة فتح النماذج
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
    const res = document.getElementById('qr-result');
    if (res) res.innerHTML = '';

    let html = '';
    switch (type) {
        case 'clipboard':
        case 'text':
            titleText.innerText = type === 'text' ? 'Texte en clair' : 'Presse-papiers';
            titleIcon.className = 'fa-solid fa-font';
            html = `<div class="input-group"><label>Texte</label><textarea id="input-field-1" placeholder="Entrez le texte..."></textarea></div>`;
            break;
        case 'url':
            titleText.innerText = 'URL';
            titleIcon.className = 'fa-solid fa-link';
            html = `<div class="input-group"><label>Lien</label><input type="url" id="input-field-1" value="http://" placeholder="http://"></div>`;
            break;
        case 'phone':
            titleText.innerText = 'Téléphone';
            titleIcon.className = 'fa-solid fa-phone';
            html = `<div class="input-group"><label>Numéro</label><input type="tel" id="input-field-1" placeholder="Numéro"></div>`;
            break;
        case 'email':
            titleText.innerText = 'Courriel';
            titleIcon.className = 'fa-solid fa-envelope';
            html = `<div class="input-group"><label>Email</label><input type="email" id="input-field-1" placeholder="Email"></div><div class="input-group"><label>Sujet</label><input type="text" id="input-field-2" placeholder="Sujet"></div><div class="input-group"><label>Message</label><textarea id="input-field-3" placeholder="Message"></textarea></div>`;
            break;
        case 'wifi':
            titleText.innerText = 'Wi-Fi';
            titleIcon.className = 'fa-solid fa-wifi';
            html = `<div class="input-group"><label>SSID</label><input type="text" id="input-field-1" placeholder="Nom du Wi-Fi"></div><div class="input-group"><label>Mot de passe</label><input type="text" id="input-field-2" placeholder="Mot de passe"></div><div class="input-group"><label>Sécurité</label><select id="input-field-3"><option value="WPA">WPA</option><option value="WEP">WEP</option><option value="nopass">Aucun</option></select></div>`;
            break;
        case 'contact':
            titleText.innerText = 'Contact';
            titleIcon.className = 'fa-solid fa-user';
            html = `<div class="input-group"><label>Nom</label><input type="text" id="input-field-1" placeholder="Nom"></div><div class="input-group"><label>Organisation</label><input type="text" id="input-field-2" placeholder="Entreprise"></div><div class="input-group"><label>Adresse</label><input type="text" id="input-field-3" placeholder="Adresse"></div><div class="input-group"><label>Téléphone</label><input type="tel" id="input-field-4" placeholder="Téléphone"></div><div class="input-group"><label>Email</label><input type="email" id="input-field-5" placeholder="Email"></div>`;
            break;
        case 'sms':
            titleText.innerText = 'SMS';
            titleIcon.className = 'fa-solid fa-comment-sms';
            html = `<div class="input-group"><label>Téléphone</label><input type="tel" id="input-field-1" placeholder="Téléphone"></div><div class="input-group"><label>Message</label><textarea id="input-field-2" placeholder="Message"></textarea></div>`;
            break;
        case 'coordinates':
            titleText.innerText = 'Coordonnées';
            titleIcon.className = 'fa-solid fa-location-dot';
            html = `<div class="input-group"><label>Latitude</label><input type="text" id="input-field-1" placeholder="Latitude"></div><div class="input-group"><label>Longitude</label><input type="text" id="input-field-2" placeholder="Longitude"></div>`;
            break;
        case 'agenda':
            titleText.innerText = 'Agenda';
            titleIcon.className = 'fa-solid fa-calendar-days';
            html = `<div class="input-group"><label>Titre</label><input type="text" id="input-field-1" placeholder="Titre"></div><div class="input-group"><label>Lieu</label><input type="text" id="input-field-2" placeholder="Lieu"></div><div class="input-group"><label>Description</label><textarea id="input-field-3" placeholder="Description"></textarea></div>`;
            break;
    }
    if (container) container.innerHTML = html;
}

// دوال الكاميرا والسجل
async function startCamera() {
    const video = document.getElementById('scanner-video');
    if (!video) return;
    if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
    }
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } });
        video.srcObject = videoStream;
    } catch (e) {
        console.log("Caméra non disponible");
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
        videoStream = null;
    }
}

function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    if (historyData.length === 0) {
        list.innerHTML = `<p class="empty-msg">Aucun élément enregistré.</p>`;
        return;
    }
    list.innerHTML = historyData.map(item => `
        <div class="history-item">
            <span><i class="fa-solid fa-qrcode" style="color: var(--accent-color); margin-right: 8px;"></i> ${item.text}</span>
            <a href="${item.url}" target="_blank" download="qrcode.png" class="download-btn" style="padding: 6px 12px; font-size: 12px;"><i class="fa-solid fa-download"></i></a>
        </div>
    `).join('');
}

function loadHistory() {
    historyData = JSON.parse(localStorage.getItem('qr_history')) || [];
}