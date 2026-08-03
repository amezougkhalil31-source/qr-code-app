let currentFormType = '';

function switchTab(tabId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const targetSection = document.getElementById(tabId + '-section');
    if (targetSection) targetSection.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(tabId)) {
            item.classList.add('active');
        }
    });

    if (tabId === 'scanner') {
        startCamera();
    } else {
        stopCamera();
    }
}

function openTypeForm(type) {
    currentFormType = type;
    document.getElementById('types-menu-view').style.display = 'none';
    const formView = document.getElementById('dynamic-form-view');
    formView.style.display = 'block';

    const titleText = document.getElementById('form-title-text');
    const titleIcon = document.getElementById('form-title-icon');
    const container = document.getElementById('form-inputs-container');
    
    container.innerHTML = '';
    document.getElementById('qr-result').innerHTML = '';

    let html = '';

    switch (type) {
        case 'clipboard':
            titleText.innerText = 'Contenu du presse-papiers';
            titleIcon.className = 'fa-solid fa-clipboard';
            html = `
                <div class="input-group">
                    <label>Texte récupéré</label>
                    <textarea id="input-field-1" placeholder="Collez le texte ici..."></textarea>
                </div>
            `;
            break;

        case 'url':
            titleText.innerText = 'URL';
            titleIcon.className = 'fa-solid fa-link';
            html = `
                <div class="input-group">
                    <label>Lien Web (URL)</label>
                    <input type="url" id="input-field-1" value="http://" placeholder="http://">
                </div>
            `;
            break;

        case 'text':
            titleText.innerText = 'Texte en clair';
            titleIcon.className = 'fa-solid fa-font';
            html = `
                <div class="input-group">
                    <label>Texte en clair trouvé</label>
                    <textarea id="input-field-1" placeholder="Entrez votre texte ici..."></textarea>
                </div>
            `;
            break;

        case 'contact':
            titleText.innerText = 'Contact';
            titleIcon.className = 'fa-solid fa-user';
            html = `
                <div class="input-group">
                    <label>Nom complet</label>
                    <input type="text" id="input-field-1" placeholder="Nom complet">
                </div>
                <div class="input-group">
                    <label>Organisation</label>
                    <input type="text" id="input-field-2" placeholder="Nom de l'entreprise">
                </div>
                <div class="input-group">
                    <label>Adresse</label>
                    <input type="text" id="input-field-3" placeholder="Adresse physique">
                </div>
                <div class="input-group">
                    <label>Numéro de téléphone</label>
                    <input type="tel" id="input-field-4" placeholder="Numéro de téléphone">
                </div>
                <div class="input-group">
                    <label>Adresse courriel</label>
                    <input type="email" id="input-field-5" placeholder="Adresse courriel">
                </div>
                <div class="input-group">
                    <label>Remarques</label>
                    <textarea id="input-field-6" placeholder="Remarques..."></textarea>
                </div>
            `;
            break;

        case 'email':
            titleText.innerText = 'Adresse courriel';
            titleIcon.className = 'fa-solid fa-envelope';
            html = `
                <div class="input-group">
                    <label>Adresse courriel</label>
                    <input type="email" id="input-field-1" placeholder="Adresse courriel">
                </div>
                <div class="input-group">
                    <label>Sujet</label>
                    <input type="text" id="input-field-2" placeholder="Sujet">
                </div>
                <div class="input-group">
                    <label>Corps</label>
                    <textarea id="input-field-3" placeholder="Corps du message..."></textarea>
                </div>
            `;
            break;

        case 'sms':
            titleText.innerText = 'Adresse SMS';
            titleIcon.className = 'fa-solid fa-comment-sms';
            html = `
                <div class="input-group">
                    <label>Numéro de téléphone</label>
                    <input type="tel" id="input-field-1" placeholder="Numéro de téléphone">
                </div>
                <div class="input-group">
                    <label>Message</label>
                    <textarea id="input-field-2" placeholder="Message..."></textarea>
                </div>
            `;
            break;

        case 'coordinates':
            titleText.innerText = 'Coordonnées géographiques';
            titleIcon.className = 'fa-solid fa-location-dot';
            html = `
                <div class="input-group">
                    <label>Latitude</label>
                    <input type="text" id="input-field-1" placeholder="Latitude (ex: 30.4278)">
                </div>
                <div class="input-group">
                    <label>Longitude</label>
                    <input type="text" id="input-field-2" placeholder="Longitude (ex: -9.5981)">
                </div>
                <div class="input-group">
                    <label>Requête</label>
                    <input type="text" id="input-field-3" placeholder="Requête de recherche">
                </div>
            `;
            break;

        case 'phone':
            titleText.innerText = 'Numéro de téléphone';
            titleIcon.className = 'fa-solid fa-phone';
            html = `
                <div class="input-group">
                    <label>Numéro de téléphone</label>
                    <input type="tel" id="input-field-1" placeholder="Numéro de téléphone">
                </div>
            `;
            break;

        case 'agenda':
            titleText.innerText = 'Agenda';
            titleIcon.className = 'fa-solid fa-calendar-days';
            html = `
                <div class="input-group">
                    <label>Titre de l'événement</label>
                    <input type="text" id="input-field-1" placeholder="Titre">
                </div>
                <div class="input-group">
                    <label>Lieu</label>
                    <input type="text" id="input-field-2" placeholder="Lieu">
                </div>
                <div class="input-group">
                    <label>Description</label>
                    <textarea id="input-field-3" placeholder="Description"></textarea>
                </div>
            `;
            break;

        case 'wifi':
            titleText.innerText = 'Wi-Fi';
            titleIcon.className = 'fa-solid fa-wifi';
            html = `
                <div class="input-group">
                    <label>Nom du réseau (SSID)</label>
                    <input type="text" id="input-field-1" placeholder="Nom du Wi-Fi">
                </div>
                <div class="input-group">
                    <label>Mot de passe</label>
                    <input type="text" id="input-field-2" placeholder="Mot de passe">
                </div>
                <div class="input-group">
                    <label>Type de sécurité</label>
                    <select id="input-field-3">
                        <option value="WPA">WPA / WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Aucun (Réseau Ouvert)</option>
                    </select>
                </div>
            `;
            break;
    }

    container.innerHTML = html;

    if (type === 'clipboard' && navigator.clipboard) {
        navigator.clipboard.readText().then(text => {
            if (text) document.getElementById('input-field-1').value = text;
        }).catch(() => {});
    }
}

