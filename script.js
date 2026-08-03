// دالة الانتقال بين الأقسام والشاشات
function switchTab(tabId) {
    // إخفاء جميع الأقسام
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.remove('active'));

    // إزالة التفعيل من أزرار الشريط السفلي
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // إظهار القسم المطلوب
    const targetSection = document.getElementById(tabId + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // تفعيل الزر المناسب في الشريط السفلي
    navItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(tabId)) {
            item.classList.add('active');
        }
    });
}

// تصحيح التفاعل اليدوي مع الأزرار السفلية
document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });
});

// برمجة توليد وحفظ الـ QR Code في السجل والذاكرة المحلية
const generateBtn = document.getElementById('generate-btn');
if (generateBtn) {
    generateBtn.addEventListener('click', function() {
        const inputVal = document.getElementById('qr-input').value.trim();
        const qrSize = document.getElementById('qr-size').value;
        const resultContainer = document.getElementById('qr-result');

        if (!inputVal) {
            alert('المرجو إدخال رابط أو نص صالح أولاً!');
            return;
        }

        resultContainer.innerHTML = '';

        // رابط توليد الـ QR Code
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(inputVal)}`;

        const qrImage = document.createElement('img');
        qrImage.src = qrApiUrl;
        qrImage.alt = 'Generated QR Code';
        qrImage.style.borderRadius = '12px';
        qrImage.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';

        resultContainer.appendChild(qrImage);

        // حفظ الـ QR Code في الذاكرة المحلية (LocalStorage) باش ما يمشيش بالريفريش
        saveToHistory(inputVal, qrApiUrl);
    });
}

// دالة حفظ السجل
function saveToHistory(text, url) {
    let history = JSON.parse(localStorage.getItem('qr_history')) || [];
    
    // إضافة العنصر الجديد في البداية
    history.unshift({ text: text, url: url, date: new Date().toLocaleDateString() });
    
    // الاحتفاظ فقط بآخر 10 عناصر
    if (history.length > 10) history.pop();

    localStorage.setItem('qr_history', JSON.stringify(history));
    loadHistory();
}

// دالة تحميل وعرض السجل في صفحة Historique
function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    let history = JSON.parse(localStorage.getItem('qr_history')) || [];

    if (history.length === 0) {
        historyList.innerHTML = `<p class="empty-text">Aucun historique pour le moment.</p>`;
        return;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.style.cssText = "display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 10px 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0;";
        
        historyItem.innerHTML = `
            <div style="text-align: left; overflow: hidden; max-width: 70%;">
                <p style="font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.text}</p>
                <span style="font-size: 10px; color: #64748b;">${item.date}</span>
            </div>
            <img src="${item.url}" alt="QR" style="width: 40px; height: 40px; border-radius: 6px;">
        `;
        historyList.appendChild(historyItem);
    });
}

// تحميل السجل مباشرة عند فتح الصفحة
window.onload = function() {
    loadHistory();
};