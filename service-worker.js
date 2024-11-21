<<<<<<< HEAD
const CACHE_NAME = "patient-register-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.js",
  "/manifest.json",
  "/assets/logo.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// Install event: Cache all specified assets for offline use
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and caching assets...");
      return cache.addAll(ASSETS_TO_CACHE);
=======
// Install event: caches app assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('patient-register-cache').then((cache) => {
      return cache.addAll([
        '/patient-register/',
        '/patient-register/index.html',
        '/patient-register/style.css',
        '/patient-register/main.js',
        '/patient-register/manifest.json',
        '/patient-register/icons/icon-192x192.png',
        '/patient-register/icons/icon-512x512.png'
      ]);
>>>>>>> 16b3584b302187424bde3bcc924da682780b0220
    })
  );
});

<<<<<<< HEAD
// Activate event: Clean up old caches if necessary
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: Serve assets from cache or fetch from network if unavailable
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If the response is found in the cache, return it; otherwise, fetch from network
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // Fallback for offline pages or resources
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        })
      );
=======
// Fetch event: Serve cached assets or fetch from network if not cached
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached version if found
      } else {
        return fetch(event.request); // Fetch from network if not cached
      }
>>>>>>> 16b3584b302187424bde3bcc924da682780b0220
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