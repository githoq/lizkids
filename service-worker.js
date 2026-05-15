/* =========================================================================
   LIZKIDS — SERVICE WORKER
   Cache offline básico para PWA.
   ========================================================================= */

const CACHE = 'lizkids-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/design-system.css',
  './css/animations.css',
  './css/components.css',
  './css/screens.css',
  './css/games.css',
  './js/main.js',
  './js/core/error-overlay.js',
  './js/core/storage.js',
  './js/core/state.js',
  './js/core/router.js',
  './js/core/audio.js',
  './js/core/particles.js',
  './js/core/utils.js',
  './js/data/characters.js',
  './js/data/games-catalog.js',
  './js/components/ui.js',
  './js/screens/splash.js',
  './js/screens/profile-select.js',
  './js/screens/home.js',
  './js/screens/games-library.js',
  './js/screens/teacher-dashboard.js',
  './js/screens/rewards-shop.js',
  './js/screens/game-host.js',
  './js/games/memory.js',
  './js/games/math.js',
  './js/games/sequence.js',
  './js/games/count.js',
  './js/games/compare.js',
  './js/games/shapes.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => null)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Não cachear externos (fontes Google) para não inflar
        if (res && res.status === 200 && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
