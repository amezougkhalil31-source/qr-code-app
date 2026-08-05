// ==========================================
// QR Master Pro - Complete & Ultimate script.js
// ==========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.error('Erreur Service Worker:', err));
    });
}

document.addEventListener('DOMContentLoaded', () => {

    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const settingsDrawer = document.getElementById('settings-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    
    const headerPremiumBtn = document.getElementById('header-premium-btn');
    const gotoPremiumDrawerBtn = document.getElementById('goto-premium-drawer-btn');
    const shareAppBtn = document.getElementById('share-app-btn');

    const lightModeBtn = document.getElementById('light-mode-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const colorDots = document.querySelectorAll('.color-dot');

    const typesMenuView = document.getElementById('types-menu-view');
    const dynamicFormView = document.getElementById('dynamic-form-view');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const formTitleText = document.getElementById('form-title-text');
    const formInputsContainer = document.getElementById('form-inputs-container');
    const generateCustomBtn = document.getElementById('generate-custom-btn');
    const qrResult = document.getElementById('qr-result');
    const qrSizeSelect = document.getElementById('qr-size');

    const scannerLoading = document.getElementById('scanner-loading');
    let html5QrCode = null;
    let isScannerRunning = false;
    let currentFacingMode = "environment";

    const historyListContainer = document.getElementById('history-list-container');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    const scanResultScreen = document.getElementById('scan-result-screen');
    const closeScanResultBtn = document.getElementById('close-scan-result-btn');
    const scanResultCategory = document.getElementById('scan-result-category');
    const scanResultText = document.getElementById('scan-result-text');
    const scanActionCopy = document.getElementById('scan-action-copy');
    const scanActionShare = document.getElementById('scan-action-share');
    const smartOpenLinkBtn = document.getElementById('smart-open-link-btn');

    const planCards = document.querySelectorAll('.premium-plan-card');
    const subscribeNowBtn = document.getElementById('subscribe-now-btn');

    let currentSelectedType = 'url';

    function switchTab(targetTab) {
        navItems.forEach(item => {
            if (item.dataset.target === targetTab) item.classList.add('active');
            else item.classList.remove('active');
        });

        pageSections.forEach(section => {
            if (section.id === `${targetTab}-section`) section.classList.add('active');
            else section.classList.remove('active');
        });

        if (targetTab === 'scanner') startScanner();
        else stopScanner();

        if (targetTab === 'history') renderHistory();

        closeDrawer();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.target));
    });

    headerPremiumBtn?.addEventListener('click', () => switchTab('premium'));
    gotoPremiumDrawerBtn?.addEventListener('click', () => switchTab('premium'));

    function openDrawer() {
        settingsDrawer?.classList.add('open');
        drawerOverlay?.classList.add('open');
    }

    function closeDrawer() {
        settingsDrawer?.classList.remove('open');
        drawerOverlay?.classList.remove('open');
    }

    menuToggleBtn?.addEventListener('click', openDrawer);
    closeDrawerBtn?.addEventListener('click', closeDrawer);
    drawerOverlay?.addEventListener('click', closeDrawer);

    const savedTheme = localStorage.getItem('qr_theme') || 'dark';
    const savedColor = localStorage.getItem('qr_color') || 'indigo';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-theme-color', savedColor);

    if (savedTheme === 'light') {
        lightModeBtn?.classList.add('active');
        darkModeBtn?.classList.remove('active');
    } else {
        darkModeBtn?.classList.add('active');
        lightModeBtn?.classList.remove('active');
    }

    lightModeBtn?.addEventListener('click', () => {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('qr_theme', 'light');
        lightModeBtn.classList.add('active');
        darkModeBtn.classList.remove('active');
    });

    darkModeBtn?.addEventListener('click', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('qr_theme', 'dark');
        darkModeBtn.classList.add('active');
        lightModeBtn.classList.remove('active');
    });

    colorDots.forEach(dot => {
        if (dot.dataset.color === savedColor) dot.classList.add('active');
        else dot.classList.remove('active');

        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            const color = dot.dataset.color;
            document.documentElement.setAttribute('data-theme-color', color);
            localStorage.setItem('qr_color', color);
        });
    });

    const typeButtons = document.querySelectorAll('.type-item-btn');
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

    function setupFormForType(type) {
        if (!formInputsContainer) return;
        formInputsContainer.innerHTML = '';
        if (qrResult) qrResult.innerHTML = '';

        const typeTitles = {
            url: 'Lien Web (URL)',
            text: 'Texte Simple',
            contact: 'Carte de Contact (vCard)',
            email: 'Adresse Email',
            sms: 'Message SMS',
            coordinates: 'Coordonnées GPS',
            phone: 'Numéro de Téléphone',
            wifi: 'Réseau Wi-Fi',
            agenda: 'Événement Agenda',
            clipboard: 'Presse-papiers'
        };

        if (formTitleText) formTitleText.textContent = typeTitles[type] || 'Créer';

        let html = '';
        if (type === 'url') {
            html = `<div class="input-group"><label>URL / Site Web</label><input type="url" id="input-url" placeholder="https://example.com" required></div>`;
        } else if (type === 'text') {
            html = `<div class="input-group"><label>Votre Texte</label><textarea id="input-text" rows="4" placeholder="Entrez votre texte ici..."></textarea></div>`;
        } else if (type === 'contact') {
            html = `
                <div class="input-group"><label>Nom Complet</label><input type="text" id="input-fn" placeholder="ex: Jean Dupont"></div>
                <div class="input-group"><label>Téléphone</label><input type="tel" id="input-tel" placeholder="+33 6 00 00 00 00"></div>
                <div class="input-group"><label>Email</label><input type="email" id="input-email" placeholder="jean@example.com"></div>
            `;
        } else if (type === 'phone') {
            html = `<div class="input-group"><label>Numéro de Téléphone</label><input type="tel" id="input-phone" placeholder="+212600000000"></div>`;
        } else if (type === 'email') {
            html = `
                <div class="input-group"><label>Destinataire</label><input type="email" id="input-email-to" placeholder="exemple@mail.com"></div>
                <div class="input-group"><label>Sujet</label><input type="text" id="input-email-sub" placeholder="Sujet du message"></div>
                <div class="input-group"><label>Message</label><textarea id="input-email-body" rows="3" placeholder="Corps du message..."></textarea></div>
            `;
        } else if (type === 'sms') {
            html = `
                <div class="input-group"><label>Numéro</label><input type="tel" id="input-sms-num" placeholder="+212600000000"></div>
                <div class="input-group"><label>Message</label><textarea id="input-sms-body" rows="3" placeholder="Votre SMS..."></textarea></div>
            `;
        } else if (type === 'wifi') {
            html = `
                <div class="input-group"><label>Nom du Réseau (SSID)</label><input type="text" id="input-wifi-ssid" placeholder="MonReseauWiFi"></div>
                <div class="input-group"><label>Mot de passe</label><input type="password" id="input-wifi-pass" placeholder="••••••••"></div>
                <div class="input-group"><label>Sécurité</label>
                    <select id="input-wifi-type">
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Aucune</option>
                    </select>
                </div>
            `;
        } else if (type === 'coordinates') {
            html = `
                <div class="input-group"><label>Latitude (ex: 30.4278)</label><input type="number" step="any" id="input-lat" placeholder="30.4278"></div>
                <div class="input-group"><label>Longitude (ex: -9.5981)</label><input type="number" step="any" id="input-lng" placeholder="-9.5981"></div>
            `;
        } else if (type === 'agenda') {
            html = `
                <div class="input-group"><label>Titre de l'événement</label><input type="text" id="input-cal-title" placeholder="Réunion importante"></div>
                <div class="input-group"><label>Date de début</label><input type="datetime-local" id="input-cal-start"></div>
                <div class="input-group"><label>Date de fin</label><input type="datetime-local" id="input-cal-end"></div>
            `;
        } else if (type === 'clipboard') {
            html = `<div class="input-group"><label>Contenu du presse-papiers</label><textarea id="input-clip" rows="3"></textarea></div>`;
            navigator.clipboard?.readText().then(text => {
                const clipElem = document.getElementById('input-clip');
                if (clipElem && text) clipElem.value = text;
            }).catch(() => {});
        }

        formInputsContainer.innerHTML = html;
    }

    generateCustomBtn?.addEventListener('click', () => {
        let qrContent = '';

        if (currentSelectedType === 'url') {
            qrContent = document.getElementById('input-url')?.value.trim();
        } else if (currentSelectedType === 'text') {
            qrContent = document.getElementById('input-text')?.value.trim();
        } else if (currentSelectedType === 'contact') {
            const fn = document.getElementById('input-fn')?.value.trim() || '';
            const tel = document.getElementById('input-tel')?.value.trim() || '';
            const email = document.getElementById('input-email')?.value.trim() || '';
            qrContent = `BEGIN:VCARD\nVERSION:3.0\nN:${fn}\nTEL:${tel}\nEMAIL:${email}\nEND:VCARD`;
        } else if (currentSelectedType === 'phone') {
            const phoneVal = document.getElementById('input-phone')?.value.trim() || '';
            qrContent = `tel:${phoneVal}`;
        } else if (currentSelectedType === 'email') {
            const to = document.getElementById('input-email-to')?.value.trim() || '';
            const sub = encodeURIComponent(document.getElementById('input-email-sub')?.value.trim() || '');
            const body = encodeURIComponent(document.getElementById('input-email-body')?.value.trim() || '');
            qrContent = `mailto:${to}?subject=${sub}&body=${body}`;
        } else if (currentSelectedType === 'sms') {
            const num = document.getElementById('input-sms-num')?.value.trim() || '';
            const body = encodeURIComponent(document.getElementById('input-sms-body')?.value.trim() || '');
            qrContent = `smsto:${num}:${body}`;
        } else if (currentSelectedType === 'wifi') {
            const ssid = document.getElementById('input-wifi-ssid')?.value.trim() || '';
            const pass = document.getElementById('input-wifi-pass')?.value.trim() || '';
            const type = document.getElementById('input-wifi-type')?.value || 'WPA';
            qrContent = `WIFI:S:${ssid};T:${type};P:${pass};;`;
        } else if (currentSelectedType === 'coordinates') {
            const lat = document.getElementById('input-lat')?.value.trim() || '0';
            const lng = document.getElementById('input-lng')?.value.trim() || '0';
            qrContent = `geo:${lat},${lng}?q=${lat},${lng}`;
        } else if (currentSelectedType === 'agenda') {
            const title = document.getElementById('input-cal-title')?.value.trim() || 'Événement';
            const start = document.getElementById('input-cal-start')?.value.replace(/[-:]/g, '') || '';
            const end = document.getElementById('input-cal-end')?.value.replace(/[-:]/g, '') || '';
            qrContent = `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${start}Z\nDTEND:${end}Z\nEND:VEVENT`;
        } else if (currentSelectedType === 'clipboard') {
            qrContent = document.getElementById('input-clip')?.value.trim() || '';
        }

        if (!qrContent) {
            alert('Veuillez remplir les champs nécessaires.');
            return;
        }

        if (qrResult) qrResult.innerHTML = '';
        const size = parseInt(qrSizeSelect?.value) || 250;

        new QRCode(qrResult, {
            text: qrContent,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        saveToHistory({
            type: 'created',
            category: currentSelectedType.toUpperCase(),
            content: qrContent,
            date: new Date().toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
    });

    function startScanner() {
        if (isScannerRunning) return;
        if (scannerLoading) scannerLoading.style.display = 'block';

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: currentFacingMode },
            config,
            onScanSuccess
        ).then(() => {
            isScannerRunning = true;
            if (scannerLoading) scannerLoading.style.display = 'none';
        }).catch(err => {
            console.error("Erreur caméra:", err);
            if (scannerLoading) scannerLoading.style.display = 'none';
        });
    }

    function stopScanner() {
        if (html5QrCode && isScannerRunning) {
            html5QrCode.stop().then(() => {
                isScannerRunning = false;
            }).catch(err => console.error("Erreur arrêt scanner:", err));
        }
    }

    const switchCameraBtn = document.getElementById('switch-camera-btn');
    switchCameraBtn?.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
        stopScanner();
        setTimeout(startScanner, 350);
    });

    const galleryInput = document.getElementById('gallery-file-input');
    const scanGalleryBtn = document.getElementById('scan-gallery-btn');
    
    scanGalleryBtn?.addEventListener('click', () => galleryInput?.click());

    galleryInput?.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const imageFile = e.target.files[0];
            if (!html5QrCode) {
                html5QrCode = new Html5Qrcode("reader");
            }
            html5QrCode.scanFile(imageFile, true)
                .then(decodedText => {
                    onScanSuccess(decodedText);
                })
                .catch(() => {
                    alert("Impossible de lire un QR Code à partir de cette image.");
                });
        }
    });

    function onScanSuccess(decodedText) {
        if (!decodedText) return;
        stopScanner();
        
        saveToHistory({
            type: 'scanned',
            category: 'SCAN',
            content: decodedText,
            date: new Date().toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });

        showScanModal(decodedText);
    }

    function showScanModal(text) {
        if (!text) text = "";
        if (scanResultText) scanResultText.textContent = text;
        if (scanResultCategory) scanResultCategory.textContent = 'RÉSULTAT';

        if (smartOpenLinkBtn) {
            smartOpenLinkBtn.style.display = 'flex';
            
            if (text.startsWith('http://') || text.startsWith('https://')) {
                smartOpenLinkBtn.innerHTML = `<i class="fa-solid fa-globe"></i> <span>Ouvrir le lien web</span>`;
                smartOpenLinkBtn.onclick = () => window.open(text, '_blank');
            } else if (text.startsWith('tel:') || /^\+?[0-9\s\-\(\)]{7,}$/.test(text)) {
                const phoneNum = text.startsWith('tel:') ? text : `tel:${text}`;
                smartOpenLinkBtn.innerHTML = `<i class="fa-solid fa-phone"></i> <span>Appeler / Enregistrer le numéro</span>`;
                smartOpenLinkBtn.onclick = () => window.location.href = phoneNum;
            } else if (text.startsWith('mailto:') || text.includes('@')) {
                const mailLink = text.startsWith('mailto:') ? text : `mailto:${text}`;
                smartOpenLinkBtn.innerHTML = `<i class="fa-solid fa-envelope"></i> <span>Envoyer un Email</span>`;
                smartOpenLinkBtn.onclick = () => window.location.href = mailLink;
            } else if (text.startsWith('BEGIN:VEVENT')) {
                smartOpenLinkBtn.innerHTML = `<i class="fa-solid fa-calendar-days"></i> <span>Ajouter à l'Agenda</span>`;
                smartOpenLinkBtn.onclick = () => {
                    const blob = new Blob([text], { type: 'text/calendar' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'event.ics';
                    a.click();
                };
            } else if (text.startsWith('BEGIN:VCARD')) {
                smartOpenLinkBtn.innerHTML = `<i class="fa-solid fa-address-book"></i> <span>Ajouter aux Contacts</span>`;
                smartOpenLinkBtn.onclick = () => {
                    const blob = new Blob([text], { type: 'text/vcard' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'contact.vcf';
                    a.click();
                };
            } else if (text.startsWith('geo:')) {
                smartOpenLinkBtn.innerHTML = `<i class="fa-solid fa-location-dot"></i> <span>Ouvrir sur la carte GPS</span>`;
                smartOpenLinkBtn.onclick = () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text.replace('geo:', ''))}`, '_blank');
            } else {
                smartOpenLinkBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> <span>Rechercher sur Google</span>`;
                smartOpenLinkBtn.onclick = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank');
            }
        }

        scanResultScreen?.classList.add('active');
    }

    closeScanResultBtn?.addEventListener('click', () => {
        scanResultScreen?.classList.remove('active');
        if (document.getElementById('scanner-section')?.classList.contains('active')) {
            startScanner();
        }
    });

    scanActionCopy?.addEventListener('click', () => {
        if (scanResultText) {
            navigator.clipboard.writeText(scanResultText.textContent).then(() => {
                alert('Copié dans le presse-papiers !');
            });
        }
    });

    scanActionShare?.addEventListener('click', () => {
        if (navigator.share && scanResultText) {
            navigator.share({
                title: 'QR Code Result',
                text: scanResultText.textContent
            });
        } else {
            alert('Le partage n\'est pas supporté.');
        }
    });

    let qrPopModal = document.getElementById('qr-pop-modal');
    if (!qrPopModal) {
        qrPopModal = document.createElement('div');
        qrPopModal.id = 'qr-pop-modal';
        qrPopModal.className = 'qr-pop-modal';
        qrPopModal.innerHTML = `
            <div class="qr-pop-content">
                <button id="close-qr-pop-btn" class="icon-btn" style="position: absolute; top: 12px; right: 12px; background: var(--hover-bg); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; color: var(--text-color);"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-bottom: 15px; font-size: 1rem; color: var(--text-color);">Ouvrir le Code QR</h3>
                <div id="qr-pop-container" style="display: flex; justify-content: center; padding: 10px; background: #fff; border-radius: 10px;"></div>
            </div>
        `;
        document.body.appendChild(qrPopModal);
    }

    const popContainer = document.getElementById('qr-pop-container');
    const closePopBtn = document.getElementById('close-qr-pop-btn');

    closePopBtn?.addEventListener('click', () => {
        if (qrPopModal) qrPopModal.style.display = 'none';
    });

    qrPopModal?.addEventListener('click', (e) => {
        if (e.target === qrPopModal) qrPopModal.style.display = 'none';
    });

    function showQRPopup(content) {
        if (!popContainer) return;
        popContainer.innerHTML = '';
        new QRCode(popContainer, {
            text: content,
            width: 220,
            height: 220,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        if (qrPopModal) qrPopModal.style.display = 'flex';
    }

    function getHistory() {
        return JSON.parse(localStorage.getItem('qr_history') || '[]');
    }

    function saveToHistory(item) {
        const history = getHistory();
        history.unshift(item);
        if (history.length > 50) history.pop();
        localStorage.setItem('qr_history', JSON.stringify(history));
    }

    function renderHistory() {
        if (!historyListContainer) return;
        const history = getHistory();
        if (history.length === 0) {
            historyListContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 30px 0;">Aucun historique pour le moment.</p>`;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        history.forEach((item) => {
            const icon = item.type === 'scanned' ? 'fa-camera' : 'fa-qrcode';
            html += `
                <div class="history-item-card" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 12px; overflow: hidden; flex: 1;">
                        <i class="fa-solid ${icon}" style="color: var(--primary); font-size: 1.2rem; flex-shrink: 0;"></i>
                        <div style="overflow: hidden; flex: 1;">
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${item.category} • ${item.date}</div>
                            <div style="font-size: 0.9rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-color);">${item.content}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; flex-shrink: 0;">
                        <button class="icon-btn open-qr-pop-btn" data-content="${item.content}" title="Ouvrir le code QR" style="background: var(--hover-bg); color: var(--primary); width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-qrcode"></i></button>
                        <button class="icon-btn copy-hist-btn" data-content="${item.content}" title="Copier" style="background: var(--hover-bg); color: var(--text-color); width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-copy"></i></button>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        historyListContainer.innerHTML = html;

        document.querySelectorAll('.open-qr-pop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showQRPopup(btn.dataset.content);
            });
        });

        document.querySelectorAll('.copy-hist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(btn.dataset.content).then(() => alert('Copié !'));
            });
        });
    }

    clearHistoryBtn?.addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
            localStorage.removeItem('qr_history');
            renderHistory();
        }
    });

    planCards.forEach(card => {
        card.addEventListener('click', () => {
            planCards.forEach(c => c.classList.remove('active-plan'));
            card.classList.add('active-plan');
        });
    });

    subscribeNowBtn?.addEventListener('click', () => {
        alert('Cette fonctionnalité sera disponible prochainement via Google Play Billing.');
    });

    shareAppBtn?.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'QR Master Pro',
                text: 'Découvrez QR Master Pro pour scanner et créer vos QR Codes facilement !',
                url: window.location.href
            });
        } else {
            alert('Partagez ce lien: ' + window.location.href);
        }
    });

});