import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../services/authService';
import { chatService } from '../../services/chatService';

const Sidebar = ({ role, activeTab, onTabChange }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [totalUnread, setTotalUnread] = useState(0);

    useEffect(() => {
        const fetchInitialCounts = async () => {
            try {
                const conversations = await chatService.getConversations();
                const unread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
                setTotalUnread(unread);
            } catch (e) { }
        };
        fetchInitialCounts();

        const handleUnreadUpdate = () => fetchInitialCounts();
        window.addEventListener('unread_updated', handleUnreadUpdate);
        return () => window.removeEventListener('unread_updated', handleUnreadUpdate);
    }, [location.pathname]);

    useEffect(() => {
        if (location.pathname === '/chat') {
            setTotalUnread(0);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const commonItems = [
        { id: 'overview', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ];

    const userItems = [
        { id: 'wishlist', label: 'Wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
        { id: 'recently-viewed', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'visits', label: 'Visits', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'payments', label: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { id: 'preferences', label: 'Preferences', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
        { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'account', label: 'Actions', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', danger: true },
        { id: 'chat', label: 'Messages', external: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', badge: totalUnread },
    ];

    const listerItems = [
        { id: 'alerts', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        { section: 'Personal' },
        { id: 'overview', label: 'Lister Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'account', label: 'Actions', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', danger: true },
    ];

    const displayItems = role === 'lister' ? listerItems : [...commonItems, ...userItems];

    return (
        <aside className="hidden lg:block bg-white rounded-[32px] border-2 border-brand-gray-light shadow-sm p-4 h-fit sticky top-32 lg:col-span-3">
            <div className="space-y-1">
                {displayItems.map((item, index) => {
                    if (item.section) {
                        return (
                            <div key={index} className="pt-6 pb-2 px-6">
                                <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-widest">{item.section}</p>
                            </div>
                        );
                    }
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => item.external ? navigate(item.external) : onTabChange(item.id)}
                            className={`w-full group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden
                                ${isActive
                                    ? 'bg-brand-blue-primary text-white shadow-xl shadow-brand-blue-primary/20'
                                    : item.danger
                                        ? 'text-red-500 hover:bg-red-50'
                                        : 'text-brand-gray-medium hover:bg-brand-offwhite'}`}
                        >
                            {isActive && (
                                <div className="absolute inset-y-0 left-0 w-1 bg-brand-accent h-full" />
                            )}
                            <svg
                                className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : item.danger ? 'text-red-400' : 'text-brand-gray-light group-hover:text-brand-blue-primary'}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            <span className={`text-[13px] font-black uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>

                            {item.badge > 0 && (
                                <span className={`ml-auto flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-brand-blue-primary' : 'bg-brand-blue-primary text-white'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 pt-8 border-t border-brand-gray-light px-2">
                <button
                    onClick={handleLogout}
                    className="w-full group flex items-center gap-4 px-6 py-4 rounded-2xl text-brand-gray-medium font-black uppercase tracking-tight text-[13px] hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                >
                    <svg className="w-4 h-4 shrink-0 text-brand-gray-light group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
