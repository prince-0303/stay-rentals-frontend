import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleAuth } from '../../services/authService';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            handleGoogleCallback(code);
        } else {
            setError('Electronic handshake failed. No authorization code detected.');
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [searchParams, navigate]);

    const handleGoogleCallback = async (code) => {
        try {
            await googleAuth(code);
            navigate('/dashboard');
        } catch (err) {
            setError('Login failed. Error during Google authentication.');
            setTimeout(() => navigate('/login'), 3000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-offwhite p-6 relative overflow-hidden">
            {/* Background blur elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-blue-primary/10 rounded-full blur-[120px] -ml-48 -mt-48" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] -mr-48 -mb-48" />

            <div className="bg-white/80 backdrop-blur-2xl border border-white p-12 rounded-[48px] shadow-2xl max-w-[384px] w-full text-center relative z-10">
                {error ? (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto border border-red-100">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter text-brand-gray-dark">Access Denied</h2>
                        <p className="text-sm font-bold text-red-800 uppercase tracking-tight leading-relaxed">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="w-20 h-20 bg-brand-offwhite rounded-[32px] flex items-center justify-center mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-brand-blue-primary/10 animate-pulse" />
                            <div className="w-10 h-10 border-4 border-brand-blue-primary border-t-transparent rounded-full animate-spin relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter text-brand-gray-dark mb-2">Authenticating</h2>
                            <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-[0.3em]">Logging you in securely...</p>
                        </div>
                        <p className="text-xs font-bold text-brand-gray-medium leading-relaxed">Please wait while we synchronize your Ez-Stay account with Google’s servers.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
