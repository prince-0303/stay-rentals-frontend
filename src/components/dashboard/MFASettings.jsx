import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';

const MFASettings = () => {
    const [status, setStatus] = useState({ mfa_enabled: false, methods: [] });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [setupStep, setSetupStep] = useState('initial');
    const [qrData, setQrData] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('totp');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [password, setPassword] = useState('');

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await api.get('/auth/mfa/status/');
            setStatus(response.data);
        } catch (error) {
            console.error('Failed to fetch MFA status', error);
        } finally {
            setLoading(false);
        }
    };

    const startSetup = async (method) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        const method_type = method === 'app' ? 'totp' : 'email';
        setSelectedMethod(method_type);

        try {
            const response = await api.post('/auth/mfa/setup/init/', { method_type });
            setQrData(response.data);
            setSetupStep('verify');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Setup failed' });
        } finally {
            setLoading(false);
        }
    };

    const verifyAndEnable = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/mfa/setup/verify/', {
                method_type: selectedMethod,
                code: verificationCode,
            });
            setBackupCodes(response.data.backup_codes || []);
            setSetupStep('backup');
            await fetchStatus();
            setMessage({ type: 'success', text: 'MFA Security Activated' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Invalid verification code.' });
        } finally {
            setLoading(false);
        }
    };

    const disableMFA = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/mfa/disable/', { password, method_type: 'all' });
            await fetchStatus();
            setMessage({ type: 'success', text: 'MFA Safeguard Removed' });
            setSetupStep('initial');
            setPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: 'Authorization failed.' });
        } finally {
            setLoading(false);
        }
    };

    const downloadBackupCodes = () => {
        const element = document.createElement('a');
        const file = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'ezstay_mfa_backup.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (loading && !status) return <div className="animate-pulse h-64 bg-brand-offwhite rounded-[40px]" />;

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-black mb-2">Account Security</h3>
                    <p className="text-brand-gray-medium font-bold text-sm">Secure your Ez-Stay identity with secondary factors and credentials.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <Button variant="outline" className="border-brand-gray-light font-black text-[10px] tracking-widest uppercase hover:text-brand-blue-primary transition-colors" onClick={() => window.location.href = '/change-password'}>
                        Change Password
                    </Button>
                    {status.mfa_enabled && <Badge variant="primary" className="bg-brand-blue-primary text-white font-black tracking-widest px-4 py-2">SECURED</Badge>}
                </div>
            </div>

            {message.text && (
                <div className={`p-6 rounded-[32px] border flex items-center gap-4 ${message.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                    <div className={`w-2 h-8 rounded-full ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`} />
                    <p className="font-black text-sm uppercase tracking-tight">{message.text}</p>
                </div>
            )}

            {!status.mfa_enabled ? (
                setupStep === 'initial' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => startSetup('app')}
                            className="bg-white border border-brand-gray-light p-4 sm:p-5 rounded-2xl cursor-pointer hover:border-brand-blue-primary hover:shadow-2xl transition-all group"
                        >
                            <div className="w-10 h-10 bg-brand-offwhite rounded-xl flex items-center justify-center text-brand-blue-primary mb-4 group-hover:bg-brand-blue-primary group-hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </div>
                            <h4 className="text-base font-black mb-2">Authenticator App</h4>
                            <p className="text-xs text-brand-gray-medium font-medium leading-relaxed">Use industry-standard apps like Google Authenticator or Authy for maximum protection.</p>
                        </div>
                    </div>
                ) : setupStep === 'verify' ? (
                    <div className="bg-white border border-brand-gray-light rounded-2xl p-4 sm:p-6 flex flex-col items-center">
                        <Badge variant="accent" className="bg-brand-accent text-brand-blue-primary font-black mb-6 tracking-widest text-[10px]">STEP 02: VERIFICATION</Badge>
                        {qrData?.qr_code && (
                            <div className="relative group mb-6">
                                <div className="absolute inset-0 bg-brand-blue-primary/10 blur-2xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                                <img src={qrData.qr_code} alt="QR" className="relative z-10 w-32 h-32 p-2 bg-white border-[6px] border-brand-offwhite rounded-2xl shadow-xl" />
                            </div>
                        )}
                        <form onSubmit={verifyAndEnable} className="w-full max-w-[280px] space-y-4">
                            <Input
                                label="ENTER 6-DIGIT CODE"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="· · · · · ·"
                                maxLength={6}
                                className="text-center text-lg font-black tracking-[0.4em] h-14"
                            />
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 py-2 text-sm" onClick={() => setSetupStep('initial')}>Cancel</Button>
                                <Button variant="primary" className="flex-1 py-2 text-sm" type="submit" isLoading={loading} disabled={verificationCode.length !== 6}>Activate</Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-brand-blue-primary rounded-2xl p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-24 -mt-24 pointer-events-none" />
                        <h4 className="text-lg font-black mb-3">Vault Access Codes</h4>
                        <p className="text-xs text-brand-blue-muted font-bold mb-6 max-w-[400px] italic">"Keep these codes in a secure, offline location. They are your only lifeline if you lose your primary device."</p>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {backupCodes.map((code, idx) => (
                                <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg font-black text-center tracking-widest text-sm hover:bg-white/20 transition-all select-all">
                                    {code}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="accent" onClick={downloadBackupCodes} className="shadow-xl py-2 text-sm">Secure Download</Button>
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 py-2 text-sm" onClick={() => { setSetupStep('initial'); fetchStatus(); }}>Done</Button>
                        </div>
                    </div>
                )
            ) : (
                <div className="space-y-6">
                    <div className="bg-brand-offwhite border border-brand-gray-light p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center w-full md:w-auto">
                            <div className="w-10 h-10 shrink-0 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                                <h4 className="text-base font-black text-brand-gray-dark">Safeguard Active</h4>
                                <p className="text-[10px] font-bold text-brand-gray-medium uppercase tracking-widest mt-0.5">Primary method: TOTP Application</p>
                            </div>
                        </div>
                        <Button variant="outline" className="border-brand-gray-light w-full md:w-auto py-2 text-sm" onClick={() => setBackupCodes([])}>Managed</Button>
                    </div>

                    <div className="pt-6 border-t border-brand-gray-light">
                        <h4 className="text-sm font-black text-red-600 mb-4 uppercase tracking-widest text-[10px]">Danger Zone</h4>
                        <form onSubmit={disableMFA} className="max-w-[400px] space-y-4">
                            <Input
                                label="DEACTIVATE SECURITY"
                                type="password"
                                placeholder="Enter system password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button variant="outline" className="border-red-100 text-red-600 hover:bg-red-50 px-8 py-2 text-sm" type="submit" isLoading={loading}>Disable MFA</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MFASettings;