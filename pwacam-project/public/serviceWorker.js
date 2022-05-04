// Instead of "this" to refer to the Service Worker
// Remembering that the Service Worker runs on a separate thread and don't have access to the DOM
self.addEventListener('install', (e) => {
    console.log('[Service Worker]: Installing Service Worker ...', e)
})

self.addEventListener('activate', (e) => {
    console.log('[Service Worker]: Activating Service Worker ...', e)

    // Pages loaded before this service worker was registered will not be controlled by it. This claims the control over
    // those pages.
    return self.clients.claim();
})