self.addEventListener('push', event => {
    const data = event.data.json();
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/VM401196.svg' // Change this to your icon's filename
        })
    );
});