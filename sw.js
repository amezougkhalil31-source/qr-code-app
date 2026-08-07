const CACHE_NAME = 'qr-master-pro-v3-playstore';

// الملفات التي سيتم حفظها في الـ Cache للعمل بدون إنترنت (Offline)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './privacy.html',
  './launchericon-192x192.png',
  './launchericon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://unpkg.com/html5-qrcode'
];

// 1. تثبيت الـ Service Worker وحفظ الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // استخدام addAll بحذر لتجنب فشل التثبيت عند غياب ملف فردي
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. تفعيل الـ Service Worker وحذف الـ Cache القديم فوراً
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
    }).then(() => self.clients.claim())
  );
});

// 3. اعتراض الطلبات مع توافقية متكاملة لسياسات Google Play & AdMob & Billing
self.addEventListener('fetch', (event) => {
  const reqUrl = event.request.url;

  // استثناء خدمات Google Play Billing و AdMob والسكربتات الخارجية من التخزين المؤقت
  if (
    reqUrl.includes('play.google.com') ||
    reqUrl.includes('google-analytics.com') ||
    reqUrl.includes('googlesyndication.com') ||
    reqUrl.includes('doubleclick.net') ||
    reqUrl.includes('google.com/recaptcha') ||
    event.request.method !== 'GET'
  ) {
    return; // ترك الطلب يمر مباشرة للشبكة بدون اعتراض
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // حفظ الموارد الجديدة الناجحة فقط من نفس النطاق في الكاش
        if (
          networkResponse && 
          networkResponse.status === 200 && 
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // إرجاع الصفحة الرئيسية عند انقطاع الاتصال تماماً
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});