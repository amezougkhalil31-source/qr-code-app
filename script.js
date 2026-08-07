// ==========================================
// 1. État Global de l'Application
// ==========================================
let isPremiumUser = localStorage.getItem('qr_vip_user') === 'true';
let currentQRType = 'url';
let html5QrCode = null;
let selectedPlan = 'yearly';
let currentSmartActionPayload = '';
let currentSmartActionType = '';

// ==========================================
// 2. Initialisation au Chargement du DOM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateVIPUI();
    renderHistory();
    setupPWAInstall();
    selectQRType('url');
});

// ==========================================
// 3. Navigation par Onglets
// ==========================================
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const navItems = document.querySelectorAll('.nav-item');

    tabs.forEach(tab => tab.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabId}`);
    const activeNav = document.getElementById(`nav-${tabId}`);

    if (activeTab) activeTab.classList.add('active');
    if (activeNav) activeNav.classList.add('active');

    // Arrêter le scanner si on quitte l'onglet Scan
    if (tabId !== 'scan' && html5QrCode) {
        stopScanner();
    }
}

// ==========================================
// 4. Gestion VIP / Premium
// ==========================================
function handleFeatureClick(featureType, isPremiumFeature = false) {
    if (isPremiumFeature && !isPremiumUser) {
        alert("Abonnez-vous au Pack VIP pour débloquer cette fonctionnalité !");
        showTab('premium');
        return;
    }
    selectQRType(featureType);
}

function updateVIPUI() {
    const vipBadge = document.getElementById('vip-badge');
    const admobBanner = document.getElementById('admob-banner-container');

    if (isPremiumUser) {
        if (vipBadge) vipBadge.style.display = 'inline-flex';
        if (admobBanner) admobBanner.style.display = 'none';

        document.querySelectorAll('.grid-card.premium-locked').forEach(card => {
            card.classList.remove('premium-locked');
            const crown = card.querySelector('.crown-icon');
            if (crown) crown.remove();
            
            const type = card.getAttribute('data-type');
            card.setAttribute('onclick', `selectQRType('${type}')`);
        });
    }
}

// ==========================================
// 5. Formulaires Dynamiques
// ==========================================
function selectQRType(type) {
    currentQRType = type;

    document.querySelectorAll('.grid-card').forEach(card => {
        if (card.getAttribute('data-type') === type) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    const container = document.getElementById('form-fields-container');
    if (!container) return;

    let html = '';

    switch (type) {
        case 'url':
            html = `
                <div class="input-group">
                    <label for="input-url"><i class="fa-solid fa-globe"></i> Adresse Web (URL)</label>
                    <input type="url" id="input-url" placeholder="https://example.com" value="https://">
                </div>`;
            break;

        case 'text':
            html = `
                <div class="input-group">
                    <label for="input-text"><i class="fa-solid fa-align-left"></i> Texte Libre</label>
                    <textarea id="input-text" rows="3" placeholder="Saisissez votre texte ici..."></textarea>
                </div>`;
            break;

        case 'contact':
            html = `
                <div class="input-group">
                    <label for="input-contact-name"><i class="fa-solid fa-user"></i> Nom Complet</label>
                    <input type="text" id="input-contact-name" placeholder="John Doe">
                </div>
                <div class="input-group">
                    <label for="input-contact-phone"><i class="fa-solid fa-phone"></i> Téléphone</label>
                    <input type="tel" id="input-contact-phone" placeholder="+212 600 000 000">
                </div>
                <div class="input-group">
                    <label for="input-contact-email"><i class="fa-solid fa-envelope"></i> Email</label>
                    <input type="email" id="input-contact-email" placeholder="john@example.com">
                </div>`;
            break;

        case 'phone':
            html = `
                <div class="input-group">
                    <label for="input-phone-num"><i class="fa-solid fa-phone"></i> Numéro de téléphone</label>
                    <input type="tel" id="input-phone-num" placeholder="+212 600 000 000">
                </div>`;
            break;

        case 'email':
            html = `
                <div class="input-group">
                    <label for="input-email-to"><i class="fa-solid fa-envelope"></i> Destinataire</label>
                    <input type="email" id="input-email-to" placeholder="exemple@domaine.com">
                </div>
                <div class="input-group">
                    <label for="input-email-subject"><i class="fa-solid fa-heading"></i> Sujet</label>
                    <input type="text" id="input-email-subject" placeholder="Objet du message">
                </div>
                <div class="input-group">
                    <label for="input-email-body"><i class="fa-solid fa-message"></i> Message</label>
                    <textarea id="input-email-body" rows="3" placeholder="Votre message..."></textarea>
                </div>`;
            break;

        case 'sms':
            html = `
                <div class="input-group">
                    <label for="input-sms-phone"><i class="fa-solid fa-phone"></i> Numéro de téléphone</label>
                    <input type="tel" id="input-sms-phone" placeholder="+212 600 000 000">
                </div>
                <div class="input-group">
                    <label for="input-sms-message"><i class="fa-solid fa-comment"></i> Message SMS</label>
                    <textarea id="input-sms-message" rows="2" placeholder="Message..."></textarea>
                </div>`;
            break;

        case 'wifi':
            html = `
                <div class="input-group">
                    <label for="input-wifi-ssid"><i class="fa-solid fa-wifi"></i> Nom du réseau (SSID)</label>
                    <input type="text" id="input-wifi-ssid" placeholder="MonRéseauWiFi">
                </div>
                <div class="input-group">
                    <label for="input-wifi-pass"><i class="fa-solid fa-lock"></i> Mot de passe</label>
                    <input type="password" id="input-wifi-pass" placeholder="Mot de passe">
                </div>
                <div class="input-group">
                    <label for="input-wifi-type"><i class="fa-solid fa-shield-halved"></i> Sécurité</label>
                    <select id="input-wifi-type">
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Aucune (Ouvert)</option>
                    </select>
                </div>`;
            break;

        case 'location':
            html = `
                <div class="input-group">
                    <label for="input-loc-lat"><i class="fa-solid fa-location-crosshairs"></i> Latitude</label>
                    <input type="text" id="input-loc-lat" placeholder="30.4278">
                </div>
                <div class="input-group">
                    <label for="input-loc-lng"><i class="fa-solid fa-location-crosshairs"></i> Longitude</label>
                    <input type="text" id="input-loc-lng" placeholder="-9.5981">
                </div>`;
            break;

        case 'event':
            html = `
                <div class="input-group">
                    <label for="input-evt-title"><i class="fa-solid fa-calendar-plus"></i> Titre de l'événement</label>
                    <input type="text" id="input-evt-title" placeholder="Réunion de travail">
                </div>
                <div class="input-group">
                    <label for="input-evt-location"><i class="fa-solid fa-map-pin"></i> Lieu</label>
                    <input type="text" id="input-evt-location" placeholder="Bureau / En ligne">
                </div>`;
            break;
    }

    container.innerHTML = html;
}

// ==========================================
// 6. Génération de QR Code avec Validation
// ==========================================
function generateQRCode() {
    let payload = '';

    switch (currentQRType) {
        case 'url': {
            const url = document.getElementById('input-url').value.trim();
            if (!url || url === 'https://' || url === 'http://') {
                alert('Veuillez entrer une URL valide.');
                return;
            }
            payload = url;
            break;
        }
        case 'text': {
            const txt = document.getElementById('input-text').value.trim();
            if (!txt) {
                alert('Veuillez saisir votre texte.');
                return;
            }
            payload = txt;
            break;
        }
        case 'contact': {
            const name = document.getElementById('input-contact-name').value.trim();
            const phone = document.getElementById('input-contact-phone').value.trim();
            const email = document.getElementById('input-contact-email').value.trim();
            if (!name && !phone && !email) {
                alert('Veuillez remplir au moins un champ de contact.');
                return;
            }
            payload = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
            break;
        }
        case 'phone': {
            const phone = document.getElementById('input-phone-num').value.trim();
            if (!phone) {
                alert('Veuillez entrer un numéro de téléphone.');
                return;
            }
            payload = `tel:${phone}`;
            break;
        }
        case 'email': {
            const to = document.getElementById('input-email-to').value.trim();
            const sub = encodeURIComponent(document.getElementById('input-email-subject').value.trim());
            const body = encodeURIComponent(document.getElementById('input-email-body').value.trim());
            if (!to) {
                alert('Veuillez spécifier un destinataire.');
                return;
            }
            payload = `mailto:${to}?subject=${sub}&body=${body}`;
            break;
        }
        case 'sms': {
            const smsPhone = document.getElementById('input-sms-phone').value.trim();
            const smsMsg = encodeURIComponent(document.getElementById('input-sms-message').value.trim());
            if (!smsPhone) {
                alert('Veuillez entrer un numéro de téléphone.');
                return;
            }
            payload = `SMSTO:${smsPhone}:${smsMsg}`;
            break;
        }
        case 'wifi': {
            const ssid = document.getElementById('input-wifi-ssid').value.trim();
            const pass = document.getElementById('input-wifi-pass').value.trim();
            const type = document.getElementById('input-wifi-type').value;
            if (!ssid) {
                alert('Veuillez entrer le nom du réseau WiFi (SSID).');
                return;
            }
            payload = `WIFI:S:${ssid};T:${type};P:${pass};;`;
            break;
        }
        case 'location': {
            const lat = document.getElementById('input-loc-lat').value.trim();
            const lng = document.getElementById('input-loc-lng').value.trim();
            if (!lat || !lng) {
                alert('Veuillez entrer la latitude et la longitude.');
                return;
            }
            payload = `geo:${lat},${lng}`;
            break;
        }
        case 'event': {
            const title = document.getElementById('input-evt-title').value.trim();
            const loc = document.getElementById('input-evt-location').value.trim();
            if (!title) {
                alert('Veuillez entrer le titre de l\'événement.');
                return;
            }
            payload = `BEGIN:VEVENT\nSUMMARY:${title}\nLOCATION:${loc}\nEND:VEVENT`;
            break;
        }
    }

    const displayContainer = document.getElementById('qrcode-display');
    if (!displayContainer) return;
    displayContainer.innerHTML = '';

    if (typeof QRCode === 'undefined') {
        alert('Erreur: La bibliothèque QRCode n\'est pas chargée.');
        return;
    }

    new QRCode(displayContainer, {
        text: payload,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    const resultCard = document.getElementById('qr-result-card');
    if (resultCard) resultCard.style.display = 'block';

    saveToHistory(currentQRType.toUpperCase(), payload);
}

// ==========================================
// 7. Téléchargement et Partage
// ==========================================
function downloadQRCode() {
    const img = document.querySelector('#qrcode-display img');
    const canvas = document.querySelector('#qrcode-display canvas');

    let imageSrc = '';
    if (canvas && canvas.toDataURL) {
        imageSrc = canvas.toDataURL("image/png");
    } else if (img && img.src) {
        imageSrc = img.src;
    }

    if (!imageSrc) {
        alert("Aucun QR Code à télécharger.");
        return;
    }

    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `QR_Master_Pro_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareQRCode() {
    if (navigator.share) {
        navigator.share({
            title: 'QR Code - QR Master Pro',
            text: 'Voici mon QR Code généré avec QR Master Pro.',
            url: window.location.href
        }).catch(() => {});
    } else {
        alert('Fonction de partage non supportée sur cet appareil.');
    }
}

