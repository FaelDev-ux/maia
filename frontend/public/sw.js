const MAIA_CACHE_NAME = "maia-pwa-v2";
const MAIA_STATIC_ASSETS = [
  "/",
  "/home",
  "/manifest.json",
  "/images/logo-maia.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(MAIA_CACHE_NAME)
      .then((cache) => cache.addAll(MAIA_STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== MAIA_CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedHome = await caches.match("/home");

        return (
          cachedHome ??
          new Response("Maia está temporariamente offline.", {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            status: 503,
          })
        );
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        const shouldCache =
          networkResponse.ok &&
          ["script", "style", "image", "font", "manifest"].includes(event.request.destination);

        if (shouldCache) {
          const responseClone = networkResponse.clone();

          caches.open(MAIA_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return networkResponse;
      });
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "Maia";
  const options = {
    body: payload.body || "Hora de fazer um check-in gentil.",
    data: {
      url: payload.url || "/check-in",
    },
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/home";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => new URL(client.url).pathname === targetUrl);

      if (existingClient) {
        return existingClient.focus();
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
