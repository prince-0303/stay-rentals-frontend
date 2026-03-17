import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
    const formatTime = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6 group`}>
            <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                    <span className="text-[10px] font-black text-brand-gray-light uppercase tracking-widest mb-2 ml-2">
                        {message.sender_name}
                    </span>
                )}

                <div className={`relative px-6 py-4 rounded-[28px] text-sm font-bold leading-relaxed shadow-sm transition-all duration-300 ${isOwn
                        ? 'bg-brand-blue-primary text-white rounded-tr-sm shadow-brand-blue-primary/10 hover:shadow-brand-blue-primary/20'
                        : 'bg-white text-brand-gray-dark border border-brand-gray-light/30 rounded-tl-sm hover:shadow-xl hover:shadow-brand-gray-light/20'
                    }`}>
                    {message.content}
                </div>

                <span className={`text-[9px] font-black uppercase tracking-tighter mt-2 mx-2 opacity-0 group-hover:opacity-100 transition-opacity text-brand-gray-light`}>
                    {formatTime(message.created_at)}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
