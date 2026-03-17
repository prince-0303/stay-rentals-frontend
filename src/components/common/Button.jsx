import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    isLoading = false,
    fullWidth = false,
    icon,
    className = ""
}) => {
    const baseStyles = "flex items-center justify-center px-6 py-3 rounded-button font-semibold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";

    const variants = {
        primary: "bg-brand-blue-primary text-white hover:bg-brand-blue-dark shadow-sm hover:shadow-md",
        secondary: "bg-brand-gray-light text-brand-gray-dark hover:bg-brand-gray-medium/20",
        outline: "bg-transparent border-2 border-brand-gray-light text-brand-gray-dark hover:border-brand-blue-primary/30 hover:bg-brand-gray-light/50",
        google: "bg-white text-brand-gray-dark border border-brand-gray-light shadow-sm hover:shadow-md hover:bg-brand-gray-light/20",
        text: "bg-transparent text-brand-blue-primary hover:text-brand-blue-dark shadow-none px-2 py-1",
        accent: "bg-brand-accent text-brand-blue-primary hover:bg-brand-accent/90 shadow-sm hover:shadow-md"
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading}
            className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : icon ? (
                <span className="mr-2 text-lg">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};

export default Button;
