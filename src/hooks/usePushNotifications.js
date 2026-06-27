import { useEffect, useRef } from 'react';
import { messaging, getToken, onMessage } from '../config/firebase.config';
import api from '../services/api';

const registerToken = async () => {
    try {
        if (Notification.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        let registration;
        try {
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;
        } catch (swErr) {
            console.error('Service worker registration failed:', swErr);
            return;
        }

        let token;
        try {
            token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration,
            });
        } catch (tokenErr) {
            console.error('getToken failed:', tokenErr);
            return;
        }

        if (!token) {
            console.warn('No FCM token returned');
            return;
        }

        console.log('FCM token obtained:', token.substring(0, 20) + '...');

        try {
            const response = await api.post('/notifications/register-token/', { token });
            console.log('FCM token registered with backend:', response.data);
        } catch (apiErr) {
            console.error('Backend token registration failed:', apiErr.response?.data || apiErr.message);
        }
    } catch (err) {
        console.error('registerToken unexpected error:', err);
    }
};

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        if (permission !== 'granted') return;
        await registerToken();
    } catch (err) {
        console.error('Push notification setup failed:', err);
    }
};

export const usePushNotifications = () => {
    const tokenRegistered = useRef(false);

    useEffect(() => {
        const user = (() => {
            try { return JSON.parse(localStorage.getItem('user')); }
            catch { return null; }
        })();

        if (!user) {
            console.log('No user found, skipping push notification setup');
            return;
        }

        console.log('Setting up push notifications for user:', user.email || user.id);

        if (!tokenRegistered.current) {
            if (Notification.permission === 'granted') {
                tokenRegistered.current = true;
                registerToken();
            } else if (Notification.permission === 'default') {
                requestNotificationPermission().then(() => {
                    tokenRegistered.current = true;
                });
            } else {
                console.warn('Notification permission denied');
            }
        }

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground FCM message received:', payload);
            const conversationId = payload.data?.conversation_id;
            const notification = new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: '/vite.svg',
            });
            notification.onclick = () => {
                window.focus();
                if (conversationId) {
                    window.location.href = `/chat?conversation=${conversationId}`;
                }
            };
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);
};