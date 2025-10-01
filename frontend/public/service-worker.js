// This console.log will show in the browser's developer tools, under the 'Application' tab
console.log('Service Worker has been loaded.');

// Listen for a 'push' event from the server
self.addEventListener('push', event => {
    // Parse the data that came with the push message
    const data = event.data.json();
    
    console.log('Push notification received:', data);
    
    // This is the code that actually shows the notification on the user's device
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/logo192.png' // Or any other icon in your /public folder
        })
    );
});