// ==========================================
// 8. Scanner de QR Code (Caméra Rapidifiée)
// ==========================================
function startScanner() {
    if (typeof Html5Qrcode === 'undefined') {
        alert("La bibliothèque Html5Qrcode n'est pas chargée.");
        return;
    }

    const btnStart = document.getElementById('btn-start-scan');
    const btnStop = document.getElementById('btn-stop-scan');

    if (btnStart) btnStart.style.display = 'none';
    if (btnStop) btnStop.style.display = 'inline-flex';

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    // تسريع الاستجابة والكاميرا إلى 30 FPS مع ضبط الحجم
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 30, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            onScanSuccess(decodedText);
            stopScanner();
        },
        () => {}
    ).catch(err => {
        alert("Impossible d'accéder à la caméra : " + err);
        stopScanner();
    });
}

function stopScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
            html5QrCode = null;
            resetScannerUI();
        }).catch(() => {
            html5QrCode = null;
            resetScannerUI();
        });
    } else {
        resetScannerUI();
    }
}

function resetScannerUI() {
    const btnStart = document.getElementById('btn-start-scan');
    const btnStop = document.getElementById('btn-stop-scan');
    if (btnStart) btnStart.style.display = 'inline-flex';
    if (btnStop) btnStop.style.display = 'none';
}

function scanImageFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof Html5Qrcode === 'undefined') {
        alert("La bibliothèque Html5Qrcode n'est pas chargée.");
        return;
    }

    let tempReader = document.getElementById('reader-file-temp');
    if (!tempReader) {
        tempReader = document.createElement('div');
        tempReader.id = 'reader-file-temp';
        tempReader.style.display = 'none';
        document.body.appendChild(tempReader);
    }

    const scanner = new Html5Qrcode("reader-file-temp", false);
    scanner.scanFile(file, true)
        .then(decodedText => {
            onScanSuccess(decodedText);
        })
        .catch(() => {
            alert("Aucun QR Code valide trouvé dans cette image.");
        });
}

// المعالجة الذكية لنتائج السكان وإظهار الأزرار المخصصة
function onScanSuccess(text) {
    const card = document.getElementById('scan-result-card');
    const textElement = document.getElementById('scan-result-text');
    const smartBtn = document.getElementById('btn-action-smart');
    const smartIcon = document.getElementById('btn-action-smart-icon');
    const smartText = document.getElementById('btn-action-smart-text');

    if (card) card.style.display = 'block';
    if (textElement) textElement.innerText = text;

    currentSmartActionPayload = text;
    currentSmartActionType = 'text';

    if (smartBtn) {
        if (text.startsWith('http://') || text.startsWith('https://')) {
            currentSmartActionType = 'url';
            smartIcon.className = 'fa-solid fa-arrow-up-right-from-square';
            smartText.innerText = 'Ouvrir le lien';
            smartBtn.style.display = 'inline-flex';
        } else if (text.startsWith('tel:') || /^\+?[0-9\s\-]{7,15}$/.test(text.trim())) {
            currentSmartActionType = 'phone';
            currentSmartActionPayload = text.startsWith('tel:') ? text : `tel:${text.trim()}`;
            smartIcon.className = 'fa-solid fa-phone';
            smartText.innerText = 'Appeler ce numéro';
            smartBtn.style.display = 'inline-flex';
        } else if (text.startsWith('mailto:') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) {
            currentSmartActionType = 'email';
            currentSmartActionPayload = text.startsWith('mailto:') ? text : `mailto:${text.trim()}`;
            smartIcon.className = 'fa-solid fa-envelope';
            smartText.innerText = 'Envoyer un Email';
            smartBtn.style.display = 'inline-flex';
        } else if (text.startsWith('SMSTO:') || text.startsWith('sms:')) {
            currentSmartActionType = 'sms';
            smartIcon.className = 'fa-solid fa-comment-sms';
            smartText.innerText = 'Envoyer un SMS';
            smartBtn.style.display = 'inline-flex';
        } else if (text.includes('BEGIN:VCARD')) {
            currentSmartActionType = 'vcard';
            smartIcon.className = 'fa-solid fa-address-card';
            smartText.innerText = 'Télécharger le contact';
            smartBtn.style.display = 'inline-flex';
        } else {
            smartBtn.style.display = 'none';
        }
    }

    saveToHistory('SCAN', text);
}

