import { useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';

export const useUnreadMessages = (onNewMessage) => {
    const intervalRef = useRef(null);
    const lastCountRef = useRef({});

    useEffect(() => {
        const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
        if (!user) return;

        const poll = async () => {
            try {
                const conversations = await chatService.getConversations();
                conversations.forEach(conv => {
                    const prev = lastCountRef.current[conv.id] ?? conv.unread_count;
                    if (conv.unread_count > prev) {
                        onNewMessage(conv);
                    }
                    lastCountRef.current[conv.id] = conv.unread_count;
                });
            } catch (e) {
                // Stop polling on auth failure
                if (e?.response?.status === 401) {
                    clearInterval(intervalRef.current);
                }
            }
        };

        poll();
        intervalRef.current = setInterval(poll, 10000);
        return () => clearInterval(intervalRef.current);
    }, []);
};