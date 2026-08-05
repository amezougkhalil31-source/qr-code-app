/* ==========================================
   QR Master Pro - Complete Main Script (script.js)
   ========================================== */

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
            console.error('Service Worker registration failed:', err);
        });
    });
}

// App State & Storage (LocalStorage Integration)
let historyData = JSON.parse(localStorage.getItem('qr_master_history')) || [];
let currentActiveType = 'url';
let html5QrCode = null;
let currentCameraId = null;
let camerasList = [];
let cameraIndex = 0;
let selectedPlanType = 'annual';
let isUserPremium = JSON.parse(localStorage.getItem('qr_is_premium')) || false;
let freeGensCount = parseInt(localStorage.getItem('qr_free_gens_count')) || 0;
const MAX_FREE_GENS = 3;

// Locked/Premium Generator Types
const lockedTypes = ['contact', 'wifi', 'coordinates', 'agenda', 'email', 'sms'];

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const pageSections = document.querySelectorAll('.page-section');
const drawer = document.getElementById('settings-drawer');
const overlay = document.getElementById('drawer-overlay');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const headerPremiumBtn = document.getElementById('header-premium-btn');
const gotoPremiumDrawerBtn = document.getElementById('goto-premium-drawer-btn');

// Navigation Logic
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        pageSections.forEach(sec => sec.classList.remove('active'));
        const activeSec = document.getElementById(`${target}-section`);
        if (activeSec) activeSec.classList.add('active');

        if (target === 'scanner') {
            initScanner();
        } else {
            stopScanner();
        }

        if (target === 'history') {
            renderHistory();
        }
    });
});

// Premium navigation triggers
if (headerPremiumBtn) {
    headerPremiumBtn.addEventListener('click', () => switchToSection('premium'));
}
if (gotoPremiumDrawerBtn) {
    gotoPremiumDrawerBtn.addEventListener('click', () => {
        closeDrawer();
        switchToSection('premium');
    });
}

function switchToSection(targetName) {
    navItems.forEach(nav => {
        if (nav.getAttribute('data-target') === targetName) {
            nav.click();
        }
    });
}

// Drawer Controls
if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
        drawer.classList.add('open');
        overlay.classList.add('open');
    });
}
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
if (overlay) overlay.addEventListener('click', closeDrawer);

function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
}

// Theme & Color Settings
const htmlTag = document.documentElement;
const savedTheme = localStorage.getItem('qr_theme') || 'dark';
const savedColor = localStorage.getItem('qr_color') || 'indigo';

htmlTag.setAttribute('data-theme', savedTheme);
htmlTag.setAttribute('data-theme-color', savedColor);

const lightModeBtn = document.getElementById('light-mode-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');

if (lightModeBtn && darkModeBtn) {
    if (savedTheme === 'light') {
        lightModeBtn.classList.add('active');
        darkModeBtn.classList.remove('active');
    } else {
        darkModeBtn.classList.add('active');
        lightModeBtn.classList.remove('active');
    }

    lightModeBtn.addEventListener('click', () => setTheme('light'));
    darkModeBtn.addEventListener('click', () => setTheme('dark'));
}

function setTheme(theme) {
    htmlTag.setAttribute('data-theme', theme);
    localStorage.setItem('qr_theme', theme);
    if (theme === 'light') {
        lightModeBtn.classList.add('active');
        darkModeBtn.classList.remove('active');
    } else {
        darkModeBtn.classList.add('active');
        lightModeBtn.classList.remove('active');
    }
}

document.querySelectorAll('.color-dot').forEach(dot => {
    const col = dot.getAttribute('data-color');
    if (col === savedColor) dot.classList.add('active');
    dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        htmlTag.setAttribute('data-theme-color', col);
        localStorage.setItem('qr_color', col);
    });
});

// Initialize Crown Badges on Locked Generator Buttons
document.querySelectorAll('.type-item-btn').forEach(btn => {
    const type = btn.getAttribute('data-type');
    if (lockedTypes.includes(type) && !btn.querySelector('.type-crown-badge')) {
        const crown = document.createElement('div');
        crown.className = 'type-crown-badge';
        crown.innerHTML = '<i class="fa-solid fa-crown"></i>';
        btn.appendChild(crown);
    }
});

// Share App Button
const shareAppBtn = document.getElementById('share-app-btn');
if (shareAppBtn) {
    shareAppBtn.addEventListener('click', async () => {
        closeDrawer();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'QR Master Pro',
                    text: 'Découvrez QR Master Pro, l\'application professionnelle pour créer et scanner vos QR codes !',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share canceled or failed', err);
            }
        } else {
            alert('Le partage n\'est pas pris en charge sur ce navigateur.');
        }
    });
}

