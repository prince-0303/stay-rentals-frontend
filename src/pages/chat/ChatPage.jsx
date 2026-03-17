import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import { chatService } from '../../services/chatService';

const ChatPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [wsConnected, setWsConnected] = useState(false);

    const wsRef = useRef(null);
    const selectionRef = useRef(null);
    const connectingRef = useRef(null);
    const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

    useEffect(() => {
        const initChat = async () => {
            try {
                const tokenData = await chatService.getWsToken();
                localStorage.setItem('ws_access_token', tokenData.token);

                const data = await chatService.getConversations();
                setConversations(data);

                const convId = searchParams.get('conversation');
                if (convId) {
                    const found = data.find(c => c.id === parseInt(convId));
                    if (found) selectConversation(found, false);
                }
            } catch (err) {
                console.error('Chat init error:', err);
            } finally {
                setLoading(false);
            }
        };
        initChat();
    }, []);

    useEffect(() => {
        return () => { if (wsRef.current) wsRef.current.close(); };
    }, []);

    const selectConversation = async (conversation, updateUrl = false) => {
        const conversationId = conversation.id;
        if (selectionRef.current === conversationId && (wsConnected || connectingRef.current === conversationId)) return;

        selectionRef.current = conversationId;
        connectingRef.current = conversationId;
        setWsConnected(false);
        setActiveConversation(conversation);
        if (updateUrl) {
            setSearchParams({ conversation: conversationId }, { replace: true });
        }

        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
            await new Promise(resolve => {
                wsRef.current.onopen = wsRef.current.onmessage = wsRef.current.onerror = null;
                wsRef.current.onclose = resolve;
                wsRef.current.close();
            });
        }
        wsRef.current = null;
        if (selectionRef.current !== conversationId) return;

        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c));

        try {
            const msgs = await chatService.getMessages(conversationId);
            if (selectionRef.current !== conversationId) return;
            setMessages(msgs);
        } catch (err) {
            console.error('History retrieval failed:', err);
        }

        const ws = chatService.createWebSocket(conversationId);
        if (!ws) { connectingRef.current = null; return; }

        ws.onopen = () => {
            if (selectionRef.current === conversationId) {
                wsRef.current = ws;
                setWsConnected(true);
            } else { ws.close(); }
            connectingRef.current = null;
        };

        ws.onclose = () => {
            if (selectionRef.current === conversationId) {
                setWsConnected(false);
                wsRef.current = null;
            }
        };

        ws.onmessage = (event) => {
            if (selectionRef.current !== conversationId) return;
            try {
                const data = JSON.parse(event.data);
                const newMessage = {
                    id: data.message_id,
                    sender_id: data.sender_id,
                    sender_name: data.sender_name,
                    content: data.content,
                    created_at: data.created_at,
                    is_read: false,
                };

                setMessages(prev => prev.some(m => m.id === newMessage.id) ? prev : [...prev, newMessage]);
                setConversations(prev => {
                    const index = prev.findIndex(c => c.id === conversationId);
                    if (index === -1) return prev;
                    const updated = [...prev];
                    const [conv] = updated.splice(index, 1);
                    return [{
                        ...conv,
                        last_message: { content: data.content, created_at: data.created_at, sender_name: data.sender_name },
                        unread_count: (selectionRef.current === conv.id) ? 0 : (conv.unread_count || 0) + (data.sender_id !== currentUser?.id ? 1 : 0)
                    }, ...updated];
                });
            } catch (e) { console.error('Network error:', e); }
        };
    };

    const handleCloseConversation = () => {
        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setActiveConversation(null);
        setSearchParams({});
    };

    const sendMessage = async () => {
        if (!input.trim() || !activeConversation) return;
        const content = input.trim();

        const optimisticMsg = {
            id: `optimistic-${Date.now()}`,
            sender_id: currentUser?.id,
            sender_name: currentUser?.full_name || 'You',
            content,
            created_at: new Date().toISOString(),
            is_read: false,
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setConversations(prev => {
            const index = prev.findIndex(c => c.id === activeConversation?.id);
            if (index === -1) return prev;
            const updated = [...prev];
            const [conv] = updated.splice(index, 1);
            return [{ ...conv, last_message: { content, created_at: optimisticMsg.created_at, sender_name: currentUser?.full_name || 'You' } }, ...updated];
        });
        setInput('');

        // Try WebSocket first
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ content }));
            return;
        }

        // Fallback to REST API
        try {
            const sent = await chatService.sendMessage(activeConversation.id, content);
            setMessages(prev => prev.map(m =>
                m.id === optimisticMsg.id ? { ...sent, is_read: false } : m
            ));
        } catch (err) {
            console.error('Send failed:', err);
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            alert('Failed to send message. Please try again.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-brand-blue-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="h-[calc(100vh-80px)] mt-20 flex flex-col bg-brand-offwhite overflow-hidden">
            <main className="flex-1 flex overflow-hidden border-t border-brand-gray-light lg:container lg:mx-auto lg:rounded-t-[40px] lg:shadow-md bg-white">
                <div className={`w-full lg:w-[400px] shrink-0 border-r border-brand-gray-light ${activeConversation ? 'hidden lg:block' : 'block'}`}>
                    <ConversationList
                        conversations={conversations}
                        activeConversation={activeConversation}
                        onSelect={(conv) => selectConversation(conv, true)}
                        currentUser={currentUser}
                    />
                </div>
                <div className={`flex-1 ${!activeConversation ? 'hidden lg:flex' : 'flex'}`}>
                    <ChatWindow
                        activeConversation={activeConversation}
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        onSendMessage={sendMessage}
                        wsConnected={wsConnected}
                        currentUser={currentUser}
                        onClose={handleCloseConversation}
                    />
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
