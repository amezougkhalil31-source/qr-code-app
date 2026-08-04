/* ==========================================
   QR Master Pro - Main JavaScript Logic (Updated with History & LocalStorage)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // التنقل بين الواجهات عبر الشريط السفلي
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => sec.classList.remove('active'));
            const targetSection = document.getElementById(`${target}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // إذا دخلنا لواجهة التاريخ، نقوم بعرضه
            if (target === 'history') {
                renderHistory();
            }

            // إيقاف الكاميرا تلقائياً إذا خرجنا من واجهة السكان لتفادي المشاكل
            if (target !== 'scanner' && html5QrCode && isScanning) {
                stopScanner();
            }
        });
    });

    // زر مشاركة التطبيق من الهيدر العلوي
    const shareAppBtn = document.getElementById('share-app-btn');
    if (shareAppBtn) {
        shareAppBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'QR Master Pro',
                    text: 'Découvrez QR Master Pro, l\'application ultime pour générer et scanner vos QR codes !',
                    url: window.location.href
                }).catch(err => console.log('Erreur de partage:', err));
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Lien de l\'application copié dans le presse-papiers !');
            }
        });
    }

    // القائمة الجانبية (الإعدادات والبريميوم)
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const settingsDrawer = document.getElementById('settings-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', () => {
            settingsDrawer.classList.add('open');
            drawerOverlay.classList.add('open');
        });
    }

    if (closeDrawerBtn || drawerOverlay) {
        const closeDrawer = () => {
            settingsDrawer.classList.remove('open');
            drawerOverlay.classList.remove('open');
        };
        if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
        if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
    }

    // تبديل الثيم والألوان
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const lightModeBtn = document.getElementById('light-mode-btn');
    const htmlElement = document.documentElement;

    if (darkModeBtn && lightModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            htmlElement.setAttribute('data-theme', 'dark');
            darkModeBtn.classList.add('active');
            lightModeBtn.classList.remove('active');
        });

        lightModeBtn.addEventListener('click', () => {
            htmlElement.setAttribute('data-theme', 'light');
            lightModeBtn.classList.add('active');
            darkModeBtn.classList.remove('active');
        });
    }

    // اختيار الألوان
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            const color = dot.getAttribute('data-color');
            document.body.setAttribute('data-theme-color', color);
        });
    });

    // أزرار الانتقال السريع في واجهة الاستقبال
    const gotoGeneratorBtn = document.getElementById('goto-generator-btn');
    const gotoScannerBtn = document.getElementById('goto-scanner-btn');

    if (gotoGeneratorBtn) {
        gotoGeneratorBtn.addEventListener('click', () => {
            document.querySelector('[data-target="generator"]').click();
        });
    }

    if (gotoScannerBtn) {
        gotoScannerBtn.addEventListener('click', () => {
            document.querySelector('[data-target="scanner"]').click();
            startScanner();
        });
    }

    // منطق الكاميرا والماسح الضوئي (Scanner)
    let html5QrCode = null;
    let isScanning = false;
    let currentFacingMode = "environment";

    function startScanner() {
        const readerElement = document.getElementById('reader');
        if (!readerElement) return;

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        if (!isScanning) {
            html5QrCode.start(
                { facingMode: currentFacingMode },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    stopScanner();
                    handleScanResult(decodedText);
                    saveToHistory("Scan", decodedText);
                },
                (errorMessage) => {}
            ).then(() => {
                isScanning = true;
            }).catch(err => {
                console.error("Erreur de démarrage de la caméra:", err);
            });
        }
    }

    function stopScanner() {
        if (html5QrCode && isScanning) {
            html5QrCode.stop().then(() => {
                isScanning = false;
            }).catch(err => {
                isScanning = false;
            });
        }
    }

    const scannerNavBtn = document.querySelector('[data-target="scanner"]');
    if (scannerNavBtn) {
        scannerNavBtn.addEventListener('click', () => {
            setTimeout(startScanner, 300);
        });
    }

    // زر قلب الكاميرا
    const flipCameraBtn = document.getElementById('flip-camera-btn');
    if (flipCameraBtn) {
        flipCameraBtn.addEventListener('click', () => {
            currentFacingMode = (currentFacingMode === "environment") ? "user" : "environment";
            if (html5QrCode) {
                stopScanner();
                setTimeout(() => { startScanner(); }, 400);
            }
        });
    }

    // زر اختيار صورة من المعرض
    const galleryBtn = document.getElementById('gallery-btn');
    const galleryFileInput = document.getElementById('gallery-file-input');

    if (galleryBtn && galleryFileInput) {
        galleryBtn.addEventListener('click', () => {
            galleryFileInput.click();
        });

        galleryFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const imageFile = e.target.files[0];
                if (html5QrCode && isScanning) {
                    stopScanner();
                }
                if (!html5QrCode) {
                    html5QrCode = new Html5Qrcode("reader");
                }
                html5QrCode.scanFile(imageFile, true)
                    .then(decodedText => {
                        handleScanResult(decodedText);
                        saveToHistory("Galerie", decodedText);
                    })
                    .catch(err => {
                        alert("Impossible de trouver un QR Code valide dans cette image.");
                        startScanner();
                    });
            }
        });
    }

    // التعامل مع نتائج السكان
    const scanResultScreen = document.getElementById('scan-result-screen');
    const closeScanResultBtn = document.getElementById('close-scan-result-btn');
    const scanResultText = document.getElementById('scan-result-text');
    const scanResultTypeTitle = document.getElementById('scan-result-type-title');
    const scanResultCategory = document.getElementById('scan-result-category');
    const scanMainActionBtn = document.getElementById('scan-main-action-btn');

    function handleScanResult(text) {
        if (!scanResultScreen) return;
        scanResultText.textContent = text;
        scanResultScreen.classList.add('active');

        let typeName = "Texte";
        let category = "TXT";
        let mainActionText = "Ouvrir";
        let isLink = false;

        if (text.startsWith('http://') || text.startsWith('https://')) {
            typeName = "Lien Web";
            category = "URL";
            mainActionText = "Ouvrir le lien";
            isLink = true;
        } else if (text.startsWith('mailto:')) {
            typeName = "Adresse courriel";
            category = "EMAIL";
            mainActionText = "Envoyer un courriel";
            isLink = true;
        } else if (text.startsWith('tel:')) {
            typeName = "Numéro de téléphone";
            category = "PHONE";
            mainActionText = "Appeler ce numéro";
            isLink = true;
        } else {
            typeName = "Texte en clair";
            category = "TEXT";
            mainActionText = "Copier le texte";
        }

        scanResultTypeTitle.textContent = typeName;
        scanResultCategory.textContent = category;
        scanMainActionBtn.textContent = mainActionText;

        scanMainActionBtn.onclick = () => {
            if (isLink || text.startsWith('tel:') || text.startsWith('mailto:')) {
                window.open(text, '_blank');
            } else {
                navigator.clipboard.writeText(text);
                alert('Copié dans le presse-papiers !');
            }
        };
    }

    if (closeScanResultBtn) {
        closeScanResultBtn.addEventListener('click', () => {
            scanResultScreen.classList.remove('active');
            const activeSec = document.querySelector('.page-section.active');
            if (activeSec && activeSec.id === 'scanner-section') {
                startScanner();
            }
        });
    }

    // تفاعلات قائمة مولد الـ QR
    const typeButtons = document.querySelectorAll('.type-item-btn');
    const typesMenuView = document.getElementById('types-menu-view');
    const dynamicFormView = document.getElementById('dynamic-form-view');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const formInputsContainer = document.getElementById('form-inputs-container');
    const formTitleText = document.getElementById('form-title-text');
    const generateCustomBtn = document.getElementById('generate-custom-btn');
    const qrResultArea = document.getElementById('qr-result');

    let currentSelectedType = 'url';

    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            currentSelectedType = type;
            if (typesMenuView) typesMenuView.style.display = 'none';
            if (dynamicFormView) dynamicFormView.style.display = 'block';
            if (qrResultArea) qrResultArea.innerHTML = '';
            buildFormInputs(type);
        });
    });

    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            if (dynamicFormView) dynamicFormView.style.display = 'none';
            if (typesMenuView) typesMenuView.style.display = 'block';
        });
    }

    function buildFormInputs(type) {
        if (!formInputsContainer) return;
        formInputsContainer.innerHTML = '';
        let html = '';

        switch(type) {
            case 'url':
                formTitleText.textContent = "Création URL";
                html = `<div class="input-group"><label>Lien Web (URL)</label><input type="url" id="input-val" placeholder="https://example.com"></div>`;
                break;
            case 'text':
                formTitleText.textContent = "Texte en clair";
                html = `<div class="input-group"><label>Votre Texte</label><textarea id="input-val" rows="3" placeholder="Écrivez votre texte ici..."></textarea></div>`;
                break;
            case 'contact':
                formTitleText.textContent = "Contact (vCard)";
                html = `
                    <div class="input-group"><label>Nom complet</label><input type="text" id="vcard-name" placeholder="Nom Prénom"></div>
                    <div class="input-group"><label>Téléphone</label><input type="tel" id="vcard-phone" placeholder="+212600000000"></div>
                `;
                break;
            case 'wifi':
                formTitleText.textContent = "Wi-Fi";
                html = `
                    <div class="input-group"><label>Nom du réseau (SSID)</label><input type="text" id="wifi-ssid" placeholder="Nom du Wi-Fi"></div>
                    <div class="input-group"><label>Mot de passe</label><input type="text" id="wifi-pass" placeholder="Mot de passe"></div>
                `;
                break;
            default:
                formTitleText.textContent = "Contenu";
                html = `<div class="input-group"><label>Valeur</label><input type="text" id="input-val" placeholder="Entrez le contenu..."></div>`;
                break;
        }
        formInputsContainer.innerHTML = html;
    }

    if (generateCustomBtn) {
        generateCustomBtn.addEventListener('click', () => {
            let contentToEncode = "";
            if (currentSelectedType === 'wifi') {
                const ssid = document.getElementById('wifi-ssid')?.value || '';
                const pass = document.getElementById('wifi-pass')?.value || '';
                contentToEncode = `WIFI:S:${ssid};T:WPA;P:${pass};;`;
            } else {
                contentToEncode = document.getElementById('input-val')?.value || '';
            }

            if (!contentToEncode.trim()) {
                alert('Veuillez remplir les champs requis.');
                return;
            }

            const size = document.getElementById('qr-size')?.value || '300';
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(contentToEncode)}`;

            if (qrResultArea) {
                qrResultArea.innerHTML = `
                    <div style="background: #fff; padding: 15px; border-radius: 12px; display: inline-block; margin-top: 15px;">
                        <img src="${qrApiUrl}" alt="QR Code" style="display: block; max-width: 100%; height: auto; border-radius: 8px;">
                    </div>
                    <div style="margin-top: 15px;">
                        <a href="${qrApiUrl}" download="qrcode.png" class="primary-btn" style="text-decoration: none; display: inline-flex; justify-content: center;">
                            <i class="fa-solid fa-download"></i> Télécharger l'image
                        </a>
                    </div>
                `;
                // تسجلو في التاريخ أوتوماتيكياً
                saveToHistory("Création (" + currentSelectedType.toUpperCase() + ")", contentToEncode);
            }
        });
    }

    // نظام إدارة التاريخ (Historique & LocalStorage)
    function saveToHistory(type, text) {
        let history = JSON.parse(localStorage.getItem('qr_history')) || [];
        history.unshift({ type, text, date: new Date().toLocaleString() });
        localStorage.setItem('qr_history', JSON.stringify(history));
    }

    function renderHistory() {
        const container = document.getElementById('history-list-container');
        if (!container) return;
        
        let history = JSON.parse(localStorage.getItem('qr_history')) || [];
        if (history.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 20px;">Aucun historique pour le moment.</p>`;
            return;
        }

        container.innerHTML = history.map(item => `
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span class="badge" style="margin-bottom: 4px; display: inline-block;">${item.type}</span>
                    <p style="font-size: 0.9rem; word-break: break-all; margin: 4px 0;">${item.text}</p>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">${item.date}</small>
                </div>
            </div>
        `).join('');
    }

    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            localStorage.removeItem('qr_history');
            renderHistory();
        });
    }
});