// Premium Plan Selection & Google Play Billing Integration
const premiumPlanCards = document.querySelectorAll('.premium-plan-card');
premiumPlanCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        premiumPlanCards.forEach(c => c.classList.remove('active-plan'));
        card.classList.add('active-plan');
        selectedPlanType = index === 0 ? 'annual' : 'monthly';
    });
});

const subscribeNowBtn = document.getElementById('subscribe-now-btn');
if (subscribeNowBtn) {
    subscribeNowBtn.addEventListener('click', () => {
        const planName = selectedPlanType === 'annual' ? 'Abonnement Annuel (9.99 $ / an)' : 'Abonnement Mensuel (1.99 $ / mois)';
        if (confirm(`Voulez-vous procéder au paiement sécurisé via Google Play Billing pour le plan : ${planName} ?`)) {
            alert('Connexion sécurisée à Google Play Billing... Redirection vers le système de paiement Google Play.');
            // Simulation of successful activation for testing purposes
            // isUserPremium = true;
            // localStorage.setItem('qr_is_premium', 'true');
        }
    });
}

// Generator Logic & Dynamic Forms
const typesMenuView = document.getElementById('types-menu-view');
const dynamicFormView = document.getElementById('dynamic-form-view');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const formTitleText = document.getElementById('form-title-text');
const formInputsContainer = document.getElementById('form-inputs-container');
const generateCustomBtn = document.getElementById('generate-custom-btn');
const qrResultBox = document.getElementById('qr-result');

document.querySelectorAll('.type-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        
        // Check if type is locked for free users
        if (!isUserPremium && lockedTypes.includes(type) && freeGensCount >= MAX_FREE_GENS) {
            showLimitModal();
            return;
        }

        currentActiveType = type;
        typesMenuView.style.display = 'none';
        dynamicFormView.style.display = 'block';
        setupDynamicForm(currentActiveType);
        qrResultBox.innerHTML = '';
    });
});

if (backToMenuBtn) {
    backToMenuBtn.addEventListener('click', () => {
        dynamicFormView.style.display = 'none';
        typesMenuView.style.display = 'block';
        qrResultBox.innerHTML = '';
    });
}

function showLimitModal() {
    if (confirm('Vous avez atteint la limite gratuite de générations. Voulez-vous passer à QR Master Pro Premium pour un accès illimité ?')) {
        switchToSection('premium');
    }
}

