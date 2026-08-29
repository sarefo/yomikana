"use strict";
const CACHE = "yomikana-v21";
// Every file the app is made of, because a module the cache has never heard of
// is a blank screen the first time the phone is offline: the page itself would
// come back, ask for its imports, and get nothing. The list is kept by hand and
// has to grow with the app — a new module that is not named here works for as
// long as the network lasts and no longer.
const ASSETS = [
  "./", "index.html", "manifest.webmanifest", "icon.svg",
  "css/base.css", "css/home.css", "css/session.css", "css/reading.css",
  "js/main.js", "js/config.js", "js/kana.js", "js/store.js", "js/deck.js",
  "js/views.js", "js/home.js", "js/quiz.js", "js/reading.js", "js/words.js",
  "js/settings.js", "js/speech.js", "js/tap.js",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      // cache: "reload" bypasses the HTTP cache — without it a stale copy can be
      // precached as if it were new, and no later reload would ever dislodge it
      .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // cache storage is shared across the whole origin, so only ever sweep up
    // this app's own old caches — a neighbor's would be collateral damage
    const stale = keys.filter(k => k !== CACHE && k.startsWith("yomikana-"));
    await Promise.all(stale.map(k => caches.delete(k)));
    await self.clients.claim();
    // An upgrade, not a first install: whatever is on screen is the old build,
    // and it should not stay that way. But reloading the page from here lands
    // wherever the person happens to be — mid-question, three tiles into a word
    // — and throws that away without a word of explanation. So the news is sent
    // instead of acted on, and the page picks its own moment.
    if (stale.length) {
      const windows = await self.clients.matchAll({ type: "window" });
      windows.forEach(w => w.postMessage({ type: "upgraded" }));
    }
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    // The page comes from the cache like everything else it is made of, and for
    // the same reason they all have to come from one place: the page is the
    // manifest of which modules go with it. Fetched from the network while its
    // scripts are still served from the cache, a new document is wired to old
    // code — which survives for as long as the markup happens not to change,
    // and on the release where it does is a blank screen with a stack trace
    // behind it. So a build lands whole or not at all: the new one installs
    // underneath this one, and the page takes it on the reload it arranges for
    // itself, one load later than it used to and never half of it.
    e.respondWith((async () => {
      const hit = await caches.match(req, { ignoreSearch: true }) ||
                  await caches.match("index.html") ||
                  await caches.match("./");
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) caches.open(CACHE).then(c => c.put("index.html", res.clone()));
      return res;
    })());
    return;
  }

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit =>
      hit ||
      fetch(req).then(res => {
        if (res.ok && new URL(req.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
    )
  );
});
