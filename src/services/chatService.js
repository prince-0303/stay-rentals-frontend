import api from './api';

export const chatService = {
    getConversations: () => api.get('/chat/conversations/').then(r => r.data),

    startConversation: (property_id) => api.post('/chat/conversations/', { property_id }).then(r => r.data),

    getWsToken: () => api.get('/chat/token/').then(r => r.data),

    getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages/`).then(r => r.data),

    sendMessage: (conversationId, content) => api.post(`/chat/conversations/${conversationId}/messages/`, { content }).then(r => r.data),

    createWebSocket: (conversationId) => {
        const token = localStorage.getItem('ws_access_token');
        if (!token) {
            console.warn("No WS token → likely not logged in or token expired");
            return null;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/chat/${conversationId}/?token=${encodeURIComponent(token)}`;

        console.log("WebSocket connecting to:", wsUrl);

        try {
            return new WebSocket(wsUrl);
        } catch (err) {
            console.error("Critical error creating WebSocket object:", err);
            return null;
        }
    }
};