function setupDynamicForm(type) {
    formInputsContainer.innerHTML = '';
    let title = 'Générer';

    switch(type) {
        case 'url':
            title = 'Lien Web (URL)';
            formInputsContainer.innerHTML = `
                <div class="input-group">
                    <label>Adresse Web</label>
                    <input type="url" id="inp-url" placeholder="https://example.com" value="https://">
                </div>
            `;
            break;
        case 'text':
            title = 'Texte Libre';
            formInputsContainer.innerHTML = `
                <div class="input-group">
                    <label>Votre Texte</label>
                    <textarea id="inp-text" rows="3" placeholder="Entrez votre texte ici..."></textarea>
                </div>
            `;
            break;
        case 'contact':
            title = 'Contact (vCard)';
            formInputsContainer.innerHTML = `
                <div class="input-group"><label>Nom complet</label><input type="text" id="inp-c-name" placeholder="Nom Prénom"></div>
                <div class="input-group"><label>Téléphone</label><input type="tel" id="inp-c-phone" placeholder="+212600000000"></div>
                <div class="input-group"><label>Email</label><input type="email" id="inp-c-email" placeholder="email@example.com"></div>
                <div class="input-group"><label>Entreprise</label><input type="text" id="inp-c-org" placeholder="Nom de la société"></div>
            `;
            break;
        case 'phone':
            title = 'Numéro de Téléphone';
            formInputsContainer.innerHTML = `
                <div class="input-group">
                    <label>Numéro</label>
                    <input type="tel" id="inp-phone" placeholder="+212600000000">
                </div>
            `;
            break;
        case 'email':
            title = 'Adresse Email';
            formInputsContainer.innerHTML = `
                <div class="input-group"><label>Email destinataire</label><input type="email" id="inp-email-to" placeholder="contact@example.com"></div>
                <div class="input-group"><label>Sujet</label><input type="text" id="inp-email-sub" placeholder="Sujet du message"></div>
                <div class="input-group"><label>Message</label><textarea id="inp-email-body" rows="2" placeholder="Contenu..."></textarea></div>
            `;
            break;
        case 'sms':
            title = 'Message SMS';
            formInputsContainer.innerHTML = `
                <div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="inp-sms-phone" placeholder="+212600000000"></div>
                <div class="input-group"><label>Message</label><textarea id="inp-sms-body" rows="2" placeholder="Votre message..."></textarea></div>
            `;
            break;
        case 'wifi':
            title = 'Réseau Wi-Fi';
            formInputsContainer.innerHTML = `
                <div class="input-group"><label>Nom du réseau (SSID)</label><input type="text" id="inp-wifi-ssid" placeholder="NomDuWifi"></div>
                <div class="input-group"><label>Mot de passe</label><input type="text" id="inp-wifi-pass" placeholder="Mot de passe"></div>
                <div class="input-group">
                    <label>Sécurité</label>
                    <select id="inp-wifi-sec">
                        <option value="WPA" selected>WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Aucune</option>
                    </select>
                </div>
            `;
            break;
        case 'coordinates':
            title = 'Coordonnées GPS';
            formInputsContainer.innerHTML = `
                <div class="input-group"><label>Latitude</label><input type="text" id="inp-lat" placeholder="33.5731"></div>
                <div class="input-group"><label>Longitude</label><input type="text" id="inp-lng" placeholder="-7.5898"></div>
            `;
            break;
        case 'agenda':
            title = 'Événement Agenda';
            formInputsContainer.innerHTML = `
                <div class="input-group"><label>Titre de l'événement</label><input type="text" id="inp-ev-title" placeholder="Réunion importante"></div>
                <div class="input-group"><label>Date de début</label><input type="datetime-local" id="inp-ev-start"></div>
                <div class="input-group"><label>Date de fin</label><input type="datetime-local" id="inp-ev-end"></div>
            `;
            break;
        case 'clipboard':
            title = 'Presse-papiers Rapide';
            formInputsContainer.innerHTML = `
                <div class="input-group">
                    <label>Contenu copié</label>
                    <textarea id="inp-clip" rows="3" placeholder="Texte rapide..."></textarea>
                </div>
            `;
            break;
    }
    formTitleText.textContent = title;
}

if (generateCustomBtn) {
    generateCustomBtn.addEventListener('click', () => {
        let content = '';
        switch(currentActiveType) {
            case 'url':
                content = document.getElementById('inp-url').value.trim();
                break;
            case 'text':
                content = document.getElementById('inp-text').value.trim();
                break;
            case 'contact':
                const cName = document.getElementById('inp-c-name').value.trim();
                const cPhone = document.getElementById('inp-c-phone').value.trim();
                const cEmail = document.getElementById('inp-c-email').value.trim();
                const cOrg = document.getElementById('inp-c-org').value.trim();
                content = `BEGIN:VCARD\nVERSION:3.0\nFN:${cName}\nTEL:${cPhone}\nEMAIL:${cEmail}\nORG:${cOrg}\nEND:VCARD`;
                break;
            case 'phone':
                const ph = document.getElementById('inp-phone').value.trim();
                content = `tel:${ph}`;
                break;
            case 'email':
                const to = document.getElementById('inp-email-to').value.trim();
                const sub = encodeURIComponent(document.getElementById('inp-email-sub').value.trim());
                const body = encodeURIComponent(document.getElementById('inp-email-body').value.trim());
                content = `mailto:${to}?subject=${sub}&body=${body}`;
                break;
            case 'sms':
                const smsp = document.getElementById('inp-sms-phone').value.trim();
                const smsb = encodeURIComponent(document.getElementById('inp-sms-body').value.trim());
                content = `smsto:${smsp}:${smsb}`;
                break;
            case 'wifi':
                const ssid = document.getElementById('inp-wifi-ssid').value.trim();
                const pass = document.getElementById('inp-wifi-pass').value.trim();
                const sec = document.getElementById('inp-wifi-sec').value;
                content = `WIFI:T:${sec};S:${ssid};P:${pass};;`;
                break;
            case 'coordinates':
                const lat = document.getElementById('inp-lat').value.trim();
                const lng = document.getElementById('inp-lng').value.trim();
                content = `geo:${lat},${lng}`;
                break;
            case 'agenda':
                const evTitle = document.getElementById('inp-ev-title').value.trim();
                const evStart = document.getElementById('inp-ev-start').value.replace(/-|:|\.\d\d\d/g,"");
                const evEnd = document.getElementById('inp-ev-end').value.replace(/-|:|\.\d\d\d/g,"");
                content = `BEGIN:VEVENT\nSUMMARY:${evTitle}\nDTSTART:${evStart}\nDTEND:${evEnd}\nEND:VEVENT`;
                break;
            case 'clipboard':
                content = document.getElementById('inp-clip').value.trim();
                break;
        }

        if (!content || content === 'https://' || content === 'tel:' || content === 'mailto:?subject=&body=') {
            alert('Veuillez remplir les champs requis pour générer le QR Code.');
            return;
        }

        // Increment free generation count if not premium
        if (!isUserPremium) {
            freeGensCount++;
            localStorage.setItem('qr_free_gens_count', freeGensCount);
        }

        const sizeVal = parseInt(document.getElementById('qr-size')?.value) || 250;
        qrResultBox.innerHTML = '';
        
        new QRCode(qrResultBox, {
            text: content,
            width: sizeVal > 240 ? 220 : sizeVal,
            height: sizeVal > 240 ? 220 : sizeVal,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        addHistoryItem(content, currentActiveType.toUpperCase());
    });
}

// Scanner Logic & Camera Handler
function initScanner() {
    const readerElem = document.getElementById('reader');
    if (!readerElem) return;

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
            camerasList = devices;
            let backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('arriére') || d.label.toLowerCase().includes('rear'));
            currentCameraId = backCam ? backCam.id : devices[devices.length - 1].id;
            startCameraStream(currentCameraId);
        } else {
            alert('Aucune caméra détectée sur cet appareil.');
        }
    }).catch(err => {
        console.error("Camera access error:", err);
        startCameraStream({ facingMode: "environment" });
    });
}

