// Install event: caches app assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('patient-register-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/main.js',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
      ]);
    })
  );
});

// Fetch event: Serve cached assets or fetch from network if not cached
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached version if found
      } else {
        return fetch(event.request); // Fetch from network if not cached
      }
    })
  );
});

// Activate event: Ensure outdated cache is removed
self.addEventListener('activate', (event) => {
  const cacheWhitelist = ['patient-register-cache'];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    })
  );
});