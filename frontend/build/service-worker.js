self.addEventListener('push', event => {
    const data = event.data.json();
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/VM401196.png' // Change this to your icon's filename
        })
    );
});