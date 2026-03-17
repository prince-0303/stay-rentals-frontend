import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/common/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { changePassword } from '../../services/authService';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('The new passwords do not synchronize.');
            setIsLoading(false);
            return;
        }

        try {
            await changePassword(formData.oldPassword, formData.newPassword);
            setMessage('Account credentials updated successfully.');
            setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.detail || 'Current password is incorrect.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Credential Update"
            subtitle="Secure your account by updating your password."
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="CURRENT SECRET"
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                />

                <div className="pt-2 border-t border-brand-gray-light/30 space-y-6">
                    <Input
                        label="NEW SECRET"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <Input
                        label="CONFIRM SECRET"
                        type="password"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />
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
                    Sync Credentials
                </Button>
            </form>

            <div className="mt-8 text-center">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-[10px] font-black uppercase tracking-widest text-brand-gray-medium hover:text-brand-blue-primary transition-colors"
                >
                    Return to Login
                </button>
            </div>
        </AuthLayout>
    );
};

export default ChangePassword;