function startCameraStream(cameraIdOrConfig) {
    if (!html5QrCode) return;
    const config = { fps: 10, qrbox: { width: 220, height: 220 } };

    html5QrCode.start(
        cameraIdOrConfig,
        config,
        (decodedText) => {
            handleSuccessfulScan(decodedText);
        },
        (errorMessage) => {}
    ).catch(err => {
        console.error("Failed to start scanner:", err);
    });
}

function stopScanner() {
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.log("Stop error:", err));
    }
}

const switchCameraBtn = document.getElementById('switch-camera-btn');
if (switchCameraBtn) {
    switchCameraBtn.addEventListener('click', () => {
        if (camerasList.length > 1) {
            cameraIndex = (cameraIndex + 1) % camerasList.length;
            currentCameraId = camerasList[cameraIndex].id;
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    startCameraStream(currentCameraId);
                });
            }
        } else {
            alert('Une seule caméra est disponible sur cet appareil.');
        }
    });
}

const scanGalleryBtn = document.getElementById('scan-gallery-btn');
const galleryFileInput = document.getElementById('gallery-file-input');
if (scanGalleryBtn && galleryFileInput) {
    scanGalleryBtn.addEventListener('click', () => galleryFileInput.click());
    galleryFileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files.length > 0) {
            const imageFile = e.target.files[0];
            if (!html5QrCode) {
                html5QrCode = new Html5Qrcode("reader");
            }
            html5QrCode.scanFile(imageFile, true)
                .then(decodedText => {
                    handleSuccessfulScan(decodedText);
                })
                .catch(err => {
                    alert('Impossible de lire un QR code à partir de cette image.');
                });
        }
    });
}

function handleSuccessfulScan(text) {
    stopScanner();
    addHistoryItem(text, 'SCAN');
    showScanResultModal(text);
}

const scanResultScreen = document.getElementById('scan-result-screen');
const closeScanResultBtn = document.getElementById('close-scan-result-btn');
const scanResultTextElem = document.getElementById('scan-result-text');
const scanResultCategory = document.getElementById('scan-result-category');
const smartOpenLinkBtn = document.getElementById('smart-open-link-btn');
const scanActionCopy = document.getElementById('scan-action-copy');
const scanActionShare = document.getElementById('scan-action-share');

let activeScannedText = '';

