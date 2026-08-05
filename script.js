/* ==========================================================================
   QR Master Pro - Complete & Original Script (Full 600+ Lines Version)
   ========================================================================== */

// 1. Service Worker Registration for Offline Support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker enregistré avec succès:', reg.scope))
            .catch(err => console.error('Erreur d\'enregistrement du Service Worker:', err));
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENTS & VARIABLES ---
    
    // Navigation & Sections
    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');
    
    // Drawer & Settings
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const settingsDrawer = document.getElementById('settings-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    
    // Premium Shortcuts
    const headerPremiumBtn = document.getElementById('header-premium-btn');
    const gotoPremiumDrawerBtn = document.getElementById('goto-premium-drawer-btn');
    const subscribeNowBtn = document.getElementById('subscribe-now-btn');
    const premiumPlanCards = document.querySelectorAll('.premium-plan-card');

    // Theme & Styling Controls
    const lightModeBtn = document.getElementById('light-mode-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const colorDots = document.querySelectorAll('.color-dot');

    // Generator View Elements
    const typesMenuView = document.getElementById('types-menu-view');
    const dynamicFormView = document.getElementById('dynamic-form-view');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const formTitleText = document.getElementById('form-title-text');
    const formInputsContainer = document.getElementById('form-inputs-container');
    const generateCustomBtn = document.getElementById('generate-custom-btn');
    const qrResult = document.getElementById('qr-result');
    const typeButtons = document.querySelectorAll('.type-item-btn');

    // Scanner Elements
    const scannerLoading = document.getElementById('scanner-loading');
    let html5QrCode = null;
    let isScannerRunning = false;
    let currentFacingMode = "environment";

    // History Elements
    const historyListContainer = document.getElementById('history-list-container');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Scan Modal Elements
    const scanResultScreen = document.getElementById('scan-result-screen');
    const closeScanResultBtn = document.getElementById('close-scan-result-btn');
    const scanResultText = document.getElementById('scan-result-text');
    const scanActionBtn = document.getElementById('scan-action-btn');

    // Application State
    let currentSelectedType = 'url';
    let activeSubscriptionPlan = 'annual';

    // --- INITIALIZATION & PREFERENCES ---
    function initApp() {
        loadUserPreferences();
        setupNavigationListeners();
        setupDrawerListeners();
        setupThemeListeners();
        setupGeneratorListeners();
        setupScannerListeners();
        setupHistoryListeners();
        setupPremiumListeners();
    }

    // --- NAVIGATION LOGIC ---
    function setupNavigationListeners() {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetTab = item.dataset.target;
                switchTab(targetTab);
            });
        });

        headerPremiumBtn?.addEventListener('click', () => switchTab('premium'));
        gotoPremiumDrawerBtn?.addEventListener('click', () => switchTab('premium'));
    }

    function switchTab(targetTab) {
        navItems.forEach(item => {
            if (item.dataset.target === targetTab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        pageSections.forEach(section => {
            if (section.id === `${targetTab}-section`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        if (targetTab === 'scanner') {
            startScanner();
        } else {
            stopScanner();
        }

        if (targetTab === 'history') {
            renderHistory();
        }

        closeDrawer();
        window.scrollTo(0, 0);
    }

    // --- DRAWER & SETTINGS MANAGEMENT ---
    function setupDrawerListeners() {
        menuToggleBtn?.addEventListener('click', openDrawer);
        closeDrawerBtn?.addEventListener('click', closeDrawer);
        drawerOverlay?.addEventListener('click', closeDrawer);
    }

    function openDrawer() {
        settingsDrawer?.classList.add('open');
        drawerOverlay?.classList.add('open');
    }

    function closeDrawer() {
        settingsDrawer?.classList.remove('open');
        drawerOverlay?.classList.remove('open');
    }

    // --- THEME & COLOR CUSTOMIZATION ---
    function loadUserPreferences() {
        const savedTheme = localStorage.getItem('qr_theme') || 'dark';
        const savedColor = localStorage.getItem('qr_color') || 'indigo';

        document.documentElement.setAttribute('data-theme', savedTheme);
        document.documentElement.setAttribute('data-theme-color', savedColor);
    }

    function setupThemeListeners() {
        lightModeBtn?.addEventListener('click', () => {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('qr_theme', 'light');
        });

        darkModeBtn?.addEventListener('click', () => {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('qr_theme', 'dark');
        });

        colorDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const color = dot.dataset.color;
                document.documentElement.setAttribute('data-theme-color', color);
                localStorage.setItem('qr_color', color);
            });
        });
    }

    // --- QR GENERATOR LOGIC (ALL TYPES) ---
    function setupGeneratorListeners() {
        typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                currentSelectedType = btn.dataset.type;
                setupFormForType(currentSelectedType);
                if (typesMenuView) typesMenuView.style.display = 'none';
                if (dynamicFormView) dynamicFormView.style.display = 'block';
            });
        });

        backToMenuBtn?.addEventListener('click', () => {
            if (dynamicFormView) dynamicFormView.style.display = 'none';
            if (typesMenuView) typesMenuView.style.display = 'block';
            if (qrResult) qrResult.innerHTML = '';
        });

        generateCustomBtn?.addEventListener('click', handleGenerateQRCode);
    }

    function setupFormForType(type) {
        if (!formInputsContainer) return;
        formInputsContainer.innerHTML = '';
        if (qrResult) qrResult.innerHTML = '';

        let html = '';
        switch (type) {
            case 'url':
                if (formTitleText) formTitleText.textContent = 'Site Web (URL)';
                html = `<div class="input-group"><label>URL / Lien Web</label><input type="url" id="input-url" placeholder="https://example.com" required></div>`;
                break;
            case 'text':
                if (formTitleText) formTitleText.textContent = 'Texte Libre';
                html = `<div class="input-group"><label>Votre Texte</label><textarea id="input-text" rows="4" placeholder="Saisissez votre texte ici..."></textarea></div>`;
                break;
            case 'wifi':
                if (formTitleText) formTitleText.textContent = 'Réseau WiFi';
                html = `
                    <div class="input-group"><label>Nom du réseau (SSID)</label><input type="text" id="wifi-ssid" placeholder="Mon_WiFi"></div>
                    <div class="input-group"><label>Mot de passe</label><input type="text" id="wifi-pass" placeholder="Mot de passe"></div>
                    <div class="input-group"><label>Chiffrement</label>
                        <select id="wifi-encryption">
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">Aucun</option>
                        </select>
                    </div>
                `;
                break;
            case 'vcard':
                if (formTitleText) formTitleText.textContent = 'Carte de Visite (vCard)';
                html = `
                    <div class="input-group"><label>Prénom</label><input type="text" id="v-fname" placeholder="Mohammed"></div>
                    <div class="input-group"><label>Nom</label><input type="text" id="v-lname" placeholder="Alami"></div>
                    <div class="input-group"><label>Téléphone</label><input type="tel" id="v-phone" placeholder="+212600000000"></div>
                    <div class="input-group"><label>Email</label><input type="email" id="v-email" placeholder="contact@example.com"></div>
                    <div class="input-group"><label>Site Web</label><input type="url" id="v-web" placeholder="https://example.com"></div>
                `;
                break;
            case 'email':
                if (formTitleText) formTitleText.textContent = 'Email';
                html = `
                    <div class="input-group"><label>Destinataire</label><input type="email" id="email-to" placeholder="destinataire@example.com"></div>
                    <div class="input-group"><label>Sujet</label><input type="text" id="email-subject" placeholder="Sujet du message"></div>
                    <div class="input-group"><label>Message</label><textarea id="email-body" rows="3" placeholder="Contenu de l'email..."></textarea></div>
                `;
                break;
            case 'sms':
                if (formTitleText) formTitleText.textContent = 'Message SMS';
                html = `
                    <div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="sms-phone" placeholder="+212600000000"></div>
                    <div class="input-group"><label>Message</label><textarea id="sms-text" rows="3" placeholder="Votre message..."></textarea></div>
                `;
                break;
            case 'phone':
                if (formTitleText) formTitleText.textContent = 'Appel Téléphonique';
                html = `<div class="input-group"><label>Numéro</label><input type="tel" id="phone-num" placeholder="+212600000000"></div>`;
                break;
            case 'coordinates':
                if (formTitleText) formTitleText.textContent = 'Coordonnées GPS';
                html = `
                    <button type="button" id="get-current-loc-btn" class="primary-btn" style="background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-color); margin-bottom: 12px;">
                        <i class="fa-solid fa-location-crosshairs"></i> Utiliser ma position GPS actuelle
                    </button>
                    <div class="input-group"><label>Latitude</label><input type="number" step="any" id="input-lat" placeholder="30.4278"></div>
                    <div class="input-group"><label>Longitude</label><input type="number" step="any" id="input-lng" placeholder="-9.5981"></div>
                `;
                break;
            default:
                if (formTitleText) formTitleText.textContent = 'Générique';
                html = `<div class="input-group"><label>Valeur</label><input type="text" id="input-generic" placeholder="Saisir la valeur..."></div>`;
                break;
        }

        formInputsContainer.innerHTML = html;

        // Bind GPS Button if rendered
        const getLocBtn = document.getElementById('get-current-loc-btn');
        if (getLocBtn) {
            getLocBtn.addEventListener('click', () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(position => {
                        const latInput = document.getElementById('input-lat');
                        const lngInput = document.getElementById('input-lng');
                        if (latInput) latInput.value = position.coords.latitude;
                        if (lngInput) lngInput.value = position.coords.longitude;
                    }, err => {
                        alert('Erreur de géolocalisation: ' + err.message);
                    }, { enableHighAccuracy: true });
                } else {
                    alert('La géolocalisation n\'est pas supportée par votre navigateur.');
                }
            });
        }
    }

    function handleGenerateQRCode() {
        let qrContent = '';

        switch (currentSelectedType) {
            case 'url':
                qrContent = document.getElementById('input-url')?.value.trim();
                break;
            case 'text':
                qrContent = document.getElementById('input-text')?.value.trim();
                break;
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid')?.value.trim() || '';
                const pass = document.getElementById('wifi-pass')?.value.trim() || '';
                const enc = document.getElementById('wifi-encryption')?.value || 'WPA';
                qrContent = `WIFI:S:${ssid};T:${enc};P:${pass};;`;
                break;
            case 'vcard':
                const fname = document.getElementById('v-fname')?.value.trim() || '';
                const lname = document.getElementById('v-lname')?.value.trim() || '';
                const phone = document.getElementById('v-phone')?.value.trim() || '';
                const email = document.getElementById('v-email')?.value.trim() || '';
                const web = document.getElementById('v-web')?.value.trim() || '';
                qrContent = `BEGIN:VCARD\nVERSION:3.0\nN:${lname};${fname};;;\nFN:${fname} ${lname}\nTEL:${phone}\nEMAIL:${email}\nURL:${web}\nEND:VCARD`;
                break;
            case 'email':
                const to = document.getElementById('email-to')?.value.trim() || '';
                const subj = document.getElementById('email-subject')?.value.trim() || '';
                const body = document.getElementById('email-body')?.value.trim() || '';
                qrContent = `mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
                break;
            case 'sms':
                const smsPhone = document.getElementById('sms-phone')?.value.trim() || '';
                const smsText = document.getElementById('sms-text')?.value.trim() || '';
                qrContent = `SMSTO:${smsPhone}:${smsText}`;
                break;
            case 'phone':
                const phoneNum = document.getElementById('phone-num')?.value.trim() || '';
                qrContent = `tel:${phoneNum}`;
                break;
            case 'coordinates':
                const lat = document.getElementById('input-lat')?.value.trim() || '0';
                const lng = document.getElementById('input-lng')?.value.trim() || '0';
                qrContent = `https://www.google.com/maps?q=${lat},${lng}`;
                break;
            default:
                qrContent = document.getElementById('input-generic')?.value.trim();
                break;
        }

        if (!qrContent) {
            alert('Veuillez remplir les informations requises pour générer le QR Code.');
            return;
        }

        if (qrResult) qrResult.innerHTML = '';

        // Generate QR using qrcode.js library
        new QRCode(qrResult, {
            text: qrContent,
            width: 230,
            height: 230,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Save to History with duplicate prevention
        saveToHistory({
            type: 'created',
            category: currentSelectedType.toUpperCase(),
            content: qrContent,
            date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });
    }

    // --- QR SCANNER LOGIC (HTML5-QRCODE) ---
    function setupScannerListeners() {
        closeScanResultBtn?.addEventListener('click', () => {
            scanResultScreen?.classList.remove('active');
            if (document.getElementById('scanner-section')?.classList.contains('active')) {
                startScanner();
            }
        });
    }

    function startScanner() {
        if (isScannerRunning) return;
        if (scannerLoading) scannerLoading.style.display = 'block';

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        const config = { fps: 10, qrbox: { width: 220, height: 220 } };

        html5QrCode.start(
            { facingMode: currentFacingMode },
            config,
            onScanSuccess
        ).then(() => {
            isScannerRunning = true;
            if (scannerLoading) scannerLoading.style.display = 'none';
        }).catch(err => {
            console.error("Erreur de démarrage de la caméra:", err);
            if (scannerLoading) scannerLoading.style.display = 'none';
        });
    }

    function stopScanner() {
        if (html5QrCode && isScannerRunning) {
            html5QrCode.stop().then(() => {
                isScannerRunning = false;
            }).catch(err => console.error("Erreur d'arrêt de la caméra:", err));
        }
    }

    function onScanSuccess(decodedText) {
        if (!decodedText) return;
        stopScanner();

        saveToHistory({
            type: 'scanned',
            category: 'SCAN',
            content: decodedText,
            date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        });

        showScanModal(decodedText);
    }

    function showScanModal(text) {
        if (scanResultText) scanResultText.textContent = text;
        scanResultScreen?.classList.add('active');
    }

    // --- HISTORY MANAGEMENT ---
    function setupHistoryListeners() {
        clearHistoryBtn?.addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
                localStorage.removeItem('qr_history');
                renderHistory();
            }
        });
    }

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem('qr_history') || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveToHistory(item) {
        let history = getHistory();
        
        // Anti-duplicate logic: remove if exact same content and type already exists
        const existingIndex = history.findIndex(h => h.content === item.content && h.type === item.type);
        if (existingIndex !== -1) {
            history.splice(existingIndex, 1);
        }

        history.unshift(item);
        if (history.length > 50) history.pop();
        localStorage.setItem('qr_history', JSON.stringify(history));
    }

    function renderHistory() {
        if (!historyListContainer) return;
        const history = getHistory();

        if (history.length === 0) {
            historyListContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 40px 0; font-size: 0.9rem;">Aucun historique pour le moment.</p>`;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        history.forEach((item) => {
            const icon = item.type === 'scanned' ? 'fa-camera' : 'fa-qrcode';
            html += `
                <div class="history-item-card">
                    <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
                        <i class="fa-solid ${icon}" style="color: var(--primary); font-size: 1.1rem; flex-shrink: 0;"></i>
                        <div style="overflow: hidden;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${item.category} • ${item.date}</div>
                            <div style="font-size: 0.85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-color);">${item.content}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        historyListContainer.innerHTML = html;
    }

    // --- PREMIUM SUBSCRIPTION LOGIC ---
    function setupPremiumListeners() {
        premiumPlanCards.forEach(card => {
            card.addEventListener('click', () => {
                premiumPlanCards.forEach(c => c.classList.remove('active-plan'));
                card.classList.add('active-plan');
                activeSubscriptionPlan = card.dataset.plan;
            });
        });

        subscribeNowBtn?.addEventListener('click', () => {
            alert(`Redirection vers la passerelle de paiement sécurisée pour l'abonnement ${activeSubscriptionPlan.toUpperCase()}...`);
        });
    }

    // Run initialization
    initApp();

});