/* ==========================================
   QR Master Pro - Main JavaScript Logic (Complete, Safe & Fixed)
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

            if (target === 'history') {
                renderHistory();
            }

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

    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            const color = dot.getAttribute('data-color');
            document.body.setAttribute('data-theme-color', color);
        });
    });

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

    // التعامل الذكي مع نتائج السكان والتحكم في الزر الرئيسي حسب نوع المحتوى
    const scanResultScreen = document.getElementById('scan-result-screen');
    const closeScanResultBtn = document.getElementById('close-scan-result-btn');
    const scanResultText = document.getElementById('scan-result-text');
    const scanResultTypeTitle = document.getElementById('scan-result-type-title');
    const scanResultCategory = document.getElementById('scan-result-category');
    const scanMainActionBtn = document.getElementById('smart-open-link-btn') || document.getElementById('scan-main-action-btn');

    function handleScanResult(text) {
        if (!scanResultScreen) return;
        scanResultText.textContent = text;
        scanResultScreen.classList.add('active');

        let cleanText = text.replace(/^undefined\s*/i, '').trim();
        let typeName = "Texte en clair";
        let category = "TEXT";

        const urlMatch = cleanText.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/i);
        const telMatch = cleanText.match(/(?:tel:)?(\+?[0-9\s\-]{8,})/i);
        const emailMatch = cleanText.match(/(?:mailto:)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);

        if (scanMainActionBtn) {
            let newBtn = scanMainActionBtn.cloneNode(true);
            scanMainActionBtn.parentNode.replaceChild(newBtn, scanMainActionBtn);

            if (cleanText.startsWith('tel:') || (telMatch && cleanText.replace(/[\s\+\-\(\)]/g, '').length >= 8 && !cleanText.includes('http') && !cleanText.includes('@'))) {
                typeName = "Numéro de téléphone";
                category = "PHONE";
                let phoneNumber = telMatch ? telMatch[1].trim() : cleanText.replace('tel:', '').trim();
                newBtn.innerHTML = '<i class="fa-solid fa-phone"></i> Appeler ce numéro';
                newBtn.onclick = () => window.location.href = `tel:${phoneNumber}`;
                newBtn.style.display = "flex";
            } else if (cleanText.startsWith('mailto:') || emailMatch) {
                typeName = "Adresse courriel";
                category = "EMAIL";
                let email = emailMatch ? emailMatch[1].trim() : cleanText.replace('mailto:', '').trim();
                newBtn.innerHTML = '<i class="fa-solid fa-envelope"></i> Envoyer un e-mail';
                newBtn.onclick = () => window.location.href = `mailto:${email}`;
                newBtn.style.display = "flex";
            } else if (cleanText.startsWith('http://') || cleanText.startsWith('https://') || urlMatch) {
                typeName = "Lien Web";
                category = "URL";
                let url = cleanText.startsWith('http') ? cleanText : (urlMatch ? `https://${urlMatch[1]}` : `https://${cleanText}`);
                newBtn.innerHTML = '<i class="fa-solid fa-external-link-alt"></i> Ouvrir le lien';
                newBtn.onclick = () => window.open(url, '_blank');
                newBtn.style.display = "flex";
            } else {
                typeName = "Texte en clair";
                category = "TEXT";
                newBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Rechercher sur Google';
                newBtn.onclick = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(cleanText)}`, '_blank');
                newBtn.style.display = "flex";
            }
        }

        if (scanResultTypeTitle) scanResultTypeTitle.textContent = typeName;
        if (scanResultCategory) scanResultCategory.textContent = category;
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

    // تفاعلات قائمة مولد الـ QR (الأنواع العَشرة)
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
                    <div class="input-group"><label>Email</label><input type="email" id="vcard-email" placeholder="example@domain.com"></div>
                `;
                break;
            case 'email':
                formTitleText.textContent = "Email";
                html = `
                    <div class="input-group"><label>Adresse Destinataire</label><input type="email" id="email-to" placeholder="contact@example.com"></div>
                    <div class="input-group"><label>Sujet</label><input type="text" id="email-sub" placeholder="Sujet du message"></div>
                `;
                break;
            case 'sms':
                formTitleText.textContent = "SMS";
                html = `
                    <div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="sms-phone" placeholder="+212600000000"></div>
                    <div class="input-group"><label>Message</label><textarea id="sms-body" rows="2" placeholder="Votre message..."></textarea></div>
                `;
                break;
            case 'coordinates':
                formTitleText.textContent = "Coordonnées GPS";
                html = `
                    <div class="input-group"><label>Latitude</label><input type="text" id="gps-lat" placeholder="33.5731"></div>
                    <div class="input-group"><label>Longitude</label><input type="text" id="gps-lng" placeholder="-7.5898"></div>
                `;
                break;
            case 'phone':
                formTitleText.textContent = "Téléphone";
                html = `<div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="input-val" placeholder="+212600000000"></div>`;
                break;
            case 'wifi':
                formTitleText.textContent = "Wi-Fi";
                html = `
                    <div class="input-group"><label>Nom du réseau (SSID)</label><input type="text" id="wifi-ssid" placeholder="Nom du Wi-Fi"></div>
                    <div class="input-group"><label>Mot de passe</label><input type="text" id="wifi-pass" placeholder="Mot de passe"></div>
                `;
                break;
            case 'agenda':
                formTitleText.textContent = "Agenda / Événement";
                html = `
                    <div class="input-group"><label>Titre de l'événement</label><input type="text" id="agenda-title" placeholder="Réunion..."></div>
                    <div class="input-group"><label>Date de début</label><input type="date" id="agenda-date"></div>
                `;
                break;
            case 'clipboard':
                formTitleText.textContent = "Presse-papiers";
                html = `<div class="input-group"><label>Contenu copié</label><textarea id="input-val" rows="3" placeholder="Texte du presse-papiers..."></textarea></div>`;
                break;
            default:
                formTitleText.textContent = "Contenu";
                html = `<div class="input-group"><label>Valeur</label><input type="text" id="input-val" placeholder="Entrez le contenu..."></div>`;
                break;
        }
        formInputsContainer.innerHTML = html;
    }

    // دالة آمنة لتوليد QR Code محلياً بدون مربع أبيض فارغ نهائياً
    function generateQRCodeSafe(text, containerElement, size = 200) {
        if (!containerElement) return;
        containerElement.innerHTML = "";

        if (!text || text.trim() === "") {
            containerElement.innerHTML = "<span style='color:red; font-size:12px;'>Erreur: Contenu vide</span>";
            return;
        }

        setTimeout(() => {
            try {
                new QRCode(containerElement, {
                    text: text,
                    width: parseInt(size),
                    height: parseInt(size),
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            } catch (error) {
                console.error("Erreur de génération QR:", error);
                containerElement.innerHTML = "<span style='color:red; font-size:12px;'>Erreur de génération</span>";
            }
        }, 50);
    }

    if (generateCustomBtn) {
        generateCustomBtn.addEventListener('click', () => {
            let contentToEncode = "";

            if (currentSelectedType === 'wifi') {
                const ssid = document.getElementById('wifi-ssid')?.value || '';
                const pass = document.getElementById('wifi-pass')?.value || '';
                contentToEncode = `WIFI:S:${ssid};T:WPA;P:${pass};;`;
            } else if (currentSelectedType === 'contact') {
                const name = document.getElementById('vcard-name')?.value || '';
                const phone = document.getElementById('vcard-phone')?.value || '';
                const email = document.getElementById('vcard-email')?.value || '';
                contentToEncode = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
            } else if (currentSelectedType === 'email') {
                const emailTo = document.getElementById('email-to')?.value || '';
                const emailSub = document.getElementById('email-sub')?.value || '';
                contentToEncode = `mailto:${emailTo}?subject=${encodeURIComponent(emailSub)}`;
            } else if (currentSelectedType === 'sms') {
                const smsPhone = document.getElementById('sms-phone')?.value || '';
                const smsBody = document.getElementById('sms-body')?.value || '';
                contentToEncode = `SMSTO:${smsPhone}:${smsBody}`;
            } else if (currentSelectedType === 'coordinates') {
                const lat = document.getElementById('gps-lat')?.value || '';
                const lng = document.getElementById('gps-lng')?.value || '';
                contentToEncode = `geo:${lat},${lng}`;
            } else if (currentSelectedType === 'agenda') {
                const title = document.getElementById('agenda-title')?.value || '';
                const date = document.getElementById('agenda-date')?.value || '';
                contentToEncode = `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${date}\nEND:VEVENT`;
            } else {
                contentToEncode = document.getElementById('input-val')?.value || '';
            }

            if (!contentToEncode.trim()) {
                alert('Veuillez remplir les champs requis.');
                return;
            }

            const size = document.getElementById('qr-size')?.value || '200';

            if (qrResultArea) {
                qrResultArea.innerHTML = `
                    <div id="active-qr-holder" style="background: #fff; padding: 15px; border-radius: 12px; display: inline-block; margin-top: 15px; min-height: ${size}px; min-width: ${size}px;"></div>
                    <div style="margin-top: 15px;">
                        <button id="download-qr-btn" class="primary-btn" style="border:none; cursor:pointer;">
                            <i class="fa-solid fa-download"></i> Télécharger l'image
                        </button>
                    </div>
                `;

                const holder = document.getElementById('active-qr-holder');
                generateQRCodeSafe(contentToEncode, holder, size);

                const downloadBtn = document.getElementById('download-qr-btn');
                if (downloadBtn) {
                    downloadBtn.onclick = () => {
                        const img = holder.querySelector('img');
                        const canvas = holder.querySelector('canvas');
                        let imageUrl = "";
                        if (img && img.src) {
                            imageUrl = img.src;
                        } else if (canvas) {
                            imageUrl = canvas.toDataURL("image/png");
                        }
                        if (imageUrl) {
                            const link = document.createElement('a');
                            link.href = imageUrl;
                            link.download = 'qrcode.png';
                            link.click();
                        } else {
                            alert("Veuillez patienter que le QR code soit entièrement généré.");
                        }
                    };
                }

                saveToHistory("Création (" + currentSelectedType.toUpperCase() + ")", contentToEncode);
            }
        });
    }

    function saveToHistory(type, text) {
        let history = JSON.parse(localStorage.getItem('qr_history')) || [];
        history.unshift({ type, text, date: new Date().toLocaleString() });
        localStorage.setItem('qr_history', JSON.stringify(history));
    }

    // دالة التاريخ الآمنة 100% لتجنب انقطاع زر Ouvrir QR مع مرور الوقت وطول النصوص
    function renderHistory() {
        const container = document.getElementById('history-list-container');
        if (!container) return;
        
        let history = JSON.parse(localStorage.getItem('qr_history')) || [];
        if (history.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 20px;">Aucun historique pour le moment.</p>`;
            return;
        }

        container.innerHTML = '';

        history.forEach((item) => {
            let itemDiv = document.createElement('div');
            itemDiv.className = "history-item";
            itemDiv.style.cssText = "background: var(--card-bg, #1e293b); border: 1px solid var(--border-color, #334155); padding: 14px; border-radius: 12px; margin-bottom: 10px;";

            let contentDiv = document.createElement('div');
            contentDiv.innerHTML = `
                <span class="badge" style="margin-bottom: 4px; display: inline-block;">${item.type}</span>
                <p class="history-text-val" style="font-size: 0.9rem; word-break: break-all; margin: 4px 0; color: #fff;"></p>
                <small style="color: #94a3b8; font-size: 0.75rem;">${item.date}</small>
            `;
            contentDiv.querySelector('.history-text-val').textContent = item.text;
            itemDiv.appendChild(contentDiv);

            let actionsDiv = document.createElement('div');
            actionsDiv.className = "history-custom-actions";
            actionsDiv.style.cssText = "display: flex; gap: 8px; margin-top: 10px;";

            let openBtn = document.createElement('button');
            openBtn.className = "history-custom-btn";
            openBtn.innerHTML = '<i class="fa-solid fa-qrcode"></i> Ouvrir QR';
            openBtn.style.cssText = "background: rgba(79, 70, 229, 0.15); color: #818cf8; border: 1px solid rgba(79, 70, 229, 0.3); padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; flex: 1;";
            
            openBtn.onclick = () => {
                showQrModalSafe(item.text);
            };

            let copyBtn = document.createElement('button');
            copyBtn.className = "history-custom-btn";
            copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copier';
            copyBtn.style.cssText = "background: rgba(79, 70, 229, 0.15); color: #818cf8; border: 1px solid rgba(79, 70, 229, 0.3); padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; flex: 1;";
            
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(item.text);
                alert('Copié !');
            };

            actionsDiv.appendChild(openBtn);
            actionsDiv.appendChild(copyBtn);
            itemDiv.appendChild(actionsDiv);

            container.appendChild(itemDiv);
        });
    }

    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            localStorage.removeItem('qr_history');
            renderHistory();
        });
    }
});

