/* ==========================================
   QR Master Pro - Main JavaScript Logic (Updated)
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

    // القائمة الجانبية (الإعدادات)
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
    let currentFacingMode = "environment"; // تبدأ بالكاميرا الخلفية

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
                },
                (errorMessage) => {
                    // تجاهل الأخطاء العادية أثناء المسح المستمر
                }
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
                console.error("Erreur lors de l'arrêt de la caméra:", err);
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

    // زر قلب الكاميرا (أمامية / خلفية)
    const flipCameraBtn = document.getElementById('flip-camera-btn');
    if (flipCameraBtn) {
        flipCameraBtn.addEventListener('click', () => {
            currentFacingMode = (currentFacingMode === "environment") ? "user" : "environment";
            if (html5QrCode) {
                stopScanner();
                setTimeout(() => {
                    startScanner();
                }, 400);
            }
        });
    }

    // زر اختيار صورة من المعرض (Gallery)
    const galleryBtn = document.getElementById('gallery-btn');
    const galleryFileInput = document.getElementById('gallery-file-input');

    if (galleryBtn && galleryFileInput) {
        galleryBtn.addEventListener('click', () => {
            galleryFileInput.click();
        });

        galleryFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const imageFile = e.target.files[0];
                
                // إيقاف الكاميرا المؤقتة أثناء قراءة الصورة من الملف
                if (html5QrCode && isScanning) {
                    stopScanner();
                }

                if (!html5QrCode) {
                    html5QrCode = new Html5Qrcode("reader");
                }

                html5QrCode.scanFile(imageFile, true)
                    .then(decodedText => {
                        handleScanResult(decodedText);
                    })
                    .catch(err => {
                        console.error("Erreur de scan du fichier:", err);
                        alert("Impossible de trouver un QR Code valide dans cette image.");
                        startScanner();
                    });
            }
        });
    }

    // التعامل مع نتائج السكان وتوجيه المستخدم للواجهة المناسبة
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
        } else if (text.startsWith('WIFI:')) {
            typeName = "Réseau Wi-Fi";
            category = "WIFI";
            mainActionText = "Copier les identifiants";
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

    const scanActionCopy = document.getElementById('scan-action-copy');
    if (scanActionCopy) {
        scanActionCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(scanResultText.textContent);
            alert('Copié dans le presse-papiers !');
        });
    }

    const scanActionShare = document.getElementById('scan-action-share');
    if (scanActionShare) {
        scanActionShare.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'QR Master Pro Résultat',
                    text: scanResultText.textContent
                }).catch(err => console.log(err));
            } else {
                alert('Le partage n\'est pas supporté sur ce navigateur.');
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
            case 'clipboard':
                formTitleText.textContent = "Contenu du presse-papiers";
                html = `<div class="input-group"><label>Valeur lue</label><input type="text" id="input-val" placeholder="Texte récupéré automatiquement..."></div>`;
                navigator.clipboard.readText().then(clipText => {
                    const inputEl = document.getElementById('input-val');
                    if (inputEl) inputEl.value = clipText;
                }).catch(() => {});
                break;
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
                    <div class="input-group"><label>Email</label><input type="email" id="vcard-email" placeholder="contact@example.com"></div>
                `;
                break;
            case 'email':
                formTitleText.textContent = "Adresse courriel";
                html = `
                    <div class="input-group"><label>Email</label><input type="email" id="input-val" placeholder="contact@example.com"></div>
                    <div class="input-group"><label>Sujet</label><input type="text" id="email-subject" placeholder="Sujet du message"></div>
                `;
                break;
            case 'sms':
                formTitleText.textContent = "Adresse SMS";
                html = `
                    <div class="input-group"><label>Numéro de téléphone</label><input type="tel" id="sms-phone" placeholder="+212600000000"></div>
                    <div class="input-group"><label>Message</label><textarea id="sms-body" rows="2" placeholder="Votre message..."></textarea></div>
                `;
                break;
            case 'coordinates':
                formTitleText.textContent = "Coordonnées géographiques";
                html = `
                    <div class="input-group"><label>Latitude</label><input type="text" id="geo-lat" placeholder="33.5731"></div>
                    <div class="input-group"><label>Longitude</label><input type="text" id="geo-lng" placeholder="-7.5898"></div>
                `;
                break;
            case 'phone':
                formTitleText.textContent = "Numéro de téléphone";
                html = `<div class="input-group"><label>Numéro</label><input type="tel" id="input-val" placeholder="+212600000000"></div>`;
                break;
            case 'agenda':
                formTitleText.textContent = "Agenda (Événement)";
                html = `
                    <div class="input-group"><label>Titre de l'événement</label><input type="text" id="event-title" placeholder="Réunion..."></div>
                    <div class="input-group"><label>Date de début</label><input type="datetime-local" id="event-start"></div>
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
            } else if (currentSelectedType === 'contact') {
                const name = document.getElementById('vcard-name')?.value || '';
                const phone = document.getElementById('vcard-phone')?.value || '';
                const email = document.getElementById('vcard-email')?.value || '';
                contentToEncode = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
            } else if (currentSelectedType === 'email') {
                const email = document.getElementById('input-val')?.value || '';
                const subj = document.getElementById('email-subject')?.value || '';
                contentToEncode = `mailto:${email}?subject=${encodeURIComponent(subj)}`;
            } else if (currentSelectedType === 'sms') {
                const phone = document.getElementById('sms-phone')?.value || '';
                const body = document.getElementById('sms-body')?.value || '';
                contentToEncode = `SMSTO:${phone}:${body}`;
            } else if (currentSelectedType === 'coordinates') {
                const lat = document.getElementById('geo-lat')?.value || '';
                const lng = document.getElementById('geo-lng')?.value || '';
                contentToEncode = `geo:${lat},${lng}`;
            } else {
                contentToEncode = document.getElementById('input-val')?.value || '';
            }

            if (!contentToEncode.trim()) {
                alert('Veuillez remplir les champs requis pour générer le QR Code.');
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
            }
        });
    }
});