function backToTypesMenu() {
    document.getElementById('dynamic-form-view').style.display = 'none';
    document.getElementById('types-menu-view').style.display = 'block';
    document.getElementById('qr-result').innerHTML = '';
}

document.getElementById('generate-custom-btn').addEventListener('click', function() {
    let qrData = '';
    const size = document.getElementById('qr-size').value;
    const resultContainer = document.getElementById('qr-result');

    switch (currentFormType) {
        case 'clipboard':
        case 'text':
        case 'url':
            qrData = document.getElementById('input-field-1').value.trim();
            break;

        case 'phone':
            const phoneNum = document.getElementById('input-field-1').value.trim();
            qrData = phoneNum ? `tel:${phoneNum}` : '';
            break;

        case 'email':
            const email = document.getElementById('input-field-1').value.trim();
            const subject = document.getElementById('input-field-2').value.trim();
            const body = document.getElementById('input-field-3').value.trim();
            qrData = email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : '';
            break;

        case 'sms':
            const smsPhone = document.getElementById('input-field-1').value.trim();
            const smsMsg = document.getElementById('input-field-2').value.trim();
            qrData = smsPhone ? `smsto:${smsPhone}:${smsMsg}` : '';
            break;

        case 'coordinates':
            const lat = document.getElementById('input-field-1').value.trim();
            const lng = document.getElementById('input-field-2').value.trim();
            const q = document.getElementById('input-field-3').value.trim();
            qrData = `geo:${lat},${lng}?q=${encodeURIComponent(q)}`;
            break;

        case 'contact':
            const fn = document.getElementById('input-field-1').value.trim();
            const org = document.getElementById('input-field-2').value.trim();
            const adr = document.getElementById('input-field-3').value.trim();
            const tel = document.getElementById('input-field-4').value.trim();
            const em = document.getElementById('input-field-5').value.trim();
            const note = document.getElementById('input-field-6').value.trim();
            qrData = `BEGIN:VCARD\nVERSION:3.0\nN:${fn}\nORG:${org}\nADR:${adr}\nTEL:${tel}\nEMAIL:${em}\nNOTE:${note}\nEND:VCARD`;
            break;

        case 'agenda':
            const title = document.getElementById('input-field-1').value.trim();
            const loc = document.getElementById('input-field-2').value.trim();
            const desc = document.getElementById('input-field-3').value.trim();
            qrData = `BEGIN:VEVENT\nSUMMARY:${title}\nLOCATION:${loc}\nDESCRIPTION:${desc}\nEND:VEVENT`;
            break;

        case 'wifi':
            const ssid = document.getElementById('input-field-1').value.trim();
            const pass = document.getElementById('input-field-2').value.trim();
            const sec = document.getElementById('input-field-3').value;
            qrData = `WIFI:S:${ssid};T:${sec};P:${pass};;`;
            break;
    }

    if (!qrData) {
        alert('Veuillez remplir les informations requises !');
        return;
    }

    resultContainer.innerHTML = '<p style="color: #38bdf8;">Génération du QR Code...</p>';

    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}`;

    const img = new Image();
    img.src = apiUrl;
    img.alt = "QR Code Généré";
    img.onload = function() {
        resultContainer.innerHTML = '';
        resultContainer.appendChild(img);

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Télécharger le QR Code';
        downloadBtn.onclick = function() {
            const a = document.createElement('a');
            a.href = apiUrl;
            a.download = 'qrcode.png';
            a.click();
        };
        resultContainer.appendChild(downloadBtn);
    };
});

const menuToggleBtn = document.getElementById('menu-toggle-btn');
const settingsDrawer = document.getElementById('settings-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
        settingsDrawer.classList.add('open');
        drawerOverlay.classList.add('active');
    });
}

if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', () => {
        settingsDrawer.classList.remove('open');
        drawerOverlay.classList.remove('active');
    });
}

if (drawerOverlay) {
    drawerOverlay.addEventListener('click', () => {
        settingsDrawer.classList.remove('open');
        drawerOverlay.classList.remove('active');
    });
}

let videoStream = null;

async function startCamera() {
    const video = document.getElementById('scanner-video');
    if (!video) return;

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        video.srcObject = videoStream;
    } catch (e) {
        console.log("Erreur d'accès à la caméra:", e);
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}