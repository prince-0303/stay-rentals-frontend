import React, { useEffect } from 'react';
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
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-brand-gray-dark/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-brand-gray-light">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-brand-gray-medium hover:text-brand-blue-primary transition-colors bg-brand-gray-light/30 hover:bg-brand-gray-light/60 rounded-full"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8 mt-2">
                    <div className="w-16 h-16 bg-brand-blue-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-blue-primary/20">
                        <svg className="w-8 h-8 text-brand-blue-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black text-brand-gray-dark tracking-tight mb-2">Authentication Required</h3>
                    <p className="text-brand-gray-medium text-[15px] leading-relaxed">
                        {message || "Please sign in or create an account to continue."}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button 
                        variant="primary" 
                        className="w-full py-3.5 text-base shadow-xl active:scale-[0.98]"
                        onClick={() => navigate('/login', { state: { from: location.pathname } })}
                    >
                        Sign In
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full py-3.5 text-base border-2 hover:bg-brand-gray-light/20 active:scale-[0.98]"
                        onClick={() => navigate('/register')}
                    >
                        Create an Account
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LoginPromptModal;
