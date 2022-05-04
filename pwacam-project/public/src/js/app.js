// Checking if the browser supports service workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../serviceWorker.js', { scope: '/' })
        .then(() => {
            console.log('Service Worker is registered!')
        })
}