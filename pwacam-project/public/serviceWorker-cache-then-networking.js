"use strict";

import { loggerFactory } from "./src/utils/logger.mjs";
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


// This strategy assumes that the caller of Fetch already got a cached version of the resource
// requested.
self.addEventListener("fetch", (e) => {

  const handleFetch = async () => {
    const fetchRes = await fetch(e.request);
    const cache = await caches.open(DYNAMIC_CACHE_NAME);

    cache.put(e.request.url, fetchRes.clone());

    return fetchRes;
  };

  // Calling handleFetch because respondWith expects a promise, not a callback.
  e.respondWith(handleFetch());
});