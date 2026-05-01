import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import AuthLayout from '../../components/common/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { login, googleAuth } from '../../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (!formData.email || !formData.password) {
                throw { detail: 'Please fill in all fields' };
            }

            const response = await login(formData.email, formData.password);

            if (response.requires_mfa) {
                navigate('/mfa-verify', {
                    state: {
                        mfa_session_token: response.mfa_session_token,
                        mfa_method: response.mfa_method,
                        message: response.message,
                    }
                });
                return;
            }

            navigate('/');

        } catch (err) {
            if (err.requires_kyc) {
                let message = 'Verification needed to continue.';
                if (err.kyc_status === 'pending') message = 'Verification is pending review.';
                else if (err.kyc_status === 'rejected') message = 'Verification rejected. Please resubmit.';

                setError(message);
                setTimeout(() => navigate('/kyc-submit', { state: { message } }), 2000);
                return;
            }

            let errorMessage = err.detail || err.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        ux_mode: 'popup',
        use_fedcm_for_prompt: true,
        onSuccess: async (codeResponse) => {
            try {
                setIsLoading(true);
                setError('');
                await googleAuth(codeResponse.code);
                await new Promise(resolve => setTimeout(resolve, 150));
                navigate('/');
            } catch (err) {
                console.error('Google Auth Error:', err);
                setError('Google authentication failed');
            } finally {
                setIsLoading(false);
            }
        },
        onError: (error) => {
            console.error('Google Login Error:', error);
            setError('Google login was interrupted');
        },
    });

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle={
                <>
                    New to Ez-Stay? <Link to="/register" className="text-brand-blue-primary hover:text-brand-blue-dark transition-colors underline-offset-4 hover:underline">Create an account</Link>
                </>
            }
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                />

                <div>
                    <label className="block text-sm font-semibold text-brand-gray-dark mb-1 ml-1">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-medium pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full pl-11 pr-12 py-3 bg-brand-offwhite border border-brand-gray-light rounded-radius-card focus:outline-none focus:border-brand-blue-muted focus:ring-4 focus:ring-brand-blue-muted/10 transition-all duration-300 placeholder:text-brand-gray-medium/70 text-brand-gray-dark"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-medium hover:text-brand-blue-primary transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>
                    </div>
                    <div className="flex justify-end mt-1.5">
                        <Link to="/forgot-password" className="text-xs font-bold text-brand-gray-medium hover:text-brand-blue-primary transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-radius-card bg-red-50 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs font-bold text-red-800">{error}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    isLoading={isLoading}
                    fullWidth
                    className="mt-4 py-3.5 shadow-xl shadow-brand-blue-primary/10"
                >
                    Sign In
                </Button>
            </form>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-brand-gray-light" />
                    </div>
                    <div className="relative flex justify-center text-xs font-black uppercase tracking-widest text-brand-gray-medium">
                        <span className="px-4 bg-white">OR CONTINUE WITH</span>
                    </div>
                </div>

                <div className="mt-8">
                    <Button
                        variant="google"
                        fullWidth
                        onClick={() => handleGoogleLogin()}
                        disabled={isLoading}
                        icon={
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        }
                    >
                        Sign in with Google
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Login;
