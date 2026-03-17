import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/common/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { submitKYC } from '../../services/kycService';

const KYCSubmit = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({ aadharNumber: '' });
    const [kycFiles, setKycFiles] = useState({ aadharFront: null, aadharBack: null });
    const [previews, setPreviews] = useState({ aadharFront: null, aadharBack: null });

    const [error, setError] = useState('');
    const [message, setMessage] = useState(location.state?.message || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleAadharChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 12) {
            setFormData({ ...formData, aadharNumber: value });
            setError('');
        }
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError(`${fieldName === 'aadharFront' ? 'Front' : 'Back'} scan exceeds 10MB limit.`);
                return;
            }
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setError(`Unsupported file format. Please use JPG or PNG.`);
                return;
            }
            setKycFiles(prev => ({ ...prev, [fieldName]: file }));
            setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (formData.aadharNumber.length !== 12) throw new Error('Aadhar must be exactly 12 digits.');
            if (!kycFiles.aadharFront || !kycFiles.aadharBack) throw new Error('Both card views are mandatory.');

            const submissionData = new FormData();
            submissionData.append('aadhar_number', formData.aadharNumber);
            submissionData.append('aadhar_front', kycFiles.aadharFront);
            submissionData.append('aadhar_back', kycFiles.aadharBack);

            await submitKYC(submissionData);
            setMessage('Verification submitted. Redirecting to your dashboard...');

            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            setTimeout(() => {
                navigate('/login', { state: { message: 'Identity verification pending. Check your dashboard for updates.' } });
            }, 3000);

        } catch (err) {
            setError(err.detail || err.message || 'Error submitting. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Identity Validation"
            subtitle="To join the elite lister collective, we require a verified Aadhar identification."
        >
            <form className="space-y-10" onSubmit={handleSubmit}>
                <div className="bg-brand-blue-primary/10 border border-brand-blue-primary/20 p-8 rounded-[32px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="flex gap-6 items-start relative z-10">
                        <div className="w-1.5 h-16 bg-brand-blue-primary rounded-full shrink-0" />
                        <div>
                            <h4 className="text-sm font-black text-brand-blue-primary uppercase tracking-[0.2em] mb-2">Note</h4>
                            <p className="text-xs font-bold text-brand-gray-medium leading-relaxed">Identity verification of listers is mandatory for platform integrity. Our curators review submissions within 24-48 cycles.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <Input
                        label="AADHAR NUMBER"
                        type="text"
                        value={formData.aadharNumber}
                        onChange={handleAadharChange}
                        placeholder="XXXX XXXX XXXX"
                        maxLength="12"
                        required
                        className="text-xl font-black tracking-widest bg-brand-offwhite"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {['aadharFront', 'aadharBack'].map((field) => (
                            <div key={field} className="space-y-3">
                                <label className="text-[10px] font-black text-brand-gray-light uppercase tracking-widest pl-2">
                                    {field === 'aadharFront' ? 'Identity Front' : 'Identity Back'}
                                </label>
                                <div className="border-2 border-dashed border-brand-gray-light rounded-[32px] h-48 relative overflow-hidden group hover:border-brand-blue-primary transition-all cursor-pointer bg-brand-offwhite/50">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={(e) => handleFileChange(e, field)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        required
                                    />
                                    {previews[field] ? (
                                        <img src={previews[field]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-10" alt="Preview" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-gray-light shadow-sm group-hover:text-brand-blue-primary transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                            </div>
                                            <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-widest">{field === 'aadharFront' ? 'Scan Front' : 'Scan Back'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {(error || message) && (
                    <div className={`p-8 rounded-[32px] border flex gap-6 items-center animate-in fade-in slide-in-from-bottom-4 ${error ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                        <div className={`w-1.5 h-10 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
                        <p className="text-xs font-black uppercase tracking-tight leading-relaxed">{error || message}</p>
                    </div>
                )}

                <Button type="submit" isLoading={isLoading} fullWidth className="py-6 shadow-2xl shadow-brand-blue-primary/10 text-base">
                    Initialize Validation
                </Button>
            </form>
        </AuthLayout>
    );
};

export default KYCSubmit;
