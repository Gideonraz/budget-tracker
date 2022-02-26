const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/db.js',
    '/index.js',
    '/manifest.json'
  ];

const PRECACHE = 'budget-v1';
const RUNTIME = 'runtime';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(PRECACHE)
        .then( function(cache){
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
  
          return caches.open(RUNTIME).then((cache) => {
            return fetch(event.request).then((response) => {
              return cache.put(event.request, response.clone()).then(() => {
                return response;
              });
            });
          });
        })
      );
    }
  });  
// needs fetch, this might not need activate