import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import Badge from '../common/Badge';

const ChatWindow = ({
    activeConversation,
    messages,
    input,
    setInput,
    onSendMessage,
    wsConnected,
    currentUser,
    onClose
}) => {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    if (!activeConversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-brand-offwhite/50 p-12 text-center">
                <div className="w-24 h-24 bg-white rounded-[40px] shadow-sm flex items-center justify-center mb-10 text-brand-gray-light animate-pulse">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                </div>
                <h3 className="text-2xl font-black text-brand-gray-dark tracking-tighter mb-4">No Chat Selected</h3>
                <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-[0.3em] max-w-[240px] leading-loose">
                    Select a conversation to start messaging.
                </p>
            </div>
        );
    }

    const otherName = currentUser?.role === 'lister' ? activeConversation.user_name : activeConversation.lister_name;

    return (
        <div className="flex-1 flex flex-col bg-brand-offwhite/30">
            {/* Header */}
            <div className="px-10 py-6 border-b border-brand-gray-light bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-blue-primary/10 flex items-center justify-center font-black text-brand-blue-primary text-sm shadow-sm">
                        {otherName[0]}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-brand-gray-dark tracking-tight">{otherName}</h3>
                        <div className="flex items-center gap-2">
                            <Badge variant="accent" className="bg-brand-accent/20 text-brand-blue-primary border-none text-[8px] font-black py-0.5 px-1.5">{activeConversation.property_title}</Badge>
                            <div className={`w-1 h-1 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-400'}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${wsConnected ? 'text-green-600' : 'text-red-400'}`}>
                                {wsConnected ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-gray-light/50 text-brand-gray-medium hover:text-brand-gray-dark transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-widest leading-loose">No messages yet. Send a message to start the conversation.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <MessageBubble
                            key={msg.id || i}
                            message={msg}
                            isOwn={msg.sender_id === currentUser?.id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-10 bg-white/50 backdrop-blur-md rounded-t-[48px] border-t-2 border-brand-gray-light shadow-2xl shadow-brand-gray-dark/5">
                <div className="flex items-center gap-6 bg-white p-2 pl-8 rounded-[32px] border-2 border-brand-gray-light shadow-sm focus-within:border-brand-blue-muted focus-within:ring-4 focus-within:ring-brand-blue-primary/10 transition-all group hover:border-brand-blue-muted">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${otherName}...`}
                        disabled={!wsConnected}
                        className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-brand-gray-dark placeholder:text-brand-gray-medium disabled:opacity-50"
                    />
                    <button
                        onClick={onSendMessage}
                        disabled={!wsConnected || !input.trim()}
                        className="p-4 bg-brand-blue-primary text-white rounded-full shadow-xl shadow-brand-blue-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none flex items-center justify-center group-focus-within:bg-brand-blue-dark"
                        title="Send Message"
                    >
                        <svg className="w-5 h-5 rotate-90 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
