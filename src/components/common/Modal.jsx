import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
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

    const sizes = {
        sm: "max-w-[448px]",
        md: "max-w-[576px]",
        lg: "max-w-3xl",
        xl: "max-w-5xl",
        full: "max-w-[95vw]"
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-brand-blue-primary/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full ${sizes[size]} bg-white rounded-premium shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-brand-gray-light">
                    <h3 className="text-xl font-bold text-brand-gray-dark">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-brand-gray-light text-brand-gray-medium hover:text-brand-gray-dark transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-8 py-4 border-t border-brand-gray-light bg-brand-offwhite flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
