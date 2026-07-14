const CACHE_NAME = 'sheepcare-v8';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './badge.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(URLS_TO_CACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ),
  ]));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request)
        .then(res => {
          if (res && res.ok && res.type === 'basic') {
            caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// ── Push-Benachrichtigungen ────────────────────────────────────────────────
// Pushes kommen ohne Payload (kein aes128gcm nötig). Die Nachricht wird anhand
// der lokalen Uhrzeit beim Empfang gewählt.
self.addEventListener('push', (e) => {
  const hour = new Date().getHours();
  // Ab ~22 Uhr: Letzte-Chance-Alarm, sonst freundliche Erinnerung.
  const late = hour >= 22 || hour < 5;
  let title, body;
  if (e.data) {
    // Optionaler Payload (z.B. vom /test-Endpoint) hat Vorrang
    try {
      const p = e.data.json();
      title = p.title; body = p.body;
    } catch { /* ignorieren */ }
  }
  if (!title) title = 'SheepCare 🐑';
  if (!body) {
    body = late
      ? 'Ohne Schafpflege laufen die Schafe weg! Trag dich noch schnell ein.'
      : 'Du musst noch Schafpflege betreiben! 🐑';
  }
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: './icon-192.png',
      badge: './badge.png',
      vibrate: [100, 50, 100],
      tag: 'sheepcare-reminder',
      renotify: true,
      data: { url: './' },
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
