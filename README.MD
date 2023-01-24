# Progressive Web Apps Course

This repo contains projects and lessons from
the [Academind by Maximilian Schwarzmüller PWA Course](https://www.udemy.com/course/progressive-web-app-pwa-the-complete-guide)
.

> **Images with the "Udemy" watermark are of ownership of Academind**

## PWA Core Building Blocks

- **Service Workers**: JavaScript process running on a background (different thread) even if the application is closed.
  They allow to get offline access, cache files and serve them in case of no internet connection. They also give access
  to other PWA features such as:

  - **Background Sync**: Dispatch an event when the internet connection is reestablished.
  - **Push Notification**: Since the Service Workers can run on the background, we can use them for notifying the
    user. Even if the tab/app is closed.

- **Application Manifest**: Makes the application installable.

- **Responsive Design**: Adapting the design for the varying devices display sizes.

- **Geolocation API**: Allow the application to get the user location, if this is conceded.

- **Media / Streams API**: Gives access to user media interfaces such as camera and microphone.

![PWA Core Building Blocks](/readme/pwa-core-building-blocks.png)

### Service Workers

![Service Workers Overview](/readme/services-workers-overview.png)

While in a background process, Service Workers can listen and respond to events. Even if the application is closed!

Some of them are:

![Service Workers Events](/readme/services-workers-events.png)

### Caching

With Service Workers intercepting requests, it's possible to implement cache and allow for offline access!

One great concept to know what to cache is to identifying dynamic versus static data. For example, the app shell
(header, footer, main content...) doesn't change very often, so it's a great candidate to be cached.

A great time cache those asses is during the installation phase.

![Installation Caching](/readme/installation-caching.png)

#### Caching Strategies

There are plenty of strategies to when retrieve cached resources and dispatch a network request.
These are some:

##### Strategy: Cache with Network Fallback

In this strategy, the Service Work always checks the cache first for a network requests and if it finds it,
it then, returns the cache. However, if it was a cache miss, a network request will be made and the
result will be dynamically stored in cache for future use.

- **PROS**: Instantly load assets if they are on the cache.
- **CONS**: Not so suitable for frequently updated resources.

![Cache with Network Fallback](/readme/cache-strategy-cache-with-network-fallback.png)

##### Strategy: Cache Only

Completely ignores network and always returns pre-cached assets.

- **PROS**: Suitable for selected assets that you always want to return via cache.
- **CONS**: Internet connection is not used.

![Cache with Network Fallback](/readme/cache-strategy-cache-only.png)

##### Strategy: Network Only

Basically the normal browser behavior. Service worker always dispatches the request to the network.

- **PROS**: Good for frequently updated resources.
- **CONS**: Always ignores cache.

![Cache with Network Fallback](/readme/cache-strategy-network-only.png)

##### Strategy: Network with Cache Fallback

This strategy tries to dispatch a request the network but if it fails, it tries to return a cached resource.

- **PROS**: Allows working offline and tries to use cache for failed requests, therefore,
  not depriving the user from using the application.
- **CONS**: Doesn't takes advantages of the faster response from cached assets.
  Also, some requests may take a long time before failing, thus, this strategy would
  have to wait the request to fail before returning the cache.

![Cache with Network Fallback](/readme/cache-strategy-network-with-cache-fallback.png)

##### Strategy: Cache then Network

This strategy tries to combine the fast delivery of a cached resource while also delivering the latest state/version of it.
Firstly, it serves the cached asset directly, but simultaneously it dispatches a request to the network,
that when completed, will replace the cache returned at the first step. Optionally,
this request can also update the cache once it's successful.

Also, if an error happen to the request, it won't impact the already returned response from cache.
And, if there's no cache, the network request will return the asset.

- **PROS**: Allows working offline, provides the fastest response to the user and leverages Dynamic caching.
- **CONS**: Complicated since the UI/Controller/Component needs to dispatch two requests, one for the cache and the other for the Network.

![Cache with Network Fallback](/readme/cache-strategy-cache-then-network.png)

> Those strategies don't necessarily need to be used isolated. For example, one could use the **Cache Only** for
> static assets (app shell) and **Cache then Network** for a specific domain or any other rule (a Header maybe?)
> This allows to mitigate the drawbacks of each for a specific scenario.

### IndexedDB

Similarly to the Cache API, IndexedDB can also be used to store data.

It stores data in key-value pairs. It can also be used to store cache.

![IndexedDB](/readme/indexed-db.png "IndexedDB")

One key advantage of it over the Cache API is that it can store data/blob/file
and noy only Network Responses as the Cache API.

IndexedDb is often used to cache Dynamic Content.

![Dynamic Caching vs Caching Dynamic Content](/readme/dynamic-caching-vs-caching-dynamic-content.png "Dynamic Caching vs Caching Dynamic Content")
## Links

- [Google Caching Strategies Article](https://developer.chrome.com/docs/workbox/caching-strategies-overview)
