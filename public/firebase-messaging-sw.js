importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDE1ccTlncs3G6pANnYSbLwOqP9SkNd4Nk",
    authDomain: "rentals-23052.firebaseapp.com",
    projectId: "rentals-23052",
    storageBucket: "rentals-23052.firebasestorage.app",
    messagingSenderId: "553433589481",
    appId: "1:553433589481:web:6f947de1cbe7837f3e3278",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/vite.svg',
        data: payload.data || {},
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const conversationId = event.notification.data?.conversation_id;
    const url = conversationId
        ? `http://localhost:5173/chat?conversation=${conversationId}`
        : 'http://localhost:5173/chat';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
