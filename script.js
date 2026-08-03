// دالة لتغيير الأقسام عند الضغط على أزرار شريط التنقل
function switchSection(sectionId) {
    // إخفاء جميع الأقسام
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.remove('active'));

    // إزالة الصبغة النشطة من جميع الأزرار
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // تفعيل الزر المناسب في القائمة
    // (نبحث عن الزر الذي يحتوي على دالة تبديل تخص نفس القسم)
    navButtons.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
        }
    });
}

// برمجة زر توليد الـ QR Code
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

        // مسح النتيجة القديمة إن وجدت
        resultContainer.innerHTML = '';

        // استخدام مكتبة توليد الـ QR Code عبر رابط خارجي مباشر (API)
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(inputVal)}`;

        // إنشاء عنصر الصورة وعرضه
        const qrImage = document.createElement('img');
        qrImage.src = qrApiUrl;
        qrImage.alt = 'Generated QR Code';
        qrImage.style.borderRadius = '8px';
        qrImage.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';

        resultContainer.appendChild(qrImage);
    });
}