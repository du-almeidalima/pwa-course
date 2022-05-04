const LOGGER_NAME = '[Service Worker]:'

// Instead of "this" to refer to the Service Worker
// Remembering that the Service Worker runs on a separate thread and don't have access to the DOM
self.addEventListener('install', (e) => {
    console.log(`${LOGGER_NAME} Installing Service Worker ...`, e)
})

self.addEventListener('activate', (e) => {
    console.log(`${LOGGER_NAME} Activating Service Worker ...`, e)

    // Pages loaded before this service worker was registered will not be controlled by it. This claims the control over
    // those pages.
    return self.clients.claim();
})

// Event triggered by assets loading (.js, .css, .html, .png, etc...) and using the Fetch API.
// INFO: Calls using XMLHttpRequest won't trigger this listener
self.addEventListener('fetch', (e) => {
    console.log(`${LOGGER_NAME} Fetching something...`, e)

    // Overriding what the request response will be!
    e.respondWith(fetch(e.request));
})