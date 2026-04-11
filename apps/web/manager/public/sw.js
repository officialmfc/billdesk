// Service Worker for MFC Manager Portal
// Provides offline support and caching

const CACHE_NAME = 'mfc-manager-v3';
const RUNTIME_CACHE = 'mfc-runtime-v3';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/',
    '/dashboard',
    '/offline',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Supabase API calls and auth endpoints (always need fresh data)
    if (url.hostname.includes('supabase.co') ||
        url.pathname.includes('/auth/') ||
        url.pathname.includes('/api/auth')) {
        return;
    }

    // Skip manifest, service worker, hot reload, and auth pages
    if (url.pathname === '/manifest.json' ||
        url.pathname === '/sw.js' ||
        url.pathname.includes('_next/static/chunks/') ||
        url.pathname.includes('/login') ||
        url.searchParams.has('_rsc')) {
        return;
    }

    // Network first strategy for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache the response
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Show offline page if available
                        return caches.match('/offline');
                    });
                })
        );
        return;
    }

    // Cache first strategy for static assets (JS, CSS, images)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone and cache the response
                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, responseClone);
                });

                return response;
            });
        })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
