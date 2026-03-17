import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import AuthLayout from '../../components/common/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { register, googleAuth, verifyEmail, resendOTP } from '../../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = Register, 2 = Verify OTP

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRoleChange = (role) => {
        setFormData({ ...formData, role });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            if (formData.password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }

            const [first_name, ...lastParts] = formData.name.trim().split(' ');
            const last_name = lastParts.join(' ') || '';

            if (!first_name) {
                throw new Error('Please enter your full name');
            }

            const registrationData = {
                email: formData.email,
                password: formData.password,
                password_confirm: formData.confirmPassword,
                first_name: first_name,
                last_name: last_name,
                role: formData.role
            };

            const response = await register(registrationData);
            setMessage(response.detail || 'Registration successful! Verification code sent.');
            setStep(2);

        } catch (err) {
            setError(err.detail || err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await verifyEmail(formData.email, otp);
            const userObj = response.user || {
                email: response.email || formData.email,
                role: response.role || formData.role,
                first_name: formData.name.split(' ')[0] || '',
                last_name: formData.name.split(' ').slice(1).join(' ') || '',
                kyc_status: response.kyc_status || null,
            };
            localStorage.setItem('user', JSON.stringify(userObj));

            if (response.access) localStorage.setItem('access_token', response.access);
            if (response.refresh) localStorage.setItem('refresh_token', response.refresh);

            if (response.requires_kyc) {
                setMessage('Verified! Redirecting to KYC…');
                setTimeout(() => navigate('/kyc-submit', { state: { message: 'Please submit your KYC documents' } }), 1200);
            } else {
                setMessage('Verified! Redirecting to login…');
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (err) {
            setError(err.detail || err.message || 'Invalid code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError('');
        try {
            await resendOTP(formData.email);
            setMessage('New code sent!');
        } catch (err) {
            setError('Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        ux_mode: 'popup',
        redirect_uri: 'postmessage',
        onSuccess: async (codeResponse) => {
            try {
                setIsLoading(true);
                setError('');
                await googleAuth(codeResponse.code);
                navigate('/');
            } catch (err) {
                setError('Google authentication failed');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError('Google authentication failed'),
    });

    return (
        <AuthLayout
            title={step === 1 ? "Create Ez-Stay Account" : "Verify Your Email"}
            subtitle={
                step === 1 ? (
                    <>Already a member? <Link to="/login" className="text-brand-blue-primary font-bold hover:underline underline-offset-4">Sign In</Link></>
                ) : (
                    <>We sent a 6-digit code to <span className="text-brand-gray-dark font-black">{formData.email}</span></>
                )
            }
        >
            {step === 1 && (
                <form className="space-y-4" onSubmit={handleRegister}>
                    {/* Role Switcher */}
                    <div className="flex bg-brand-offwhite p-1.5 rounded-radius-card border border-brand-gray-light/50 mb-6">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('user')}
                            className={`flex-1 py-2.5 text-xs font-black rounded-button transition-all duration-300 ${formData.role === 'user'
                                ? 'bg-brand-blue-primary text-white shadow-lg'
                                : 'text-brand-gray-medium hover:text-brand-gray-dark'
                                }`}
                        >
                            RENT PROPERTIES
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleChange('lister')}
                            className={`flex-1 py-2.5 text-xs font-black rounded-button transition-all duration-300 ${formData.role === 'lister'
                                ? 'bg-brand-blue-primary text-white shadow-lg'
                                : 'text-brand-gray-medium hover:text-brand-gray-dark'
                                }`}
                        >
                            LIST PROPERTIES
                        </button>
                    </div>

                    {formData.role === 'lister' && (
                        <div className="bg-brand-accent/5 border border-brand-accent/20 p-4 rounded-radius-card animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex gap-3">
                                <svg className="h-4 w-4 text-brand-accent shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs font-semibold text-brand-blue-dark leading-relaxed">
                                    Professional listers require KYC verification after registration.
                                </p>
                            </div>
                        </div>
                    )}

                    <Input
                        label="Full Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="name@company.com"
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                        <Input
                            label="Confirm"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                        Create Account
                    </Button>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-gray-light" /></div>
                            <div className="relative flex justify-center text-xs font-black uppercase tracking-widest text-brand-gray-medium"><span className="px-4 bg-white">OR REGISTER WITH</span></div>
                        </div>

                        <div className="mt-8">
                            <Button
                                variant="google"
                                fullWidth
                                onClick={() => handleGoogleLogin()}
                                disabled={isLoading}
                                icon={
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                }
                            >
                                Continue with Google
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form className="space-y-6" onSubmit={handleVerify}>
                    <Input
                        label="6-Digit Verification Code"
                        type="text"
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        required
                        maxLength={6}
                        className="text-center tracking-[1em] text-2xl font-black"
                    />

                    {error && <div className="p-4 rounded-radius-card bg-red-50 border border-red-100 text-xs font-bold text-red-800 text-center">{error}</div>}
                    {message && <div className="p-4 rounded-radius-card bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-800 text-center">{message}</div>}

                    <Button type="submit" isLoading={isLoading} fullWidth className="py-3.5 shadow-xl shadow-brand-blue-primary/10">
                        Verify & Access Account
                    </Button>

                    <div className="flex flex-col items-center gap-4">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isLoading}
                            className="text-sm font-black text-brand-blue-primary hover:text-brand-blue-dark disabled:opacity-50 transition-colors"
                        >
                            RESEND CODE
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
                            className="text-xs font-semibold text-brand-gray-medium hover:text-brand-gray-dark transition-colors"
                        >
                            ← Use different email
                        </button>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
};

export default Register;
