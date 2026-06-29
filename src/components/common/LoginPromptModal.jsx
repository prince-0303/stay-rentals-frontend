import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';

const LoginPromptModal = ({ isOpen, onClose, message }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Render via portal directly into document.body so it's never
    // constrained by ancestor CSS transforms, overflow, or grid layouts.
    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-6"
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div
                className="relative bg-white rounded-3xl shadow-2xl border border-brand-gray-light"
                style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-brand-gray-medium hover:text-brand-blue-primary bg-brand-gray-light/30 hover:bg-brand-gray-light/60 transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Icon */}
                <div className="flex flex-col items-center text-center mb-7 mt-2">
                    <div className="w-16 h-16 rounded-full bg-brand-blue-primary/10 border border-brand-blue-primary/20 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-brand-blue-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-brand-gray-dark tracking-tight mb-2">Sign in to continue</h3>
                    <p className="text-brand-gray-medium text-sm leading-relaxed">
                        {message || 'Please sign in or create a free account to continue.'}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        variant="primary"
                        className="w-full py-3 text-sm font-bold shadow-lg active:scale-[0.98]"
                        onClick={() => navigate('/login', { state: { from: location.pathname } })}
                    >
                        Sign In
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full py-3 text-sm font-bold border-2 hover:bg-brand-gray-light/20 active:scale-[0.98]"
                        onClick={() => navigate('/register')}
                    >
                        Create a Free Account
                    </Button>
                </div>

                <p className="text-center text-xs text-brand-gray-medium mt-5">
                    It's free and only takes a minute.
                </p>
            </div>
        </div>,
        document.body
    );
};

export default LoginPromptModal;
