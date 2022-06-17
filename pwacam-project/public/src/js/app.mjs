import "../js/components/unregister-service-worker-btn.mjs";

let deferredPrompt;

// Checking if the browser supports service workers
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../serviceWorker-cache-then-networking.js", {
      scope: "/",
      type: "module",
    })
    .then(() => {
      console.log("[App] Service Worker is registered!");
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