function showScanResultModal(text) {
    activeScannedText = text;
    if (scanResultTextElem) scanResultTextElem.textContent = text;
    
    let categoryName = 'TEXTE';
    let actionLabel = 'Ouvrir';
    let actionIcon = 'fa-bolt';

    if (text.startsWith('http://') || text.startsWith('https://')) {
        categoryName = 'LIEN WEB';
        actionLabel = 'Ouvrir le Site Web';
        actionIcon = 'fa-globe';
    } else if (text.startsWith('tel:')) {
        categoryName = 'TÉLÉPHONE';
        actionLabel = 'Appeler ce Numéro';
        actionIcon = 'fa-phone';
    } else if (text.startsWith('mailto:')) {
        categoryName = 'EMAIL';
        actionLabel = 'Envoyer un Email';
        actionIcon = 'fa-envelope';
    } else if (text.startsWith('geo:')) {
        categoryName = 'GPS / MAPS';
        actionLabel = 'Ouvrir dans Google Maps';
        actionIcon = 'fa-location-dot';
    } else if (text.startsWith('WIFI:')) {
        categoryName = 'WI-FI';
        actionLabel = 'Copier les infos Wi-Fi';
        actionIcon = 'fa-wifi';
    }

    if (scanResultCategory) scanResultCategory.textContent = categoryName;
    if (smartOpenLinkBtn) {
        smartOpenLinkBtn.querySelector('span').textContent = actionLabel;
        smartOpenLinkBtn.querySelector('i').className = `fa-solid ${actionIcon}`;
    }

    if (scanResultScreen) scanResultScreen.classList.add('active');
}

if (closeScanResultBtn) {
    closeScanResultBtn.addEventListener('click', () => {
        scanResultScreen.classList.remove('active');
        if (document.getElementById('scanner-section').classList.contains('active')) {
            initScanner();
        }
    });
}

if (smartOpenLinkBtn) {
    smartOpenLinkBtn.addEventListener('click', () => {
        const text = activeScannedText;
        if (text.startsWith('http://') || text.startsWith('https://')) {
            window.open(text, '_blank');
        } else if (text.startsWith('tel:')) {
            window.location.href = text;
        } else if (text.startsWith('mailto:')) {
            window.location.href = text;
        } else if (text.startsWith('geo:')) {
            const coords = text.replace('geo:', '');
            window.open(`https://www.google.com/maps/search/?api=1&query=${coords}`, '_blank');
        } else {
            navigator.clipboard.writeText(text);
            alert('Copié dans le presse-papiers !');
        }
    });
}

if (scanActionCopy) {
    scanActionCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(activeScannedText);
        alert('Copié dans le presse-papiers !');
    });
}

if (scanActionShare) {
    scanActionShare.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({ text: activeScannedText });
            } catch (err) {}
        } else {
            navigator.clipboard.writeText(activeScannedText);
            alert('Copié dans le presse-papiers !');
        }
    });
}

function addHistoryItem(text, type) {
    if (historyData.length > 0 && historyData[0].text === text) {
        return;
    }
    const newItem = {
        text: text,
        type: type,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    historyData.unshift(newItem);
    localStorage.setItem('qr_master_history', JSON.stringify(historyData));
}

function renderHistory() {
    const container = document.getElementById('history-list-container');
    if (!container) return;

    if (historyData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <i class="fa-solid fa-clock-rotate-left" style="font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5;"></i>
                <p style="font-size: 0.9rem;">Aucun historique pour le moment</p>
            </div>
        `;
        return;
    }

    let html = '';
    historyData.forEach((item, index) => {
        html += `
            <div onclick="openHistoryDetail(${index})" style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; transition: border-color 0.2s;">
                <div style="flex: 1; overflow: hidden;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                        <span class="badge">${item.type}</span>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">${item.date}</span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.text}</p>
                </div>
                <div style="display: flex; gap: 6px;" onclick="event.stopPropagation()">
                    <button class="icon-btn" onclick="navigator.clipboard.writeText('${item.text.replace(/'/g, "\\'")}'); alert('Copié !');" title="Copier" style="width: 32px; height: 32px; font-size: 0.9rem;">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                    <button class="icon-btn" onclick="deleteHistoryItem(${index})" title="Supprimer" style="width: 32px; height: 32px; font-size: 0.9rem; color: #ef4444;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.openHistoryDetail = function(index) {
    const item = historyData[index];
    if (item) {
        showScanResultModal(item.text);
    }
};

window.deleteHistoryItem = function(index) {
    historyData.splice(index, 1);
    localStorage.setItem('qr_master_history', JSON.stringify(historyData));
    renderHistory();
};

const clearHistoryBtn = document.getElementById('clear-history-btn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
            historyData = [];
            localStorage.removeItem('qr_master_history');
            renderHistory();
        }
    });
}