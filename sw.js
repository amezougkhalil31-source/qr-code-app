const CACHE_NAME = 'qr-master-pro-v3';
const assetsToCache = [
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './privacy.html'
];

// 1. مرحلة التثبيت (Installation): تخزين جميع ملفات التطبيق الأساسية في الذاكرة المؤقتة
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(assetsToCache);
        })
    );
});

// 2. مرحلة التفعيل (Activation): حذف النسخ القديمة من الكاش والاحتفاظ بالنسخة الحالية فقط
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. مرحلة جلب الطلبات (Fetch): تشغيل التطبيق بدون إنترنت واعتماد الكاش أو جلب البيانات من الشبكة
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});