"use strict";

import {loggerFactory} from "./src/utils/logger.mjs";
import {
  DYNAMIC_CACHE_NAME,
  STATIC_CACHE_NAME,
} from "./src/js/constants/cache-keys.constants.mjs";
import {BASE_API} from "./src/js/constants/api.constants.mjs";
import {dbPromise} from "./src/js/repository/indexdb.mjs";

const logger = loggerFactory("Service Worker");

/**
 * Cache clean up utility function.
 * @param {string} cacheName
 * @param {number} maxEntries Max amount of entries for a given cache
 */
const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const cacheKeys = await cache.keys();
  if (cacheKeys.length > maxEntries) {
    logger(`Trimming Cache: ${cacheName}`);
    await cache.delete(cacheKeys[0]);

    return trimCache(cacheName, maxEntries)
  }
};

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
        "/src/vendor/material.min.js",
        "/src/vendor/idb.mjs",
        "/src/js/repository/indexdb.mjs",
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
  // A good place to clean old Caches versions is when the service has been activated
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

      // Trimming dynamic cache (Note it only fires when a service worker is Activated (a new version is released))
      const trimPromise = trimCache(DYNAMIC_CACHE_NAME, 3);

      return Promise.all([deletedEntriesPromises, trimPromise]);
    })
  );
  // Pages loaded before this service worker was registered will not be controlled by it. This claims the control over
  // those pages.
  return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Handle chrome extensions requests
  if (e.request.url.includes("chrome-extension")) {
    return e.respondWith(fetch(e.request));
  }

  const requestAndStoreCache = async (request) => {
    const response = await fetch(request);
    const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);

    dynamicCache.put(request.url, response.clone());
    return response;
  };

  const requestAndStoreIndexedDb = async (request) => {
    const response = await fetch(request);
    const clonedRes = response.clone();
    const jsonResponse = await clonedRes.json();
    const nonNullPosts = jsonResponse.filter((post) => !!post);

    // FIXME: This resolution of the response is tailored specifically to the posts response model
    //  this may need to be readjusted to other models
    logger("Storing Post in IndexedDB", nonNullPosts)
    const openedDb = await dbPromise;

    for (const post of nonNullPosts) {
      // The transaction is created with the name of the object store and the mode
      const tx = openedDb.transaction('posts', 'readwrite')
      const store = tx.objectStore('posts')
      // Since the keyPath is set to "id", we don't need to specify the key
      store.put(post);
      
      await tx.done;
    }

    return response;
  };

  /**
   * Handles the fetch event with one of the following strategies:
   * 1. If the request is from BASE_API, it will perform the request and store it in the IndexedDB
   * 2. If the request is not from BASE_API, it will try to return the cached version first
   * 3. If it fails, it will perform the request and store it in the cache
   *
   * If it fails on the last step, it will return a custom offline page.
   * @param request
   * @returns {Promise<Response>}
   */
  const handleFetch = async (request) => {
    const url = new URL(request.url)

    // Always perform networking requests for the domain BASE_API(https://httpbin.org)
    if (url.href.includes(BASE_API)) {
      return await requestAndStoreIndexedDb(request);
    }

    // For requests that are not from BASE_API, tries to return cached first
    const cachedRequest = await caches.match(request);

    if (cachedRequest) {
      return cachedRequest;
    }

    // If it fails, just try to perform the request and save it to the cache
    try {
      return await requestAndStoreCache(request);
    } catch (error) {
      logger(`Error while performing request for ${url.href}`)
      // It's also possible to specify which pages or resources we could return an error page
      if (request.headers.get('Accept').includes('text/html')) {
        return await caches.match("/offline/index.html");
      }
    }
  };

  // Calling handleFetch because respondWith expects a promise, not a callback.
  e.respondWith(handleFetch(e.request));
});
