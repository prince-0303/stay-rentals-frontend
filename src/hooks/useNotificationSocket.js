import { useEffect, useRef, useCallback } from 'react';
import { chatService } from '../services/chatService';

export const useNotificationSocket = (onUnreadUpdate) => {
    const wsRef = useRef(null);
    const reconnectRef = useRef(null);
    const mountedRef = useRef(true);
    const retryCountRef = useRef(0);

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

        let token;
        try {
            const tokenData = await chatService.getWsToken();
            token = tokenData.token;
            retryCountRef.current = 0;
            localStorage.setItem('ws_access_token', token);
        } catch (e) {
            const status = e?.response?.status;
            if (status === 401 || retryCountRef.current >= 3) {
                console.warn("Stopping notification ws retries.");
                return;
            }
            retryCountRef.current += 1;
            console.warn("Failed to get notifications ws token, retrying in 10s");
            if (mountedRef.current) {
                reconnectRef.current = setTimeout(connect, 10000);
            }
            return;
        }

        if (!token || !mountedRef.current) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/notifications/?token=${encodeURIComponent(token)}`;

        console.log("Notification WebSocket connecting to:", wsUrl);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

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
            if (e.code !== 1000 && mountedRef.current) {
                reconnectRef.current = setTimeout(connect, 5000);
            }
        };

        ws.onerror = () => {
            ws.close();
        };

    }, []);

    useEffect(() => {
        mountedRef.current = true;
        connect();
        return () => {
            mountedRef.current = false;
            clearTimeout(reconnectRef.current);
            if (wsRef.current) {
                wsRef.current.close(1000);
                wsRef.current = null;
            }
        };
    }, []);
};