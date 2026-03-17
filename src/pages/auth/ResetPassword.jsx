import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/common/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { confirmPasswordReset } from '../../services/authService';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            await confirmPasswordReset(email, otp, newPassword);
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.detail || err.message || 'Password reset failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Secure Account"
            subtitle="Enter the code sent to your email and choose a new password."
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                />

                <Input
                    label="Verification Code"
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    required
                    className="text-center font-bold tracking-[0.5em]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="New Password"
                        type="password"
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                    <Input
                        label="Confirm"
                        type="password"
                        name="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="p-4 rounded-radius-card bg-red-50 border border-red-100 flex items-center gap-3 animate-in fade-in duration-200">
                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        <p className="text-xs font-bold text-red-800">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="p-4 rounded-radius-card bg-emerald-50 border border-emerald-100 flex items-center gap-3 animate-in fade-in duration-200">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <p className="text-xs font-bold text-emerald-800">{message}</p>
                    </div>
                )}

                <Button type="submit" isLoading={isLoading} fullWidth className="py-3.5 shadow-xl shadow-brand-blue-primary/10 mt-2">
                    Update Password
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ResetPassword;
