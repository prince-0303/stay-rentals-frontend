import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/common/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { resetPassword } from '../../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await resetPassword(email);
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to send reset link. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle={
                <>Remembered your account? <Link to="/login" className="text-brand-blue-primary font-bold hover:underline underline-offset-4">Sign In</Link></>
            }
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                />

                {status.message && (
                    <div className={`p-4 rounded-radius-card flex items-center gap-3 animate-in fade-in duration-200 ${status.type === 'error' ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                        <svg className={`w-5 h-5 shrink-0 ${status.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`} fill="currentColor" viewBox="0 0 20 20">
                            {status.type === 'error' ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            )}
                        </svg>
                        <p className={`text-xs font-bold ${status.type === 'error' ? 'text-red-800' : 'text-emerald-800'}`}>{status.message}</p>
                    </div>
                )}

                <Button type="submit" isLoading={isLoading} fullWidth className="py-3.5 shadow-xl shadow-brand-blue-primary/10">
                    Send Reset Link
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ForgotPassword;
