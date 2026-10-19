/* TaxMitra service worker — safe offline fallback for calculators (PWA).
 * Rules: never intercept API / RSC / dev requests; never serve stale HTML while online;
 * only immutable hashed assets (/_next/static) are cache-first. */
const CACHE = "taxmitra-v4";

const PRECACHE = [
  "/",
  "/tax-saver",
  "/loans",
  "/itr",
  "/gst",
  "/ca-marketplace",
  "/premium",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api") || url.searchParams.has("_rsc") || request.headers.get("rsc")) return;

  if (request.mode === "navigate") {
    // network-first; cached copy only when truly offline
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() =>
        caches
          .match(request)
          .then((r) => r || caches.match("/tax-saver") || caches.match("/") || Response.error())
      )
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
  }
});
