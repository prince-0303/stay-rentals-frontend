import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/common/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { verifyEmail, resendOTP } from '../../services/authService';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await verifyEmail(email, otp);
            setMessage('Electronic signature verified. Accessing vault...');
            setTimeout(() => {
                navigate('/login', { state: { message: 'Verification successful. Please sign in.' } });
            }, 2000);
        } catch (err) {
            setError(err.detail || 'The code provided is invalid or has expired.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email || cooldown > 0) return;
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            await resendOTP(email);
            setMessage('A new verification code has been sent.');
            setCooldown(60);
        } catch (err) {
            setError('System error sending the code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Final Verification"
            subtitle="Enter the 6-digit code sent to your email."
        >
            <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <Input
                        label="EMAIL ADDRESS"
                        type="email"
                        value={email}
                        readOnly
                        className="opacity-60 bg-brand-offwhite cursor-not-allowed font-black"
                    />

                    <div className="relative">
                        <Input
                            label="AUTHORIZATION CODE"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="· · · · · ·"
                            maxLength={6}
                            required
                            className="text-center text-3xl font-black tracking-[0.5em] h-20 bg-brand-offwhite border-2 border-transparent focus:border-brand-blue-primary/30 transition-all"
                        />
                        <div className="absolute right-4 bottom-4">
                            {otp.length === 6 && (
                                <div className="w-2 h-2 rounded-full bg-brand-blue-primary animate-pulse" />
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-1.5 h-8 bg-red-500 rounded-full" />
                        <p className="text-xs font-black text-red-800 uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 border border-green-100 p-6 rounded-[32px] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-1.5 h-8 bg-green-500 rounded-full" />
                        <p className="text-xs font-black text-green-800 uppercase tracking-tight">{message}</p>
                    </div>
                )}

                <Button type="submit" isLoading={isLoading} fullWidth className="py-5 shadow-2xl shadow-brand-blue-primary/10">
                    Synchronize Access
                </Button>
            </form>

            <div className="mt-10 text-center">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading || cooldown > 0}
                    className="group flex items-center justify-center gap-2 mx-auto"
                >
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${cooldown > 0 ? 'text-brand-gray-light' : 'text-brand-gray-medium group-hover:text-brand-blue-primary'}`}>
                        {cooldown > 0 ? `Retry in ${cooldown}s` : 'Resend Code'}
                    </span>
                    {cooldown === 0 && (
                        <svg className="w-3.5 h-3.5 text-brand-gray-light group-hover:text-brand-blue-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    )}
                </button>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmail;
