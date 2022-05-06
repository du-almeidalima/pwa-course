import {loggerFactory} from "./src/utils/logger.js";

const CACHE_NAME = 'pwagram-static-cache'

const logger = loggerFactory('Service Worker');

// Instead of "this" to refer to the Service Worker
// Remembering that the Service Worker runs on a separate thread and don't have access to the DOM
self.addEventListener('install', (e) => {
  logger(`Installing Service Worker ...`, e)

  // This operation is async, so if just the caches.open is executed, the eventListener bellow on "fetch" might try to
  // access the cache before it's completely opened. So, we can use the "waitUntil" to hold the installation phase
  // until the given promise (caches.open) is finished.
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        logger(`Precaching App Shell`)
        // This will make a request to this file, download a store it into the Cache.
        // It's noteworthy that, when the browser tries to load this script via the <script> tag, it will make this same
        // request.
        cache.add('/src/js/app.mjs')
      })
  )
})

self.addEventListener('activate', (e) => {
  logger(`Activating Service Worker ...`, e)

  // Pages loaded before this service worker was registered will not be controlled by it. This claims the control over
  // those pages.
  return self.clients.claim();
})

// Event triggered by assets loading (.js, .css, .html, .png, etc...) and using the Fetch API.
// INFO: Calls using XMLHttpRequest won't trigger this listener
self.addEventListener('fetch', (e) => {
  // Overriding what the request response will be!
  e.respondWith(fetch(e.request));
})