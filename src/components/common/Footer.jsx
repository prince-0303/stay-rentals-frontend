import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import Input from './Input';
import { logout } from '../../services/authService';

const Footer = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('user'));
    const [isLister, setIsLister] = useState(false);

    useEffect(() => {
        const checkUser = () => {
            const userStr = localStorage.getItem('user');
            setIsLoggedIn(!!userStr);
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setIsLister(user.role === 'lister' || user.role === 'admin');
                } catch (e) {
                    setIsLister(false);
                }
            } else {
                setIsLister(false);
            }
        };

        checkUser();
        window.addEventListener('auth-change', checkUser);
        window.addEventListener('storage', checkUser);
        return () => {
            window.removeEventListener('auth-change', checkUser);
            window.removeEventListener('storage', checkUser);
        };
    }, []);

    return (
        <footer className="bg-brand-blue-primary pt-24 pb-12 text-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className={`grid grid-cols-1 md:grid-cols-2 ${isLister ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-12 lg:gap-24 mb-16`}>
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="text-3xl font-black tracking-tight">
                            Ez-Stay<span className="text-brand-accent">•</span>
                        </Link>
                        <p className="text-brand-gray-medium text-sm leading-relaxed max-w-[384px]">
                            Discover your perfect property today with the most advanced rental platform. Premium properties across 12+ regions.
                        </p>
                        <div className="flex gap-4">
                            {[
                                {
                                    name: 'Instagram',
                                    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                },
                                {
                                    name: 'Google',
                                    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                                },
                                {
                                    name: 'Facebook',
                                    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                },
                                {
                                    name: 'X (Twitter)',
                                    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                                }
                            ].map((social) => (
                                <a key={social.name} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-accent hover:text-brand-blue-primary transition-all duration-300">
                                    <span className="sr-only">{social.name}</span>
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    {!isLister && (
                        <div>
                            <h4 className="text-lg font-bold mb-6">Explore</h4>
                            <ul className="space-y-4 text-brand-gray-medium text-sm font-medium">
                                <li><Link to="/" className="hover:text-brand-accent transition-colors">Home</Link></li>
                                <li><Link to="/listings" className="hover:text-brand-accent transition-colors">Browse Listings</Link></li>
                                <li><Link to="/recommendations" className="hover:text-brand-accent transition-colors">AI Recommendations</Link></li>
                                <li><Link to="/compare" className="hover:text-brand-accent transition-colors">Compare Properties</Link></li>
                            </ul>
                        </div>
                    )}

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Account</h4>
                        <ul className="space-y-4 text-brand-gray-medium text-sm font-medium">
                            <li><Link to={isLister ? "/lister" : "/profile"} className="hover:text-brand-accent transition-colors">Dashboard</Link></li>
                            {!isLister && <li><Link to="/wishlist" className="hover:text-brand-accent transition-colors">My Wishlist</Link></li>}
                            <li><Link to="/kyc-submit" className="hover:text-brand-accent transition-colors">Verification (KYC)</Link></li>
                            <li>
                                {isLoggedIn ? (
                                    <button onClick={logout} className="hover:text-brand-accent transition-colors text-brand-gray-medium text-sm font-medium">
                                        Sign Out
                                    </button>
                                ) : (
                                    <Link to="/login" className="hover:text-brand-accent transition-colors">Sign In / Register</Link>
                                )}
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold">Stay Updated</h4>
                        <p className="text-brand-gray-medium text-sm">Get the latest property listings and market trends delivered to your inbox.</p>
                        <div className="flex flex-col gap-3">
                            <Input
                                placeholder="Your email address"
                                className="mb-0"
                                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            />
                            <Button variant="accent" fullWidth className="py-2.5">
                                Subscribe Now
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-brand-gray-medium text-xs font-medium italic">
                        &copy; {new Date().getFullYear()} Ez-Stay Rentals. Designed for Excellence.
                    </p>
                    <div className="flex gap-8 text-xs font-semibold uppercase tracking-widest text-brand-gray-medium">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
