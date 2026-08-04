document.addEventListener('DOMContentLoaded', () => {
    // --- المتغيرات العامة ---
    let html5QrCode = null;
    let currentTheme = localStorage.getItem('qr_master_theme') || 'dark';
    let currentColor = localStorage.getItem('qr_master_color') || 'indigo';

    // تطبيق الثيم واللون المحفوظين
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-theme-color', currentColor);

    // --- التنقل بين الأقسام (Navigation) ---
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const sections = document.querySelectorAll('.app-main .page-section');

    function switchSection(targetId) {
        navItems.forEach(nav => {
            if (nav.getAttribute('data-target') === targetId) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        sections.forEach(sec => {
            if (sec.id === targetId + '-section') {
                sec.classList.add('active');
                // إذا انتقلنا لواجهة الماسح، نبدأ الكاميرا فوراً
                if (targetId === 'scanner') {
                    startScanner();
                } else {
                    stopScanner();
                }
            } else {
                sec.classList.remove('active');
                if (sec.id === 'scanner-section') {
                    stopScanner();
                }
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchSection(target);
        });
    });

    // أزرار الوصول السريع في الهيدر
    const gotoScannerBtn = document.getElementById('goto-scanner-btn');
    if (gotoScannerBtn) {
        gotoScannerBtn.addEventListener('click', () => switchSection('scanner'));
    }

    const gotoGeneratorBtn = document.getElementById('goto-generator-btn');
    if (gotoGeneratorBtn) {
        gotoGeneratorBtn.addEventListener('click', () => switchSection('generator'));
    }

    const headerPremiumBtn = document.getElementById('header-premium-btn');
    if (headerPremiumBtn) {
        headerPremiumBtn.addEventListener('click', () => switchSection('premium'));
    }

    const gotoDrawerPremiumBtn = document.getElementById('goto-premium-drawer-btn');
    if (gotoDrawerPremiumBtn) {
        gotoDrawerPremiumBtn.addEventListener('click', () => {
            closeDrawer();
            switchSection('premium');
        });
    }

    // --- القائمة الجانبية (Drawer Settings) ---
    const drawerOverlay = document.getElementById('drawer-overlay');
    const settingsDrawer = document.getElementById('settings-drawer');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');

    function openDrawer() {
        if (settingsDrawer) settingsDrawer.classList.add('open');
        if (drawerOverlay) drawerOverlay.classList.add('active');
    }

    function closeDrawer() {
        if (settingsDrawer) settingsDrawer.classList.remove('open');
        if (drawerOverlay) drawerOverlay.classList.remove('active');
    }

    if (menuToggleBtn) menuToggleBtn.addEventListener('click', openDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    // تبديل الثيم (Dark / Light)
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const lightModeBtn = document.getElementById('light-mode-btn');

    if (darkModeBtn && lightModeBtn) {
        if (currentTheme === 'light') {
            lightModeBtn.classList.add('active');
            darkModeBtn.classList.remove('active');
        } else {
            darkModeBtn.classList.add('active');
            lightModeBtn.classList.remove('active');
        }

        darkModeBtn.addEventListener('click', () => {
            currentTheme = 'dark';
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('qr_master_theme', 'dark');
            darkModeBtn.classList.add('active');
            lightModeBtn.classList.remove('active');
        });

        lightModeBtn.addEventListener('click', () => {
            currentTheme = 'light';
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('qr_master_theme', 'light');
            lightModeBtn.classList.add('active');
            darkModeBtn.classList.remove('active');
        });
    }

    // اختيار ألوان الواجهة
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
        if (dot.getAttribute('data-color') === currentColor) {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            currentColor = dot.getAttribute('data-color');
            document.documentElement.setAttribute('data-theme-color', currentColor);
            localStorage.setItem('qr_master_color', currentColor);
        });
    });

    // مشاركة التطبيق
    const shareAppBtn = document.getElementById('share-app-btn');
    if (shareAppBtn) {
        shareAppBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'QR Master Pro',
                    text: 'Découvrez la meilleure application de création et de scan de QR Code !',
                    url: window.location.href
                }).catch(() => {});
            } else {
                alert("Lien copié dans le presse-papiers !");
            }
        });
    }

    // --- إدارة الماسح الضوئي (Scanner System الفوري) ---
    function startScanner() {
        const readerElement = document.getElementById('reader');
        if (!readerElement) return;

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        if (html5QrCode.isScanning) return;

        const qrCodeSuccessCallback = (decodedText) => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    processSmartScanResult(decodedText);
                }).catch(() => {
                    processSmartScanResult(decodedText);
                });
            } else {
                processSmartScanResult(decodedText);
            }
        };

        const config = { fps: 15, qrbox: { width: 230, height: 230 } };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback,
            () => {}
        ).catch(() => {
            Html5Qrcode.getCameras().then(devices => {
                if (devices && devices.length > 0) {
                    html5QrCode.start(devices[0].id, config, qrCodeSuccessCallback, () => {});
                }
            }).catch(() => {});
        });
    }

    function stopScanner() {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(() => {});
        }
    }

    // --- التحليل الذكي لنتائج الماسح ---
    function processSmartScanResult(text) {
        let cleanText = text.trim();
        let typeCat = 'texte';
        let actionUrl = '';

        if (cleanText.startsWith('http://') || cleanText.startsWith('https://')) {
            typeCat = 'url';
            actionUrl = cleanText;
        } else if (cleanText.startsWith('tel:')) {
            typeCat = 'téléphone';
            actionUrl = cleanText;
        } else if (cleanText.startsWith('mailto:')) {
            typeCat = 'email';
            actionUrl = cleanText;
        } else if (cleanText.startsWith('SMSTO:') || cleanText.startsWith('sms:')) {
            typeCat = 'sms';
            actionUrl = cleanText;
        }

        saveToHistory(typeCat, cleanText);

        if (actionUrl) {
            if (confirm(`QR Code détecté (${typeCat.toUpperCase()}) :\n${cleanText}\n\nVoulez-vous l'ouvrir ?`)) {
                window.location.href = actionUrl;
            } else {
                startScanner();
            }
        } else {
            const scanResultScreen = document.getElementById('scan-result-screen');
            const scanResultText = document.getElementById('scan-result-text');
            const scanResultCategory = document.getElementById('scan-result-category');
            const smartOpenBtn = document.getElementById('smart-open-link-btn');

            if (scanResultScreen && scanResultText) {
                scanResultScreen.classList.add('active');
                scanResultText.textContent = cleanText;
                if (scanResultCategory) scanResultCategory.textContent = typeCat.toUpperCase();
                if (smartOpenBtn) smartOpenBtn.style.display = 'none';
            }
        }
    }

    // إغلاق نافذة النتيجة
    const closeScanResultBtn = document.getElementById('close-scan-result-btn');
    const scanResultScreen = document.getElementById('scan-result-screen');
    if (closeScanResultBtn && scanResultScreen) {
        closeScanResultBtn.addEventListener('click', () => {
            scanResultScreen.classList.remove('active');
            startScanner();
        });
    }

    // أزرار النسخ والمشاركة لنتيجة السكن
    const scanActionCopy = document.getElementById('scan-action-copy');
    const scanResultText = document.getElementById('scan-result-text');
    if (scanActionCopy && scanResultText) {
        scanActionCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(scanResultText.textContent);
            alert('Copié dans le presse-papiers !');
        });
    }

    const scanActionShare = document.getElementById('scan-action-share');
    if (scanActionShare && scanResultText) {
        scanActionShare.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({ text: scanResultText.textContent }).catch(() => {});
            } else {
                alert('Partage non supporté.');
            }
        });
    }

    // --- نظام حفظ التاريخ (History) ---
    function saveToHistory(type, content) {
        let history = JSON.parse(localStorage.getItem('qr_master_history') || '[]');
        history.unshift({ type, content, date: new Date().toLocaleDateString() });
        if (history.length > 50) history.pop(); // الاحتفاظ بأحدث 50 سجل
        localStorage.setItem('qr_master_history', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const container = document.getElementById('history-list-container');
        if (!container) return;

        let history = JSON.parse(localStorage.getItem('qr_master_history') || '[]');
        if (history.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 20px;">Aucun historique pour le moment.</p>';
            return;
        }

        container.innerHTML = history.map((item, index) => `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span class="badge" style="font-size: 0.7rem; background: var(--primary); color: #fff; padding: 2px 6px; border-radius: 4px;">${item.type.toUpperCase()}</span>
                    <p style="margin: 6px 0 2px 0; word-break: break-all; font-size: 0.9rem;">${item.content}</p>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">${item.date}</small>
                </div>
                <button class="icon-btn" onclick="deleteHistoryItem(${index})" title="Supprimer"><i class="fa-solid fa-trash" style="font-size: 0.9rem; color: var(--text-muted);"></i></button>
            </div>
        `).join('');
    }

    window.deleteHistoryItem = function(index) {
        let history = JSON.parse(localStorage.getItem('qr_master_history') || '[]');
        history.splice(index, 1);
        localStorage.setItem('qr_master_history', JSON.stringify(history));
        renderHistory();
    };

    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm("Voulez-vous vraiment vider tout l'historique ?")) {
                localStorage.removeItem('qr_master_history');
                renderHistory();
            }
        });
    }

    renderHistory();

    // --- مولد الـ QR Code (Generator System) ---
    const typesMenuView = document.getElementById('types-menu-view');
    const dynamicFormView = document.getElementById('dynamic-form-view');
    const formTitleText = document.getElementById('form-title-text');
    const formInputsContainer = document.getElementById('form-inputs-container');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const generateCustomBtn = document.getElementById('generate-custom-btn');
    const qrResult = document.getElementById('qr-result');

    let currentSelectedType = 'url';

    document.querySelectorAll('.type-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSelectedType = btn.getAttribute('data-type');
            if (typesMenuView) typesMenuView.style.display = 'none';
            if (dynamicFormView) dynamicFormView.style.display = 'block';
            if (formTitleText) formTitleText.textContent = btn.querySelector('span').textContent;
            buildFormInputs(currentSelectedType);
        });
    });

    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            if (dynamicFormView) dynamicFormView.style.display = 'none';
            if (typesMenuView) typesMenuView.style.display = 'grid';
            if (qrResult) qrResult.innerHTML = '';
        });
    }

    function buildFormInputs(type) {
        if (!formInputsContainer) return;
        let html = '';
        switch(type) {
            case 'url':
                html = `<div class="input-group"><label>URL du site Web</label><input type="url" id="input-url" placeholder="https://example.com" class="form-control"></div>`;
                break;
            case 'text':
                html = `<div class="input-group"><label>Votre Texte</label><textarea id="input-text" placeholder="Écrivez votre texte ici..." class="form-control" rows="3"></textarea></div>`;
                break;
            case 'phone':
                html = `<div class="input-group"><label>Numéro de Téléphone</label><input type="tel" id="input-phone" placeholder="+212600000000" class="form-control"></div>`;
                break;
            case 'email':
                html = `<div class="input-group"><label>Adresse Email</label><input type="email" id="input-email" placeholder="contact@example.com" class="form-control"></div>`;
                break;
            case 'sms':
                html = `<div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="input-sms-phone" placeholder="+212..." class="form-control"></div>
                        <div class="input-group" style="margin-top:10px;"><label>Message SMS</label><textarea id="input-sms-body" placeholder="Votre message..." class="form-control" rows="2"></textarea></div>`;
                break;
            case 'wifi':
                html = `<div class="input-group"><label>Nom du réseau (SSID)</label><input type="text" id="input-wifi-ssid" placeholder="Nom du Wi-Fi" class="form-control"></div>
                        <div class="input-group" style="margin-top:10px;"><label>Mot de passe</label><input type="text" id="input-wifi-pass" placeholder="Mot de passe" class="form-control"></div>
                        <div class="input-group" style="margin-top:10px;"><label>Type de sécurité</label><select id="input-wifi-type" class="form-control"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Aucun</option></select></div>`;
                break;
            default:
                html = `<div class="input-group"><label>Information</label><input type="text" id="input-default" placeholder="Entrez les détails..." class="form-control"></div>`;
                break;
        }
        formInputsContainer.innerHTML = html;
    }

    if (generateCustomBtn) {
        generateCustomBtn.addEventListener('click', () => {
            let dataString = '';
            switch(currentSelectedType) {
                case 'url':
                    dataString = document.getElementById('input-url')?.value || '';
                    break;
                case 'text':
                    dataString = document.getElementById('input-text')?.value || '';
                    break;
                case 'phone':
                    let ph = document.getElementById('input-phone')?.value || '';
                    dataString = `tel:${ph}`;
                    break;
                case 'email':
                    let em = document.getElementById('input-email')?.value || '';
                    dataString = `mailto:${em}`;
                    break;
                case 'sms':
                    let smsp = document.getElementById('input-sms-phone')?.value || '';
                    let smsb = document.getElementById('input-sms-body')?.value || '';
                    dataString = `SMSTO:${smsp}:${smsb}`;
                    break;
                case 'wifi':
                    let ssid = document.getElementById('input-wifi-ssid')?.value || '';
                    let pass = document.getElementById('input-wifi-pass')?.value || '';
                    let wifit = document.getElementById('input-wifi-type')?.value || 'WPA';
                    dataString = `WIFI:S:${ssid};T:${wifit};P:${pass};;`;
                    break;
                default:
                    dataString = document.getElementById('input-default')?.value || '';
                    break;
            }

            if (!dataString.trim()) {
                alert("Veuillez remplir le champ requis !");
                return;
            }

            const sizeSelect = document.getElementById('qr-size');
            const sizeVal = sizeSelect ? parseInt(sizeSelect.value) : 300;

            if (qrResult) {
                qrResult.innerHTML = '';
                new QRCode(qrResult, {
                    text: dataString,
                    width: sizeVal,
                    height: sizeVal,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                // حفظ في التاريخ كإنشاء جديد
                saveToHistory('créé (' + currentSelectedType + ')', dataString);
            }
        });
    }

    // --- تفاعل باقات البريميوم ---
    const planCards = document.querySelectorAll('.premium-plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', () => {
            planCards.forEach(c => c.classList.remove('active-plan'));
            card.classList.add('active-plan');
        });
    });

    const subscribeNowBtn = document.getElementById('subscribe-now-btn');
    if (subscribeNowBtn) {
        subscribeNowBtn.addEventListener('click', () => {
            alert("Merci pour votre intérêt ! La passerelle de paiement sera bientôt disponible.");
        });
    }
});