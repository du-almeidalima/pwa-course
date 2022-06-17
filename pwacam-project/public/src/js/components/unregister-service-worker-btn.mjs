import { loggerFactory } from "../../utils/logger.mjs";

const logger = loggerFactory("UnregisterServiceWorkerBtn");

const unregisterServiceWorkerButton = document.querySelector(
  "#unregister-service-worker-btn"
);

unregisterServiceWorkerButton?.addEventListener("click", async () => {
  if ("serviceWorker" in navigator) {
    logger("clickd");
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const r of registrations) {
      r.unregister();
    }
  }
});
