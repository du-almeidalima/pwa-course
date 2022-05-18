"use strict";

import { loggerFactory } from "./src/utils/logger.js";
import {
  DYNAMIC_CACHE_NAME,
  STATIC_CACHE_NAME,
} from "./src/js/constants/cache-keys.mjs";

const logger = loggerFactory("Service Worker");

// Instead of "this" to refer to the Service Worker
// Remembering that the Service Worker runs on a separate thread and don't have access to the DOM
self.addEventListener("install", (e) => {
  logger(`Installing Service Worker ...`, e);

  // This operation is async, so if just the caches.open is executed, the eventListener bellow on "fetch" might try to
  // access the cache before it's completely opened. So, we can use the "waitUntil" to hold the installation phase
  // until the given promise (caches.open) is finished.
  e.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      logger(`Precaching App Shell`);
      // This will make a request to this file, download a store it into the Cache.
      // It's noteworthy that, when the browser tries to load this script via the <script> tag, it will make this same
      // request.
      cache.add("/src/js/app.mjs");
      // When caching, it's important to keep in mind that, CacheAPI will use the request as the key
      // So even though we access a page omitting the "/index.html" on the URL (because the browser does that for us)
      // The CacheAPI will consider accessing the document "/index.html" and "/" two different requests.
      cache.add("/index.html");
      cache.add("/");
      // Adding assets in bulk
      cache.addAll([
        "/offline",
        "/offline/index.html",
        "/src/js/feed.mjs",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/images/main-image.jpg",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
      ]);
    })
  );
});

self.addEventListener("activate", (e) => {
  logger(`Activating Service Worker ...`, e);
  // A good place to clean old Caches is when the service has been activated
  // This won't break a running application because this step is only triggered when the
  // user closes the all tabs.
  e.waitUntil(
    caches.keys().then((keyListRes) => {
      const deletedEntriesPromises = keyListRes
        .filter(
          (key) => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME
        )
        .map((key) => {
          logger("Removing old cache entry: ", key);
          caches.delete(key);
        });

      return Promise.all(deletedEntriesPromises);
    })
  );
  // Pages loaded before this service worker was registered will not be controlled by it. This claims the control over
  // those pages.
  return self.clients.claim();
});

// Event triggered by assets loading (.js, .css, .html, .png, etc...) and using the Fetch API.
// INFO: Calls using XMLHttpRequest won't trigger this listener
self.addEventListener("fetch", (e) => {
  // Overriding what the request response will be!
  // e.respondWith(fetch(e.request));

  const handleFetch = async () => {
    // CacheAPI uses the request as the key.
    // Matches also looks in ALL caches
    const cacheRes = await caches.match(e.request);
    if (cacheRes) {
      // Returning request/response from CacheAPI
      return cacheRes;
    }

    // If a request is made offline and the user doesn't have the resources cached
    // this will throw an exception. We can use this to serve a offline page.
    try {
      const fetchRes = await fetch(e.request);
      const cache = await caches.open(DYNAMIC_CACHE_NAME);

      // .put() will not perform the request and cache it, like .add()
      // Instead, it expects you to provide the url and response. This is useful when
      // The request is already made and we just want to cache it.
      cache.put(e.request.url, fetchRes.clone());
      // A Response can only be consumed once, that's why it's needed to clone it.
      // https://developer.mozilla.org/en-US/docs/Web/API/Response/clone

      return fetchRes;
    } catch (error) {
      // This approach of handling the offline / network error has a pitfall on which
      // for any error it will return the offline page, regardless of it being a json/css/js requests.
      // FIXME: Differentiate types of request and only return offline page for routes/document/html requests.
      const cache = await caches.open(STATIC_CACHE_NAME);
      return await cache.match("/offline/index.html");
    }
  };

  // Calling handleFetch because respondWith expects a promise, not a callback.
  e.respondWith(handleFetch());
});
