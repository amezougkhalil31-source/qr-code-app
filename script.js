// ==========================================
// 1. تسجيل الـ Service Worker (العمل بدون إنترنيت)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker enregistré avec succès !', reg))
            .catch(err => console.error('Erreur Service Worker:', err));
    });
}

// ==========================================
// 2. التطبيق الرئيسي (QR Master Pro App Logic)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // --- العناصر الرئيسية (DOM Elements) ---
    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const settingsDrawer = document.getElementById('settings-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    
    // أزرار الهيدر والـ Drawer
    const gotoGeneratorBtn = document.getElementById('goto-generator-btn');
    const gotoScannerBtn = document.getElementById('goto-scanner-btn');
    const headerPremiumBtn = document.getElementById('header-premium-btn');
    const gotoPremiumDrawerBtn = document.getElementById('goto-premium-drawer-btn');
    const shareAppBtn = document.getElementById('share-app-btn');

    // أزرار الثيم والألوان
    const lightModeBtn = document.getElementById('light-mode-btn');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const colorDots = document.querySelectorAll('.color-dot');

    // عناصر توليد الـ QR
    const typesMenuView = document.getElementById('types-menu-view');
    const dynamicFormView = document.getElementById('dynamic-form-view');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const formTitleText = document.getElementById('form-title-text');
    const formInputsContainer = document.getElementById('form-inputs-container');
    const generateCustomBtn = document.getElementById('generate-custom-btn');
    const qrResult = document.getElementById('qr-result');
    const qrSizeSelect = document.getElementById('qr-size');

    // عناصر المسح (Scanner)
    const scannerLoading = document.getElementById('scanner-loading');
    let html5QrCode = null;
    let isScannerRunning = false;

    // عناصر السجل (History)
    const historyListContainer = document.getElementById('history-list-container');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // عناصر النافذة المنبثقة (Modal)
    const scanResultScreen = document.getElementById('scan-result-screen');
    const closeScanResultBtn = document.getElementById('close-scan-result-btn');
    const scanResultCategory = document.getElementById('scan-result-category');
    const scanResultText = document.getElementById('scan-result-text');
    const scanActionCopy = document.getElementById('scan-action-copy');
    const scanActionShare = document.getElementById('scan-action-share');
    const smartOpenLinkBtn = document.getElementById('smart-open-link-btn');

    // عناصر باقات البريميوم
    const planCards = document.querySelectorAll('.premium-plan-card');
    const subscribeNowBtn = document.getElementById('subscribe-now-btn');

    let currentSelectedType = 'url';

    // ==========================================
    // 3. التنقل بين الصفحات (Navigation Logic)
    // ==========================================
    function switchTab(targetTab) {
        // تحديث أزرار الشريط السفلي
        navItems.forEach(item => {
            if (item.dataset.target === targetTab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // إظهار وإخفاء المقاطع (Sections)
        pageSections.forEach(section => {
            if (section.id === `${targetTab}-section`) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // تشغيل أو إيقاف الكاميرا حسَب الصفحة
        if (targetTab === 'scanner') {
            startScanner();
        } else {
            stopScanner();
        }

        // تحديث السجل عند فتح صفحة History
        if (targetTab === 'history') {
            renderHistory();
        }

        // إغلاق القائمة الجانبية إذا كانت مفتوحة
        closeDrawer();
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.dataset.target);
        });
    });

    gotoGeneratorBtn?.addEventListener('click', () => switchTab('generator'));
    gotoScannerBtn?.addEventListener('click', () => switchTab('scanner'));
    headerPremiumBtn?.addEventListener('click', () => switchTab('premium'));
    gotoPremiumDrawerBtn?.addEventListener('click', () => switchTab('premium'));

    // ==========================================
    // 4. القائمة الجانبية (Drawer Logic)
    // ==========================================
    function openDrawer() {
        settingsDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
    }

    function closeDrawer() {
        settingsDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
    }

    menuToggleBtn?.addEventListener('click', openDrawer);
    closeDrawerBtn?.addEventListener('click', closeDrawer);
    drawerOverlay?.addEventListener('click', closeDrawer);

    // ==========================================
    // 5. الثيم والألوان (Theme & Color Customization)
    // ==========================================
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

    // ==========================================
    // 6. توليد الـ QR Code (Generator Logic)
    // ==========================================
    const typeButtons = document.querySelectorAll('.type-item-btn');
    
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentSelectedType = btn.dataset.type;
            setupFormForType(currentSelectedType);
            typesMenuView.style.display = 'none';
            dynamicFormView.style.display = 'block';
        });
    });

    backToMenuBtn?.addEventListener('click', () => {
        dynamicFormView.style.display = 'none';
        typesMenuView.style.display = 'grid';
        qrResult.innerHTML = '';
    });

    function setupFormForType(type) {
        formInputsContainer.innerHTML = '';
        qrResult.innerHTML = '';

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

        formTitleText.textContent = typeTitles[type] || 'Créer';

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
            html = `<div class="input-group"><label>Numéro de Téléphone</label><input type="tel" id="input-phone" placeholder="+33600000000"></div>`;
        } else if (type === 'email') {
            html = `
                <div class="input-group"><label>Destinataire</label><input type="email" id="input-email-to" placeholder="exemple@mail.com"></div>
                <div class="input-group"><label>Sujet</label><input type="text" id="input-email-sub" placeholder="Sujet du message"></div>
                <div class="input-group"><label>Message</label><textarea id="input-email-body" rows="3" placeholder="Corps du message..."></textarea></div>
            `;
        } else if (type === 'sms') {
            html = `
                <div class="input-group"><label>Numéro</label><input type="tel" id="input-sms-num" placeholder="+33600000000"></div>
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
                <div class="input-group"><label>Latitude</label><input type="number" step="any" id="input-lat" placeholder="48.8566"></div>
                <div class="input-group"><label>Longitude</label><input type="number" step="any" id="input-lng" placeholder="2.3522"></div>
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
            const fn = document.getElementById('input-fn')?.value.trim();
            const tel = document.getElementById('input-tel')?.value.trim();
            const email = document.getElementById('input-email')?.value.trim();
            qrContent = `BEGIN:VCARD\nVERSION:3.0\nN:${fn}\nTEL:${tel}\nEMAIL:${email}\nEND:VCARD`;
        } else if (currentSelectedType === 'phone') {
            qrContent = `tel:${document.getElementById('input-phone')?.value.trim()}`;
        } else if (currentSelectedType === 'email') {
            const to = document.getElementById('input-email-to')?.value.trim();
            const sub = encodeURIComponent(document.getElementById('input-email-sub')?.value.trim());
            const body = encodeURIComponent(document.getElementById('input-email-body')?.value.trim());
            qrContent = `mailto:${to}?subject=${sub}&body=${body}`;
        } else if (currentSelectedType === 'sms') {
            const num = document.getElementById('input-sms-num')?.value.trim();
            const body = encodeURIComponent(document.getElementById('input-sms-body')?.value.trim());
            qrContent = `smsto:${num}:${body}`;
        } else if (currentSelectedType === 'wifi') {
            const ssid = document.getElementById('input-wifi-ssid')?.value.trim();
            const pass = document.getElementById('input-wifi-pass')?.value.trim();
            const type = document.getElementById('input-wifi-type')?.value;
            qrContent = `WIFI:S:${ssid};T:${type};P:${pass};;`;
        } else if (currentSelectedType === 'coordinates') {
            const lat = document.getElementById('input-lat')?.value.trim();
            const lng = document.getElementById('input-lng')?.value.trim();
            qrContent = `geo:${lat},${lng}`;
        } else if (currentSelectedType === 'clipboard') {
            qrContent = document.getElementById('input-clip')?.value.trim();
        }

        if (!qrContent) {
            alert('Veuillez remplir les champs nécessaires.');
            return;
        }

        qrResult.innerHTML = '';
        const size = parseInt(qrSizeSelect.value) || 300;

        new QRCode(qrResult, {
            text: qrContent,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // حفظ العمل داخل السجل (History)
        saveToHistory({
            type: 'created',
            category: currentSelectedType.toUpperCase(),
            content: qrContent,
            date: new Date().toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
    });

    // ==========================================
    // 7. ماسح الكود (Scanner Logic)
    // ==========================================
    function startScanner() {
        if (isScannerRunning) return;

        if (scannerLoading) scannerLoading.style.display = 'block';

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess
        ).then(() => {
            isScannerRunning = true;
            if (scannerLoading) scannerLoading.style.display = 'none';
        }).catch(err => {
            console.error("Erreur d'ouverture de la caméra:", err);
            if (scannerLoading) scannerLoading.style.display = 'none';
        });
    }

    function stopScanner() {
        if (html5QrCode && isScannerRunning) {
            html5QrCode.stop().then(() => {
                isScannerRunning = false;
            }).catch(err => console.error("Erreur d'arrêt du scanner:", err));
        }
    }

    function onScanSuccess(decodedText) {
        stopScanner();
        
        saveToHistory({
            type: 'scanned',
            category: 'SCAN',
            content: decodedText,
            date: new Date().toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });

        showScanModal(decodedText);
    }

    // ==========================================
    // 8. النافذة المنبثقة للنتائج (Scan Result Modal)
    // ==========================================
    function showScanModal(text) {
        scanResultText.textContent = text;
        scanResultCategory.textContent = 'RÉSULTAT';

        if (text.startsWith('http://') || text.startsWith('https://')) {
            smartOpenLinkBtn.style.display = 'flex';
            smartOpenLinkBtn.onclick = () => window.open(text, '_blank');
        } else {
            smartOpenLinkBtn.style.display = 'none';
        }

        scanResultScreen.classList.add('active');
    }

    closeScanResultBtn?.addEventListener('click', () => {
        scanResultScreen.classList.remove('active');
        if (document.getElementById('scanner-section').classList.contains('active')) {
            startScanner();
        }
    });

    scanActionCopy?.addEventListener('click', () => {
        navigator.clipboard.writeText(scanResultText.textContent).then(() => {
            alert('Copié dans le presse-papiers !');
        });
    });

    scanActionShare?.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'QR Code Result',
                text: scanResultText.textContent
            });
        } else {
            alert('Le partage n\'est pas supporté sur ce navigateur.');
        }
    });

    // ==========================================
    // 9. إدارة السجل (History LocalStorage)
    // ==========================================
    function getHistory() {
        return JSON.parse(localStorage.getItem('qr_history') || '[]');
    }

    function saveToHistory(item) {
        const history = getHistory();
        history.unshift(item); // إضافة العنصر فـ الأول
        if (history.length > 50) history.pop(); // الاحتفاظ بآخر 50 عنصر فقط
        localStorage.setItem('qr_history', JSON.stringify(history));
    }

    function renderHistory() {
        const history = getHistory();
        if (history.length === 0) {
            historyListContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 30px 0;">Aucun historique pour le moment.</p>`;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        history.forEach((item, index) => {
            const icon = item.type === 'scanned' ? 'fa-camera' : 'fa-qrcode';
            html += `
                <div class="history-item-card" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
                        <i class="fa-solid ${icon}" style="color: var(--primary); font-size: 1.2rem;"></i>
                        <div style="overflow: hidden;">
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${item.category} • ${item.date}</div>
                            <div style="font-size: 0.9rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.content}</div>
                        </div>
                    </div>
                    <button class="icon-btn copy-hist-btn" data-content="${item.content}" title="Copier"><i class="fa-solid fa-copy"></i></button>
                </div>
            `;
        });
        html += '</div>';

        historyListContainer.innerHTML = html;

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

    // ==========================================
    // 10. باقات البريميوم والمشاركة (Premium & Share)
    // ==========================================
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