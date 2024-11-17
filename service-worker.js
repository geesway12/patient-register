// Cache files and assets for offline use
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('patient-register-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/main.js',
        '/manifest.json',
        '/assets/logo.png',
        // Add any other assets your app needs
      ]);
    })
  );
});

// Fetch and serve cached assets when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
