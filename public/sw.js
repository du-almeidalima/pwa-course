self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('first-app')
      .then(function(cache) {
        cache.addAll([
          '/',
          '/index.html',
          '/src/css/app.css',
          '/src/js/app.js'
        ])
      })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(function(res) {
        return res;
      })
  );
});