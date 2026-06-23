import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getProfile, logout } from '../../services/authService';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';
import { chatService } from '../../services/chatService';
import { propertyService } from '../../services/propertyService';
import Button from './Button';
import api from '../../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [compareCount, setCompareCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const location = useLocation();

    useEffect(() => {
        if (!user) return;
        const fetchInitialCounts = async () => {
            try {
                const conversations = await chatService.getConversations();
                const unread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
                setTotalUnread(unread);
            } catch (e) {
                console.error("Failed to fetch unread chats", e);
            }
        };
        fetchInitialCounts();

        const handleUnreadUpdate = () => fetchInitialCounts();
        window.addEventListener('unread_updated', handleUnreadUpdate);
        return () => window.removeEventListener('unread_updated', handleUnreadUpdate);
    }, [user, location.pathname]);

    useEffect(() => {
        const updateWishlistCount = async () => {
            if (!user) return;
            try {
                const data = await propertyService.getSavedProperties();
                const list = Array.isArray(data) ? data : data.results || [];
                setWishlistCount(list.length);
            } catch (e) {
                console.error("Failed to fetch wishlist count", e);
            }
        };
        updateWishlistCount();
        window.addEventListener('wishlist_updated', updateWishlistCount);
        return () => window.removeEventListener('wishlist_updated', updateWishlistCount);
    }, [user]);

    useEffect(() => {
        const updateCompareCount = () => {
            const list = JSON.parse(localStorage.getItem('compare_list') || '[]');
            setCompareCount(list.length);
        };
        updateCompareCount();
        window.addEventListener('storage', updateCompareCount);
        window.addEventListener('compare_updated', updateCompareCount);
        return () => {
            window.removeEventListener('storage', updateCompareCount);
            window.removeEventListener('compare_updated', updateCompareCount);
        };
    }, []);

    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications/');
                setNotifications(res.data.notifications || []);
                setUnreadNotifCount(res.data.unread_count || 0);
            } catch (e) {}
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        window.addEventListener('notification_updated', fetchNotifications);
        return () => {
            clearInterval(interval);
            window.removeEventListener('notification_updated', fetchNotifications);
        };
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = async () => {
        try {
            await api.post('/notifications/mark-read/');
            setUnreadNotifCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (e) {}
    };

    const dismissNotification = async (id) => {
        try {
            await api.post('/notifications/mark-read/', { id });
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadNotifCount(prev => Math.max(0, prev - 1));
        } catch (e) {}
    };

    useEffect(() => {
        if (notifOpen && unreadNotifCount > 0) {
            markAllRead();
        }
    }, [notifOpen]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const isValidToken = token && token !== 'null' && token !== 'undefined';
        if (!isValidToken) return;
        const fetchUser = async () => {
            try {
                const profile = await getProfile();
                setUser(profile);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isLister = user?.role === 'lister' || user?.role === 'admin';

    useEffect(() => {
        if (location.pathname === '/chat') {
            setTotalUnread(0);
        }
    }, [location.pathname]);

    useNotificationSocket((conversation_id, unread_count) => {
        // Real-time badge ballooning prevented.
        // We rely on the globally dispatched 'unread_updated' event which triggers fetchInitialCounts.
    });

    const navLinks = isLister ? [
        { name: 'Dashboard', path: '/lister/dashboard' },
        { name: 'My Listings', path: '/my-listings' },
        { name: 'Messages', path: '/chat', badge: totalUnread },
    ] : [
        { name: 'Home', path: '/' },
        { name: 'Browse', path: '/listings' },
        { name: 'Recommendations', path: '/recommendations' },
        {
            name: 'Wishlist', path: '/wishlist', badge: wishlistCount, icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            )
        },
        { name: 'Messages', path: '/chat', badge: totalUnread },
    ];

    if (compareCount > 0) {
        navLinks.push({ name: 'Compare', path: '/compare', badge: compareCount });
    }

    return (
        <nav className="fixed top-0 left-0 w-full z-[200] bg-white/80 backdrop-blur-xl border-b border-brand-gray-light/50 shadow-glass transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between h-24">
                    {/* Logo - Matching 'Ez-Stay' style */}
                    <Link to="/" className="flex items-center group">
                        <span className="text-3xl font-black text-brand-blue-primary tracking-tight transition-transform group-hover:scale-105">
                            Ez-Stay<span className="text-brand-accent ml-0.5">•</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-[15px] font-semibold transition-all duration-300 flex items-center gap-2 group relative
                                    ${location.pathname === link.path ? 'text-brand-blue-primary' : 'text-brand-gray-medium hover:text-brand-blue-primary'}`}
                            >
                                {link.icon && <span className="transition-transform group-hover:scale-110">{link.icon}</span>}
                                {link.name}
                                {link.badge > 0 && (
                                    <span className="bg-brand-blue-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                                        {link.badge}
                                    </span>
                                )}
                                {location.pathname === link.path && (
                                    <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-brand-blue-primary rounded-full" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Action Area */}
                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-6">
                                {isLister && (
                                    <Button
                                        variant="primary"
                                        className="hidden sm:flex text-sm py-2.5 px-6"
                                        onClick={() => navigate('/my-listings/create')}
                                    >
                                        List Property
                                    </Button>
                                )}

                                {/* Notification Bell */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={() => setNotifOpen(!notifOpen)}
                                        className="relative p-2 text-brand-gray-medium hover:text-brand-blue-primary transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {unreadNotifCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                                                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                                            </span>
                                        )}
                                    </button>
                                    {notifOpen && (
                                        <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-brand-gray-light z-[300] overflow-hidden">
                                            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-light bg-brand-offwhite">
                                                <p className="text-sm font-black text-brand-gray-dark">Notifications</p>
                                                {notifications.some(n => !n.is_read) && (
                                                    <button onClick={markAllRead} className="text-xs text-brand-blue-primary font-bold hover:underline">Mark all read</button>
                                                )}
                                            </div>
                                            <div className="max-h-80 overflow-y-auto divide-y divide-brand-gray-light/50">
                                                {notifications.length === 0 ? (
                                                    <div className="px-5 py-8 text-center text-sm text-brand-gray-medium font-medium">No notifications yet</div>
                                                ) : notifications.map(n => (
                                                    <div key={n.id} className={`px-5 py-3.5 transition-colors flex items-start gap-3 ${!n.is_read ? 'bg-blue-50' : 'hover:bg-brand-gray-light/30'}`}>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-brand-gray-dark">{n.title}</p>
                                                            <p className="text-xs text-brand-gray-medium mt-0.5 leading-relaxed">{n.body}</p>
                                                            <p className="text-[10px] text-brand-gray-light mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                                        </div>
                                                        <button onClick={() => dismissNotification(n.id)} className="text-gray-400 hover:text-red-500 transition-colors mt-0.5 flex-shrink-0 opacity-100">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center focus:outline-none group"
                                    >
                                        <div className="w-12 h-12 rounded-full border-2 border-brand-gray-light p-1 transition-all group-hover:border-brand-blue-muted">
                                            <div className="w-full h-full rounded-full bg-brand-blue-primary flex items-center justify-center text-white shadow-md">
                                                <span className="font-bold text-lg leading-none">
                                                    {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-4 w-60 bg-white rounded-radius-card shadow-2xl border border-brand-gray-light animate-in slide-in-from-top-2 duration-200 z-[300]">
                                            <div className="p-5 border-b border-brand-gray-light bg-brand-offwhite">
                                                <p className="text-sm font-black text-brand-gray-dark">{user.first_name || 'Ez-Stay User'}</p>
                                                <p className="text-xs font-medium text-brand-gray-medium truncate mt-0.5">{user.email}</p>
                                                {isLister && (
                                                    <span className="mt-2 inline-flex items-center px-2 py-0.5 bg-brand-accent/20 text-brand-blue-primary text-[10px] font-black rounded-full uppercase tracking-wider border border-brand-accent/30">
                                                        Lister Pro
                                                    </span>
                                                )}
                                            </div>

                                            <div className="py-2">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-brand-gray-dark hover:bg-brand-gray-light transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    Profile
                                                </Link>
                                                {isLister && (
                                                    <Link
                                                        to="/my-listings"
                                                        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-brand-gray-dark hover:bg-brand-gray-light transition-colors"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                        My Listings
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/login"
                                    className="hidden sm:block text-[15px] font-bold text-brand-gray-dark hover:text-brand-blue-primary transition-colors"
                                >
                                    Login
                                </Link>
                                <Button
                                    className="px-8 py-3 bg-brand-blue-primary text-white font-black hover:bg-brand-blue-dark shadow-xl active:scale-95"
                                    onClick={() => navigate('/register')}
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button className="lg:hidden p-2 text-brand-blue-primary">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
