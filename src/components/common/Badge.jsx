import React from 'react';

const Badge = ({ children, variant = 'info', className = "" }) => {
    const variants = {
        success: "bg-emerald-100 text-emerald-700 border-emerald-200",
        danger: "bg-rose-100 text-rose-700 border-rose-200",
        warning: "bg-amber-100 text-amber-700 border-amber-200",
        info: "bg-sky-100 text-sky-700 border-sky-200",
        neutral: "bg-brand-gray-light text-brand-gray-dark border-brand-gray-medium/10",
        primary: "bg-brand-blue-muted/20 text-brand-blue-primary border-brand-blue-muted/30"
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
