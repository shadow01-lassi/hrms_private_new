/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

// 1. Precaching
// This will be replaced by the actual manifest during build
precacheAndRoute(self.__WB_MANIFEST);

// 2. Cleanup old caches
cleanupOutdatedCaches();

// 3. Runtime Caching (Migrated from vite.config.ts)

// Cache Images
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'image-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            }),
        ],
    })
);

// Cache API calls (Migrated from apiCaching in vite.config.ts)
registerRoute(
    ({ url, request }) => {
        return (
            request.method === 'GET' &&
            url.pathname.startsWith('/api') &&
            !url.pathname.startsWith('/api/login') &&
            !url.pathname.startsWith('/api/user')
        );
    },
    new NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 3,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// Cache company logos specifically (Custom logic from original sw.js)
registerRoute(
    ({ url }) => url.pathname.includes('/company-logos/'),
    new CacheFirst({
        cacheName: 'logos-v1',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            }),
        ],
    })
);

// 4. Custom Event Handlers (Migrated from public/sw.js)

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};

    const title = data.title || 'Gate Keeper Alert';
    const options = {
        body: data.body || 'You have a new visitor.',
        icon: data.icon || '/vite.svg',
        badge: '/vite.svg',
        tag: data.tag,
        renotify: data.renotify,
        data: data.data || {},
        sound: data.sound || '/sounds/new-notification-09-352705.mp3',
        vibrate: [200, 100, 200],
        silent: false,
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'View Visitor' }
        ]
    };

    const promiseChain = self.registration.showNotification(title, options).then(() => {
        return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            windowClients.forEach((client) => {
                client.postMessage({
                    type: 'VISITOR_UPDATE',
                    payload: data
                });
            });
        });
    });

    event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/#/home';

    const promiseChain = self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            matchingClient = client;
            break;
        }

        if (matchingClient) {
            return matchingClient.focus();
        }

        if (self.clients.openWindow) {
            return self.clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});
