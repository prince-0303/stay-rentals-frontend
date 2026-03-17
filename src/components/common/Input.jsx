import React from 'react';

const Input = ({ label, type, name, value, onChange, placeholder, error, required = false, icon, className = "" }) => {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-semibold text-brand-gray-dark mb-1 ml-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-medium">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full ${icon ? 'pl-11' : 'px-4'} py-3 bg-brand-offwhite border border-brand-gray-light rounded-radius-card focus:outline-none focus:border-brand-blue-muted focus:ring-4 focus:ring-brand-blue-muted/10 transition-all duration-300 placeholder:text-brand-gray-medium/70 text-brand-gray-dark ${error
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-brand-gray-light'
                        } ${className}`}
                />
            </div>
            {error && <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">{error}</p>}
        </div>
    );
};

export default Input;
