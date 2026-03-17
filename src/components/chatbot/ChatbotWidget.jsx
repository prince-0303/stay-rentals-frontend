import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

const TypingIndicator = () => (
    <div className="flex items-end gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-brand-blue-primary/10 flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 bg-brand-blue-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-brand-blue-primary rounded-full animate-bounce ml-1.5" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-brand-blue-primary rounded-full animate-bounce ml-1.5" style={{ animationDelay: '300ms' }} />
        </div>
    </div>
);

const ChatbotWidget = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: "Welcome to Ez-Stay. I am your AI concierge. How can I help you find a home today?",
            id: 0,
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('user'));
    const [userRole, setUserRole] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user'))?.role;
        } catch { return null; }
    });

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const nextId = useRef(1);

    useEffect(() => {
        const syncAuth = () => {
            setIsLoggedIn(!!localStorage.getItem('user'));
            try {
                setUserRole(JSON.parse(localStorage.getItem('user'))?.role);
            } catch { setUserRole(null); }
        };
        window.addEventListener('storage', syncAuth);
        window.addEventListener('auth-change', syncAuth);
        return () => {
            window.removeEventListener('storage', syncAuth);
            window.removeEventListener('auth-change', syncAuth);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setHasUnread(false);
        }
    }, [isOpen]);

    if (!isLoggedIn || location.pathname === '/chat' || userRole === 'lister') return null;

    const sendMessage = async (question) => {
        const text = (question ?? input).trim();
        if (!text || isLoading) return;

        setMessages(prev => [...prev, { role: 'user', text, id: nextId.current++ }]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await api.post('/chatbot/ask/', { question: text });
            const data = res.data;
            setMessages(prev => [...prev, {
                role: 'bot',
                text: data.answer || "Sorry, I encountered an error. Please try asking again.",
                id: nextId.current++,
                showRecommendations: data.is_property_query && data.redirect !== null,
                redirectUrl: data.redirect
            }]);
            if (!isOpen) setHasUnread(true);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't connect. Please check your internet and try again.", id: nextId.current++ }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
            <div className={`transition-all duration-500 origin-bottom-right transform pointer-events-auto ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <div className="w-[340px] h-[500px] bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/40 flex flex-col overflow-hidden mb-4">
                    {/* Header */}
                    <div className="bg-brand-blue-primary px-6 py-5 flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-[16px] backdrop-blur-md flex items-center justify-center border border-white/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white tracking-tight">AI Concierge</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/70">Active</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white relative z-10">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 custom-scrollbar bg-brand-offwhite/30">
                        {messages.map(msg => (
                            <div key={msg.id} className={`animate-in fade-in slide-in-from-bottom-2 duration-300 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-brand-blue-primary text-white rounded-tr-sm' : 'bg-white text-brand-gray-dark rounded-tl-sm border border-brand-gray-light/30'}`}>
                                    {msg.text}
                                    {msg.showRecommendations && (
                                        <Link to={msg.redirectUrl} onClick={() => setIsOpen(false)} className="mt-6 block text-[10px] font-black uppercase tracking-widest bg-brand-blue-primary text-white py-4 px-6 rounded-2xl text-center hover:scale-105 transition-transform shadow-xl shadow-brand-blue-primary/10">
                                            View Recommendations
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 bg-white border-t border-brand-gray-light">
                        <div className="flex items-center gap-2 bg-brand-offwhite rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-blue-primary/10 transition-all">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask something..."
                                className="flex-1 bg-transparent border-none outline-none font-medium text-xs text-brand-gray-dark placeholder:text-brand-gray-light/70"
                            />
                            <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} className="w-8 h-8 bg-brand-blue-primary text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-40">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bubble */}
            <button onClick={() => setIsOpen(!isOpen)} className="pointer-events-auto w-14 h-14 rounded-[20px] bg-brand-blue-primary shadow-[0_10px_30px_rgba(37,99,235,0.35)] hover:scale-110 active:scale-90 transition-all flex items-center justify-center relative group">
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isOpen ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'}`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                {hasUnread && !isOpen && <span className="absolute -top-1 -right-1 w-6 h-6 bg-brand-accent rounded-full border-4 border-brand-offwhite animate-pulse" />}
            </button>
        </div>
    );
};

export default ChatbotWidget;
