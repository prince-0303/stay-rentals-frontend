import React from 'react';
import Badge from '../common/Badge';

const ConversationList = ({ conversations, activeConversation, onSelect, currentUser }) => {
    return (
        <div className="flex flex-col h-full bg-white border-r border-brand-gray-light">
            <div className="p-8 border-b border-brand-gray-light">
                <h2 className="text-3xl font-black tracking-tighter text-brand-gray-dark">Messages</h2>
                <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-[0.3em] mt-1">Recent Conversations</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
                {conversations.length === 0 ? (
                    <div className="p-10 text-center space-y-4">
                        <div className="w-12 h-12 bg-brand-offwhite rounded-2xl flex items-center justify-center mx-auto text-brand-gray-light">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-widest leading-loose italic">No messages found.</p>
                    </div>
                ) : (
                    conversations.map(conv => {
                        const isActive = activeConversation?.id === conv.id;
                        const otherName = currentUser?.role === 'lister' ? conv.user_name : conv.lister_name;
                        return (
                            <div key={conv.id} className="px-2">
                                <button
                                    onClick={() => onSelect(conv)}
                                    className={`w-full p-5 text-left rounded-[24px] transition-all duration-300 group flex items-start gap-4 border ${isActive
                                        ? 'bg-brand-blue-primary text-white border-transparent shadow-xl shadow-brand-blue-primary/20 scale-100 ring-4 ring-brand-blue-primary/10'
                                        : 'bg-white border-brand-gray-light shadow-sm hover:shadow-md hover:border-brand-blue-muted hover:bg-brand-offwhite'
                                        }`}
                                >
                                    <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border ${isActive ? 'bg-white/10 text-white border-white/20' : 'bg-brand-offwhite text-brand-blue-primary border-brand-gray-light'}`}>
                                        {otherName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-black tracking-tight truncate ${isActive ? 'text-white' : 'text-brand-gray-dark'}`}>
                                                {otherName}
                                            </span>
                                            {conv.unread_count > 0 && !isActive && (
                                                <Badge variant="primary" className="bg-brand-accent text-brand-blue-primary text-[8px] font-black min-w-[20px] h-[20px] flex items-center justify-center border-none rounded-full ml-2">
                                                    {conv.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-white/40' : 'bg-brand-blue-primary/40'}`} />
                                            <p className={`text-[9px] font-black uppercase tracking-widest truncate ${isActive ? 'text-white/70' : 'text-brand-gray-medium'}`}>
                                                {conv.property_title}
                                            </p>
                                        </div>
                                        {conv.last_message && (
                                            <p className={`text-xs font-bold truncate ${isActive ? 'text-white/90' : 'text-brand-gray-medium/80'}`}>
                                                {conv.last_message.content}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;
