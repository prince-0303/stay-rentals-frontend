import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-[440px] text-center">
                {/* Logo - Matching 'Ez-Stay' style */}
                <Link to="/" className="inline-block mb-8 group">
                    <span className="text-4xl font-black text-brand-blue-primary tracking-tight transition-transform group-hover:scale-105">
                        Ez-Stay<span className="text-brand-accent ml-0.5">•</span>
                    </span>
                </Link>

                <h2 className="text-3xl font-black text-brand-gray-dark tracking-tight leading-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-3 text-sm font-semibold text-brand-gray-medium">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mt-10 w-full max-w-[480px]">
                <div className="bg-white py-10 px-8 sm:px-12 rounded-premium shadow-card border border-brand-gray-light/30">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
