const cacheName = 'ambient-music-cache-v1';
const assets = [
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './audio/chord1.mp3',
    './audio/chord2.mp3',
    './audio/chord3.mp3',
    './audio/chord4.mp3',
    './audio/chord5.mp3',
    './audio/chord6.mp3',
    './audio/chord7.mp3',
    './audio/chord8.mp3',
    './icon-192x192.png',
    './icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(assets))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});