function executeSmartAction() {
    if (!currentSmartActionPayload) return;

    if (currentSmartActionType === 'url') {
        window.open(currentSmartActionPayload, '_blank');
    } else if (currentSmartActionType === 'phone' || currentSmartActionType === 'email' || currentSmartActionType === 'sms') {
        window.location.href = currentSmartActionPayload;
    } else if (currentSmartActionType === 'vcard') {
        const blob = new Blob([currentSmartActionPayload], { type: 'text/vcard;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'contact.vcf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function copyScanResult() {
    const textElement = document.getElementById('scan-result-text');
    if (textElement) copyToClipboard(textElement.innerText);
}

// ==========================================
// 9. Gestion de l'Historique & Modale QR
// ==========================================
function saveToHistory(type, content) {
    let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
    const newItem = {
        type: type,
        text: content,
        date: new Date().toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    
    history.unshift(newItem);
    if (history.length > 50) history.pop();
    
    localStorage.setItem('qr_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;

    const history = JSON.parse(localStorage.getItem('qr_history') || '[]');

    if (history.length === 0) {
        container.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding:20px;">Aucun historique disponible.</p>`;
        return;
    }

    container.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-info">
                <span class="badge">${item.type}</span>
                <span class="text" title="${escapeHtml(item.text)}">${escapeHtml(item.text)}</span>
            </div>
            <div class="history-actions">
                <button onclick="openQRFromHistoryIndex(${index})" title="Aperçu QR">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button onclick="copyHistoryIndex(${index})" title="Copier">
                    <i class="fa-solid fa-copy"></i>
                </button>
                <button onclick="deleteHistoryItem(${index})" title="Supprimer">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function openQRFromHistoryIndex(index) {
    const history = JSON.parse(localStorage.getItem('qr_history') || '[]');
    if (!history[index]) return;

    const content = history[index].text;
    const modal = document.getElementById('qr-modal');
    const container = document.getElementById('modal-qr-container');
    const caption = document.getElementById('modal-qr-text');

    if (!modal || !container) return;

    container.innerHTML = '';
    if (caption) caption.innerText = content;

    if (typeof QRCode !== 'undefined') {
        new QRCode(container, {
            text: content,
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff"
        });
    }

    modal.style.display = 'flex';
}

function copyHistoryIndex(index) {
    const history = JSON.parse(localStorage.getItem('qr_history') || '[]');
    if (history[index]) {
        copyToClipboard(history[index].text);
    }
}

function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
    history.splice(index, 1);
    localStorage.setItem('qr_history', JSON.stringify(history));
    renderHistory();
}

function clearHistory() {
    if (confirm("Voulez-vous vraiment effacer tout votre historique ?")) {
        localStorage.removeItem('qr_history');
        renderHistory();
    }
}

function closeQRModal() {
    const modal = document.getElementById('qr-modal');
    if (modal) modal.style.display = 'none';
}

function downloadModalQRCode() {
    const img = document.querySelector('#modal-qr-container img');
    const canvas = document.querySelector('#modal-qr-container canvas');

    let imageSrc = '';
    if (canvas && canvas.toDataURL) {
        imageSrc = canvas.toDataURL("image/png");
    } else if (img && img.src) {
        imageSrc = img.src;
    }

    if (!imageSrc) return;

    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `QR_History_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// 10. Facturation Google Play Billing
// ==========================================
function selectBillingPlan(plan) {
    selectedPlan = plan;
    document.querySelectorAll('.plan-card').forEach(card => card.classList.remove('selected'));
    
    const selectedCard = document.getElementById(`plan-${plan}`);
    if (selectedCard) selectedCard.classList.add('selected');
}

function startGooglePlayBilling() {
    alert(`Redirection vers la passerelle de paiement Google Play Billing pour le forfait (${selectedPlan.toUpperCase()})...`);
    
    localStorage.setItem('qr_vip_user', 'true');
    isPremiumUser = true;
    updateVIPUI();
    alert("Félicitations ! Vous êtes maintenant Membre VIP.");
    showTab('create');
}

// ==========================================
// 11. Utilitaires Divers, Theme & Couleurs
// ==========================================
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Copié dans le presse-papier !");
        }).catch(() => {
            fallbackCopyText(text);
        });
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        alert("Copié dans le presse-papier !");
    } catch (err) {
        alert("Erreur lors de la copie.");
    }
    document.body.removeChild(textArea);
}

// إصلاح المظهر الداكن وتثبيته دائماً
function initTheme() {
    const savedTheme = localStorage.getItem('qr_app_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.checked = (savedTheme === 'dark');

    const savedPrimary = localStorage.getItem('qr_primary_color');
    const savedHover = localStorage.getItem('qr_primary_hover');
    if (savedPrimary && savedHover) {
        document.documentElement.style.setProperty('--primary', savedPrimary);
        document.documentElement.style.setProperty('--primary-hover', savedHover);
    }
}

function toggleTheme() {
    const toggle = document.getElementById('theme-toggle');
    const isChecked = toggle ? toggle.checked : false;
    const themeName = isChecked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('qr_app_theme', themeName);
}

function changeThemeColor(primary, primaryHover) {
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--primary-hover', primaryHover);
    localStorage.setItem('qr_primary_color', primary);
    localStorage.setItem('qr_primary_hover', primaryHover);
    
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }
}

function setupPWAInstall() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const btn = document.getElementById('pwa-install-btn');
        if (btn) {
            btn.style.display = 'inline-flex';
            btn.onclick = () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                    btn.style.display = 'none';
                });
            };
        }
    });
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}