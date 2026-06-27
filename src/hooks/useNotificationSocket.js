import { useEffect, useRef, useCallback } from 'react';
import { chatService } from '../services/chatService';

export const useNotificationSocket = (onUnreadUpdate) => {
    const wsRef = useRef(null);
    const reconnectRef = useRef(null);
    const mountedRef = useRef(true);
    const tokenRetryRef = useRef(0);
    const wsRetryRef = useRef(0);

    const callbackRef = useRef(onUnreadUpdate);
    useEffect(() => {
        callbackRef.current = onUnreadUpdate;
    }, [onUnreadUpdate]);

    const connect = useCallback(async () => {
        if (!mountedRef.current) return;

        const user = (() => {
            try { return JSON.parse(localStorage.getItem('user')); }
            catch { return null; }
        })();
        if (!user) return;

        if (wsRef.current && (
            wsRef.current.readyState === WebSocket.OPEN ||
            wsRef.current.readyState === WebSocket.CONNECTING
        )) return;

        let token = localStorage.getItem('ws_access_token');

        if (!token) {
            try {
                const tokenData = await chatService.getWsToken();
                token = tokenData.token;
                tokenRetryRef.current = 0;
                localStorage.setItem('ws_access_token', token);
            } catch (e) {
                const status = e?.response?.status;
                if (status === 401 || tokenRetryRef.current >= 3) {
                    console.warn("Stopping notification ws retries — auth failed.");
                    return;
                }
                tokenRetryRef.current += 1;
                console.warn("Failed to get ws token, retrying in 10s");
                if (mountedRef.current) {
                    reconnectRef.current = setTimeout(connect, 10000);
                }
                return;
            }
        }

        if (!token || !mountedRef.current) return;

        const wsUrl = `${import.meta.env.VITE_WS_URL}/ws/notifications/?token=${encodeURIComponent(token)}`;
        console.log("Notification WebSocket connecting to:", wsUrl);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Notification WebSocket connected.");
            wsRetryRef.current = 0;
        };

        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'unread_count') {
                    callbackRef.current?.(data.conversation_id, data.unread_count);
                    window.dispatchEvent(new CustomEvent('unread_updated', {
                        detail: { conversation_id: data.conversation_id, unread: data.unread_count }
                    }));
                }
            } catch { }
        };

        ws.onclose = (e) => {
            if (e.code === 1000 || !mountedRef.current) return;
            if (wsRetryRef.current >= 5) {
                console.warn("Max WS reconnect attempts reached. Stopping.");
                return;
            }
            wsRetryRef.current += 1;
            localStorage.removeItem('ws_access_token');
            console.warn(`WS closed. Reconnecting in 5s (attempt ${wsRetryRef.current}/5)`);
            reconnectRef.current = setTimeout(connect, 5000);
        };

        ws.onerror = (e) => {
            console.error("WS error:", e);
        };

    }, []);

    useEffect(() => {
        mountedRef.current = true;
        connect();
        return () => {
            mountedRef.current = false;
            clearTimeout(reconnectRef.current);
            localStorage.removeItem('ws_access_token');
            if (wsRef.current) {
                wsRef.current.close(1000);
                wsRef.current = null;
            }
        };
    }, []);
};