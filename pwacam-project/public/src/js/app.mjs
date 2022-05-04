let deferredPrompt;

// Checking if the browser supports service workers
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../serviceWorker.js", { scope: "/" })
    .then(() => {
      console.log("Service Worker is registered!");
    });
}

// This event is fired by the browser right before it's about to show the banner
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("[App] beforeinstallprompt fired");
  e.preventDefault();

  deferredPrompt = e;

  return false;
});

export { deferredPrompt };
