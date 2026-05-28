const CACHE = 'studiq-v1'

// Install — skip waiting so new SW activates immediately
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Push notification received
self.addEventListener('push', e => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'StudiQ', {
      body: data.body ?? "Time to study — SPOK is waiting.",
      icon: '/api/pwa-icon/192',
      badge: '/api/pwa-icon/192',
      data: { url: data.url ?? '/dashboard' },
      tag: 'studiq-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
    })
  )
})

// Notification clicked — navigate to the relevant URL
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = new URL(e.notification.data?.url ?? '/dashboard', self.location.origin).href
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.startsWith(self.location.origin))
      if (existing) return existing.navigate(url).then(c => c?.focus())
      return clients.openWindow(url)
    })
  )
})

// Activate — delete old caches, claim all clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return

  const url = new URL(e.request.url)

  // Skip external requests and internal API routes (must be fresh)
  if (url.hostname !== self.location.hostname) return
  if (url.pathname.startsWith('/api/')) return

  // Next.js static chunks are immutable — cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        if (hit) return hit
        return fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()))
          return res
        })
      })
    )
    return
  }

  // Pages — network-first, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