// نافذة منبثقة آمنة لمعاينة QR Code من التاريخ بدون مربعات بيضاء فارغة نهائياً
function showQrModalSafe(text) {
    let oldModal = document.getElementById('safe-qr-modal');
    if (oldModal) oldModal.remove();

    let modal = document.createElement('div');
    modal.id = 'safe-qr-modal';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:999999; display:flex; justify-content:center; align-items:center;";
    
    let box = document.createElement('div');
    box.style.cssText = "background:#1e293b; padding:20px; border-radius:12px; text-align:center; max-width:90%; width:280px; box-shadow:0 10px 25px rgba(0,0,0,0.5); color:#fff;";
    
    let title = document.createElement('h4');
    title.innerText = "Votre QR Code";
    title.style.marginBottom = "12px";
    box.appendChild(title);

    let qrHolder = document.createElement('div');
    qrHolder.id = "safe-qr-render-area";
    qrHolder.style.cssText = "background:#fff; padding:12px; border-radius:8px; display:inline-block; margin-bottom:15px; min-height:180px; min-width:180px;";
    box.appendChild(qrHolder);

    let closeBtn = document.createElement('button');
    closeBtn.className = "primary-btn";
    closeBtn.innerText = "Fermer";
    closeBtn.style.cssText = "width:100%; padding:8px; background:#4f46e5; color:#fff; border:none; border-radius:6px; cursor:pointer;";
    closeBtn.onclick = () => modal.remove();
    box.appendChild(closeBtn);

    modal.appendChild(box);
    document.body.appendChild(modal);

    setTimeout(() => {
        qrHolder.innerHTML = "";
        try {
            new QRCode(qrHolder, {
                text: text,
                width: 180,
                height: 180,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            qrHolder.innerText = "Erreur de génération";
        }
    }, 60);
}