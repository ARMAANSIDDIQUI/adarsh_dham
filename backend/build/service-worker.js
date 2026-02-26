self.addEventListener('push', event => {
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: data.icon || '/VM401196.png', // Default icon with corrected casing
        badge: '/VM401196.png', // Small icon for the status bar
        image: data.image || '/VM401196.png', // Big image content (defaults to favicon)
        vibrate: [200, 100, 200], // Vibration pattern
        tag: 'adarsh-dham-notification', // Grouping tag
        renotify: true, // Vibrate/sound even if replacing an old notification
        data: {
            url: data.url || '/' // Store the URL to open on click
        },
        sound: '/notification.mp3' // Sound file (needs to be in public folder)
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// PWA Requirement: Functional fetch handler
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});