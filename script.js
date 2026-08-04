/* ==========================================
   QR Master Pro - Main JavaScript (Optimized & Smart Scanner)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. إدارة التنقل بين الواجهات ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    function switchSection(targetId) {
        sections.forEach(sec => sec.classList.remove('active'));
        navItems.forEach(nav => nav.classList.remove('active'));

        const targetSection = document.getElementById(`${targetId}-section`);
        const targetNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);

        if (targetSection) targetSection.classList.add('active');
        if (targetNav) targetNav.classList.add('active');

        if (targetId !== 'scanner' && html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(() => {});
        } else if (targetId === 'scanner') {
            // فتح سريع وفوري بدون تأخير
            setTimeout(startScanner, 50);
        }

        if (targetId === 'history') {
            renderHistory();
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchSection(target);
        });
    });

    const gotoGenBtn = document.getElementById('goto-generator-btn');
    const gotoScanBtn = document.getElementById('goto-scanner-btn');
    const headerPremiumBtn = document.getElementById('header-premium-btn');
    const gotoDrawerPremium = document.getElementById('goto-premium-drawer-btn');

    if (gotoGenBtn) gotoGenBtn.addEventListener('click', () => switchSection('generator'));
    if (gotoScanBtn) gotoScanBtn.addEventListener('click', () => switchSection('scanner'));
    if (headerPremiumBtn) headerPremiumBtn.addEventListener('click', () => {
        switchSection('premium');
        toggleDrawer(false);
    });
    if (gotoDrawerPremium) gotoDrawerPremium.addEventListener('click', () => {
        switchSection('premium');
        toggleDrawer(false);
    });

    // --- 2. إعدادات القائمة الجانبية والثيمات ---
    const menuBtn = document.getElementById('menu-toggle-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const drawer = document.getElementById('settings-drawer');
    const overlay = document.getElementById('drawer-overlay');

    function toggleDrawer(open) {
        if (drawer && overlay) {
            if (open) {
                drawer.classList.add('open');
                overlay.classList.add('open');
            } else {
                drawer.classList.remove('open');
                overlay.classList.remove('open');
            }
        }
    }

    if (menuBtn) menuBtn.addEventListener('click', () => toggleDrawer(true));
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
    if (overlay) overlay.addEventListener('click', () => toggleDrawer(false));

    const lightBtn = document.getElementById('light-mode-btn');
    const darkBtn = document.getElementById('dark-mode-btn');
    const htmlTag = document.documentElement;

    if (lightBtn && darkBtn) {
        lightBtn.addEventListener('click', () => {
            htmlTag.setAttribute('data-theme', 'light');
            lightBtn.classList.add('active');
            darkBtn.classList.remove('active');
            localStorage.setItem('qr_theme', 'light');
        });

        darkBtn.addEventListener('click', () => {
            htmlTag.setAttribute('data-theme', 'dark');
            darkBtn.classList.add('active');
            lightBtn.classList.remove('active');
            localStorage.setItem('qr_theme', 'dark');
        });

        const savedTheme = localStorage.getItem('qr_theme');
        if (savedTheme === 'light') lightBtn.click();
    }

    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            const color = dot.getAttribute('data-color');
            htmlTag.setAttribute('data-theme-color', color);
            localStorage.setItem('qr_color', color);
        });
    });

    const savedColor = localStorage.getItem('qr_color');
    if (savedColor) {
        const targetDot = document.querySelector(`.color-dot[data-color="${savedColor}"]`);
        if (targetDot) targetDot.click();
    }

    const shareAppBtn = document.getElementById('share-app-btn');
    if (shareAppBtn) {
        shareAppBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'QR Master Pro',
                    text: 'Téléchargez QR Master Pro, la meilleure application pour gérer vos QR Codes !',
                    url: window.location.href
                }).catch(() => {});
            } else {
                alert('Lien copié dans le presse-papiers !');
            }
        });
    }

    // --- 3. اختيار خطة بريميوم ---
    const planCards = document.querySelectorAll('.premium-plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', () => {
            planCards.forEach(c => {
                c.classList.remove('active-plan');
                c.style.borderColor = 'var(--border-color)';
            });
            card.classList.add('active-plan');
            card.style.borderColor = 'var(--primary)';
        });
    });

    const subscribeBtn = document.getElementById('subscribe-now-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            const activePlan = document.querySelector('.premium-plan-card.active-plan');
            const planName = activePlan ? activePlan.getAttribute('data-plan') : 'yearly';
            alert(`Redirection vers la passerelle de paiement sécurisée (${planName})...`);
        });
    }

    // --- 4. مولد QR Code ---
    const typesGrid = document.getElementById('types-menu-view');
    const dynamicForm = document.getElementById('dynamic-form-view');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const formTitle = document.getElementById('form-title-text');
    const formInputsContainer = document.getElementById('form-inputs-container');
    const generateCustomBtn = document.getElementById('generate-custom-btn');
    const qrResultBox = document.getElementById('qr-result');
    const typeButtons = document.querySelectorAll('.type-item-btn');

    let currentSelectedType = 'url';

    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            currentSelectedType = type;
            if (typesGrid) typesGrid.style.display = 'none';
            if (dynamicForm) dynamicForm.style.display = 'block';
            buildFormInputs(type);
        });
    });

    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            if (dynamicForm) dynamicForm.style.display = 'none';
            if (typesGrid) typesGrid.style.display = 'grid';
            if (qrResultBox) qrResultBox.innerHTML = '';
        });
    }

    function buildFormInputs(type) {
        if (!formInputsContainer) return;
        formInputsContainer.innerHTML = '';
        if (formTitle) formTitle.textContent = `Créer un QR Code : ${type.toUpperCase()}`;

        let html = '';
        switch (type) {
            case 'url':
                html = `<div class="input-group"><label>Lien Web (URL)</label><input type="url" id="inp-url" placeholder="https://example.com" value="https://"></div>`;
                break;
            case 'text':
                html = `<div class="input-group"><label>Texte libre</label><textarea id="inp-text" rows="3" placeholder="Entrez votre texte ici..."></textarea></div>`;
                break;
            case 'contact':
                html = `<div class="input-group"><label>Nom complet</label><input type="text" id="inp-name" placeholder="Nom Prénom"></div>
                        <div class="input-group"><label>Téléphone</label><input type="tel" id="inp-phone" placeholder="+212600000000"></div>
                        <div class="input-group"><label>Email</label><input type="email" id="inp-email" placeholder="email@example.com"></div>`;
                break;
            case 'email':
                html = `<div class="input-group"><label>Adresse Email</label><input type="email" id="inp-mail-to" placeholder="destinataire@example.com"></div>
                        <div class="input-group"><label>Sujet</label><input type="text" id="inp-mail-sub" placeholder="Sujet..."></div>
                        <div class="input-group"><label>Message</label><textarea id="inp-mail-body" rows="2" placeholder="Message..."></textarea></div>`;
                break;
            case 'sms':
                html = `<div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="inp-sms-phone" placeholder="+212..."></div>
                        <div class="input-group"><label>Message</label><textarea id="inp-sms-text" rows="2" placeholder="Message SMS..."></textarea></div>`;
                break;
            case 'coordinates':
                html = `<div class="input-group"><label>Latitude</label><input type="text" id="inp-lat" placeholder="33.5731"></div>
                        <div class="input-group"><label>Longitude</label><input type="text" id="inp-lon" placeholder="-7.5898"></div>`;
                break;
            case 'phone':
                html = `<div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="inp-call" placeholder="+212600000000"></div>`;
                break;
            case 'wifi':
                html = `<div class="input-group"><label>Nom du réseau (SSID)</label><input type="text" id="inp-wifi-name" placeholder="NomDuWifi"></div>
                        <div class="input-group"><label>Mot de passe</label><input type="text" id="inp-wifi-pass" placeholder="Mot de passe"></div>
                        <div class="input-group"><label>Sécurité</label><select id="inp-wifi-sec"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Aucune</option></select></div>`;
                break;
            case 'agenda':
                html = `<div class="input-group"><label>Titre de l'événement</label><input type="text" id="inp-ev-title" placeholder="Réunion..."></div>
                        <div class="input-group"><label>Date de début</label><input type="date" id="inp-ev-start"></div>
                        <div class="input-group"><label>Date de fin</label><input type="date" id="inp-ev-end"></div>`;
                break;
            case 'clipboard':
                html = `<div class="input-group"><label>Contenu</label><textarea id="inp-clip" rows="3" placeholder="Texte..."></textarea></div>`;
                break;
            default:
                html = `<div class="input-group"><label>Valeur</label><input type="text" id="inp-default" placeholder="Valeur..."></div>`;
        }
        formInputsContainer.innerHTML = html;
    }

    if (generateCustomBtn) {
        generateCustomBtn.addEventListener('click', () => {
            let stringData = '';
            switch (currentSelectedType) {
                case 'url': stringData = document.getElementById('inp-url')?.value || ''; break;
                case 'text':
                case 'clipboard': stringData = document.getElementById('inp-text')?.value || document.getElementById('inp-clip')?.value || ''; break;
                case 'contact':
                    const n = document.getElementById('inp-name')?.value || '';
                    const p = document.getElementById('inp-phone')?.value || '';
                    const e = document.getElementById('inp-email')?.value || '';
                    stringData = `BEGIN:VCARD\nVERSION:3.0\nFN:${n}\nTEL:${p}\nEMAIL:${e}\nEND:VCARD`;
                    break;
                case 'email':
                    stringData = `mailto:${document.getElementById('inp-mail-to')?.value || ''}?subject=${encodeURIComponent(document.getElementById('inp-mail-sub')?.value || '')}&body=${encodeURIComponent(document.getElementById('inp-mail-body')?.value || '')}`;
                    break;
                case 'sms':
                    stringData = `SMSTO:${document.getElementById('inp-sms-phone')?.value || ''}:${document.getElementById('inp-sms-text')?.value || ''}`;
                    break;
                case 'coordinates':
                    stringData = `geo:${document.getElementById('inp-lat')?.value || ''},${document.getElementById('inp-lon')?.value || ''}`;
                    break;
                case 'phone':
                    stringData = `tel:${document.getElementById('inp-call')?.value || ''}`;
                    break;
                case 'wifi':
                    stringData = `WIFI:S:${document.getElementById('inp-wifi-name')?.value || ''};T:${document.getElementById('inp-wifi-sec')?.value || 'WPA'};P:${document.getElementById('inp-wifi-pass')?.value || ''};;`;
                    break;
                case 'agenda':
                    stringData = `BEGIN:VEVENT\nSUMMARY:${document.getElementById('inp-ev-title')?.value || ''}\nDTSTART:${document.getElementById('inp-ev-start')?.value || ''}\nDTEND:${document.getElementById('inp-ev-end')?.value || ''}\nEND:VEVENT`;
                    break;
                default: stringData = document.getElementById('inp-default')?.value || '';
            }

            if (!stringData.trim()) {
                alert('Veuillez remplir les champs obligatoires.');
                return;
            }

            const sizeSelect = document.getElementById('qr-size');
            const sizeVal = parseInt(sizeSelect ? sizeSelect.value : '300');

            if (qrResultBox) {
                qrResultBox.innerHTML = '<div id="qrcode-canvas-wrap" style="display:inline-block; padding:15px; background:#fff; border-radius:12px;"></div>';
                const wrap = document.getElementById('qrcode-canvas-wrap');
                
                try {
                    new QRCode(wrap, {
                        text: stringData,
                        width: sizeVal,
                        height: sizeVal,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });

                    setTimeout(() => {
                        const actionDiv = document.createElement('div');
                        actionDiv.className = 'history-custom-actions';
                        actionDiv.style.marginTop = '15px';
                        actionDiv.innerHTML = `
                            <button class="history-custom-btn" id="dl-qr-btn"><i class="fa-solid fa-download"></i> Télécharger</button>
                        `;
                        qrResultBox.appendChild(actionDiv);

                        document.getElementById('dl-qr-btn')?.addEventListener('click', () => {
                            const img = wrap.querySelector('img') || wrap.querySelector('canvas');
                            if (img) {
                                const url = img.tagName === 'CANVAS' ? img.toDataURL('image/png') : img.src;
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `QRCode_${Date.now()}.png`;
                                a.click();
                            }
                        });

                        saveToHistory(currentSelectedType, stringData);
                    }, 100);

                } catch (err) {
                    alert('Erreur lors de la génération.');
                }
            }
        });
    }

    // --- 5. الماسح الضوئي الذكي (Fast & Smart Scanner) ---
    let html5QrCode = null;
    let currentCameraIndex = 0;
    let availableCameras = [];

    function startScanner() {
        const readerElement = document.getElementById('reader');
        if (!readerElement) return;

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader");
        }

        if (html5QrCode.isScanning) return;

        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                availableCameras = devices;
                const cameraId = devices[currentCameraIndex].id;
                
                html5QrCode.start(
                    cameraId,
                    { fps: 15, qrbox: { width: 240, height: 240 } },
                    (decodedText) => { processSmartScanResult(decodedText); },
                    () => {}
                ).catch(() => {});
            }
        }).catch(() => {
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 15, qrbox: { width: 240, height: 240 } },
                (decodedText) => { processSmartScanResult(decodedText); },
                () => {}
            ).catch(() => {});
        });
    }

    const flipCamBtn = document.getElementById('flip-camera-btn');
    if (flipCamBtn) {
        flipCamBtn.addEventListener('click', () => {
            if (availableCameras.length > 1) {
                currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
                if (html5QrCode && html5QrCode.isScanning) {
                    html5QrCode.stop().then(() => { startScanner(); }).catch(() => {});
                }
            } else {
                alert('Une seule caméra détectée.');
            }
        });
    }

    const galleryBtn = document.getElementById('gallery-btn');
    const galleryFileInput = document.getElementById('gallery-file-input');

    if (galleryBtn && galleryFileInput) {
        galleryBtn.addEventListener('click', () => galleryFileInput.click());
        galleryFileInput.addEventListener('change', e => {
            if (e.target.files && e.target.files.length > 0) {
                const imageFile = e.target.files[0];
                if (!html5QrCode) {
                    html5QrCode = new Html5Qrcode("reader");
                }
                html5QrCode.scanFile(imageFile, true)
                    .then(decodedText => { processSmartScanResult(decodedText); })
                    .catch(() => { alert("Aucun QR code détecté dans cette image."); });
            }
        });
    }

    const scanResultModal = document.getElementById('scan-result-screen');
    const scanResultText = document.getElementById('scan-result-text');
    const scanResultCategory = document.getElementById('scan-result-category');
    const closeScanModalBtn = document.getElementById('close-scan-result-btn');
    const smartOpenLinkBtn = document.getElementById('smart-open-link-btn');
    const scanActionCopy = document.getElementById('scan-action-copy');
    const scanActionShare = document.getElementById('scan-action-share');

    function processSmartScanResult(text) {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch(() => {});
        }

        let cleanText = text.trim();
        let typeCat = 'texte';
        let actionUrl = '';

        // تحليل ذكي وتوجيه تلقائي (Smart Routing)
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
        } else if (cleanText.includes('BEGIN:VCARD')) {
            typeCat = 'contact';
        }

        saveToHistory(typeCat, cleanText);

        // إذا كان رابط أو هاتف أو إيميل، يتم توجيه المستخدم أو فتحه فوراً، وإلا تظهر نافذة النتيجة الذكية
        if (actionUrl) {
            if (confirm(`QR Code détecté (${typeCat.toUpperCase()}):\n${cleanText}\nVoulez-vous l'ouvrir ?`)) {
                window.location.href = actionUrl;
                return;
            }
        }

        if (scanResultModal && scanResultText) {
            scanResultModal.classList.add('active');
            scanResultText.textContent = cleanText;
            if (scanResultCategory) scanResultCategory.textContent = typeCat.toUpperCase();
            if (smartOpenLinkBtn) {
                smartOpenLinkBtn.style.display = (typeCat === 'url') ? 'block' : 'none';
            }
        } else {
            alert(`Résultat (${typeCat.toUpperCase()}):\n${cleanText}`);
            startScanner();
        }
    }

    if (closeScanModalBtn) {
        closeScanModalBtn.addEventListener('click', () => {
            if (scanResultModal) scanResultModal.classList.remove('active');
            startScanner();
        });
    }

    if (smartOpenLinkBtn) {
        smartOpenLinkBtn.addEventListener('click', () => {
            const linkText = scanResultText ? scanResultText.textContent : '';
            if (linkText) window.open(linkText, '_blank');
        });
    }

    if (scanActionCopy) {
        scanActionCopy.addEventListener('click', () => {
            const textToCopy = scanResultText ? scanResultText.textContent : '';
            navigator.clipboard.writeText(textToCopy).then(() => { alert('Copié !'); });
        });
    }

    if (scanActionShare) {
        scanActionShare.addEventListener('click', () => {
            const textToShare = scanResultText ? scanResultText.textContent : '';
            if (navigator.share) {
                navigator.share({ title: 'QR Master Pro', text: textToShare }).catch(() => {});
            } else {
                alert('Partage non pris en charge.');
            }
        });
    }

    // --- 6. إدارة التاريخ ---
    function saveToHistory(type, data) {
        let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
        history.unshift({ type, data, date: new Date().toLocaleDateString() });
        if (history.length > 50) history.pop();
        localStorage.setItem('qr_history', JSON.stringify(history));
    }

    function renderHistory() {
        const historyContainer = document.getElementById('history-list-container');
        if (!historyContainer) return;

        let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
        if (history.length === 0) {
            historyContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Aucun historique pour le moment.</p>';
            return;
        }

        historyContainer.innerHTML = '';
        history.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.cssText = "background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; margin-bottom: 10px; cursor: pointer;";
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <span class="badge">${item.type.toUpperCase()}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${item.date}</span>
                </div>
                <p style="font-size:0.9rem; word-break:break-all; margin:8px 0; color:var(--text-main);" class="hist-text-click" data-text="${encodeURIComponent(item.data)}">${item.data}</p>
                <div class="history-custom-actions">
                    <button class="history-custom-btn hist-copy" data-text="${encodeURIComponent(item.data)}"><i class="fa-solid fa-copy"></i> Copier</button>
                    <button class="history-custom-btn hist-del" data-index="${index}"><i class="fa-solid fa-trash"></i> Supprimer</button>
                </div>
            `;
            historyContainer.appendChild(div);
        });

        document.querySelectorAll('.hist-text-click').forEach(p => {
            p.addEventListener('click', (e) => {
                e.stopPropagation();
                showQrPopup(decodeURIComponent(p.getAttribute('data-text')));
            });
        });

        document.querySelectorAll('.hist-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(decodeURIComponent(btn.getAttribute('data-text'))).then(() => alert('Copié !'));
            });
        });

        document.querySelectorAll('.hist-del').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-index'));
                let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
                history.splice(idx, 1);
                localStorage.setItem('qr_history', JSON.stringify(history));
                renderHistory();
            });
        });
    }

    function showQrPopup(text) {
        let existingModal = document.getElementById('dynamic-qr-popup');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'dynamic-qr-popup';
        modal.className = 'qr-pop-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="qr-pop-content">
                <h3 style="font-size: 1rem; margin-bottom: 15px; color: var(--text-color);">QR Code généré</h3>
                <div id="pop-qrcode-wrap" style="display:inline-block; padding:15px; background:#fff; border-radius:12px; margin-bottom: 15px;"></div>
                <p style="font-size: 0.85rem; color: var(--text-muted); word-break: break-all; margin-bottom: 15px; max-height: 80px; overflow-y: auto;">${text}</p>
                <button class="primary-btn" id="close-pop-btn">Fermer</button>
            </div>
        `;
        document.body.appendChild(modal);

        new QRCode(document.getElementById('pop-qrcode-wrap'), {
            text: text,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        document.getElementById('close-pop-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
});