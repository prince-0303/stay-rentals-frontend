import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/common/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { verifyMfaLogin, resendMfaCode } from '../../services/authService';

const MFAVerify = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [otp, setOtp] = useState('');
    const [useBackup, setUseBackup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [attemptsRemaining, setAttemptsRemaining] = useState(null);

    const mfa_session_token = location.state?.mfa_session_token;
    const mfa_method = location.state?.mfa_method;
    const message = location.state?.message;

    useEffect(() => {
        if (!mfa_session_token) {
            navigate('/login');
        }
    }, [mfa_session_token, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (e) => {
        let value = e.target.value;
        if (!useBackup) {
            value = value.replace(/\D/g, '').slice(0, 6);
        } else {
            // allow alphanumeric backup codes but limit length
            value = value.slice(0, 8);
        }
        setOtp(value);
        setError('');
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        try {
            await resendMfaCode(mfa_session_token);
            setResendCooldown(60);
        } catch (err) {
            setError(err.detail || 'Failed to resend code.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await verifyMfaLogin(mfa_session_token, otp);
            navigate('/dashboard');
        } catch (err) {
            if (err.attempts_remaining !== undefined) setAttemptsRemaining(err.attempts_remaining);
            setError(err.detail || 'Verification failed. Invalid code.');
        } finally {
            setIsLoading(false);
        }
    };

    const isEmailMethod = mfa_method === 'email';

    return (
        <AuthLayout
            title={useBackup ? 'Security Override' : 'Vault Security'}
            subtitle={
                useBackup
                    ? 'Enter one of your 8-character backup codes to gain access.'
                    : message || (isEmailMethod
                        ? 'We sent a secure code to your email. Check your inbox.'
                        : 'Open your authenticator app and enter the 6-digit code.')
            }
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label={useBackup ? 'Backup Code' : 'Security Code'}
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={handleChange}
                    placeholder={useBackup ? '••••••••' : '000000'}
                    maxLength={useBackup ? 8 : 6}
                    required
                    className="text-center text-2xl font-black tracking-[0.5em] py-4"
                />

                {error && (
                    <div className="p-4 rounded-radius-card bg-red-50 border border-red-100 flex flex-col items-center gap-1 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                            <p className="text-xs font-bold text-red-800">{error}</p>
                        </div>
                        {attemptsRemaining !== null && (
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                                {attemptsRemaining} attempts left
                            </p>
                        )}
                    </div>
                )}

                <Button
                    type="submit"
                    isLoading={isLoading}
                    fullWidth
                    disabled={otp.length < (useBackup ? 8 : 6)}
                    className="py-4 shadow-xl shadow-brand-blue-primary/10"
                >
                    Authenticate Account
                </Button>

                <div className="flex flex-col items-center gap-6 pt-4">
                    {!useBackup && isEmailMethod && (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className={`text-xs font-black uppercase tracking-widest transition-colors ${resendCooldown > 0
                                ? 'text-brand-gray-light'
                                : 'text-brand-blue-primary hover:text-brand-blue-dark'
                                }`}
                        >
                            {resendCooldown > 0
                                ? `Retry in ${resendCooldown}s`
                                : 'Resend Security Code'}
                        </button>
                    )}

                    <div className="flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setUseBackup(!useBackup);
                                setOtp('');
                                setError('');
                                setAttemptsRemaining(null);
                            }}
                            className="text-xs font-bold text-brand-gray-dark hover:text-brand-blue-primary underline underline-offset-4 decoration-brand-gray-light hover:decoration-brand-blue-primary transition-all"
                        >
                            {useBackup ? 'Back to standard verification' : 'Use a backup code instead'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest hover:text-brand-gray-dark transition-colors"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
};

export default MFAVerify;
