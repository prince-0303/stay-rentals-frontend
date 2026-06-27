import api from './api';

const setAuthUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new Event('auth-change'));
};

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login/', { email, password });
        let userData = response.data.user || response.data.data?.user;

        if (userData) {
            if (userData.role === 'admin') {
                try { await api.post('/auth/logout/'); } catch { }
                localStorage.removeItem('user');
                throw { detail: 'Admins must use the dedicated Admin portal to log in.' };
            }
            setAuthUser(userData);
        }

        return response.data;

    } catch (error) {
        if (error.response) {
            if (error.response.data?.user) {
                setAuthUser(error.response.data.user);
            }
            throw error.response.data;
        } else if (error.request) {
            throw { detail: 'Cannot connect to server. Please check if backend is running.' };
        } else {
            throw { detail: error.message || 'Login failed' };
        }
    }
};

export const googleAuth = async (code) => {
    try {
        const response = await api.post('/auth/google/login/', { code });

        if (response.data.user) {
            if (response.data.user.role === 'admin') {
                try { await api.post('/auth/logout/'); } catch { }
                localStorage.removeItem('user');
                throw { error: 'Admins must use the dedicated Admin portal to log in.' };
            }
            setAuthUser(response.data.user);
        }

        return response.data;

    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { error: 'Google authentication failed' };
    }
};

export const register = async (formData) => {
    try {
        let config = {};
        if (formData instanceof FormData) {
            config = { headers: { 'Content-Type': 'multipart/form-data' } };
        }
        const response = await api.post('/auth/register/', formData, config);
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else if (error.request) throw { detail: 'Cannot connect to server' };
        else throw { detail: error.message || 'Registration failed' };
    }
};

export const verifyEmail = async (email, otp) => {
    try {
        const response = await api.post('/auth/register/', { email, otp });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else if (error.request) throw { detail: 'Cannot connect to server' };
        else throw { detail: error.message || 'Verification failed' };
    }
};

export const resendOTP = async (email) => {
    try {
        const response = await api.post('/auth/resend-otp/', { email });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to resend OTP' };
    }
};

export const resetPassword = async (email) => {
    try {
        const response = await api.post('/auth/password-reset/request/', { email });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to request password reset' };
    }
};

export const confirmPasswordReset = async (email, otp_code, new_password) => {
    try {
        const response = await api.post('/auth/password-reset/confirm/', {
            email,
            otp_code,
            new_password,
            new_password_confirm: new_password,
        });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to reset password' };
    }
};

export const changePassword = async (old_password, new_password) => {
    try {
        const response = await api.post('/auth/change-password/', {
            old_password,
            new_password,
            new_password_confirm: new_password,
        });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to change password' };
    }
};

export const logout = async () => {
    try {
        await api.post('/auth/logout/');
    } catch {
        console.error('Logout error (continuing)');
    } finally {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('compare_list');
        localStorage.removeItem('ws_access_token');
        delete api.defaults.headers.common['Authorization'];
        window.dispatchEvent(new Event('auth-expired'));
        window.dispatchEvent(new Event('auth-change'));
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/auth/profile/');
        const userData = response.data?.user || response.data;
        if (userData) {
            if (userData.role === 'admin') {
                localStorage.removeItem('user');
                throw { detail: 'Admins must use the dedicated Admin portal.' };
            }
            setAuthUser(userData);
        }
        return userData;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to fetch profile' };
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.patch('/auth/profile/', profileData);
        if (response.data) setAuthUser(response.data);
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to update profile' };
    }
};

export const updateAvatar = async (file) => {
    try {
        const formData = new FormData();
        if (file) formData.append('avatar', file);
        const response = await api.patch('/auth/profile/avatar/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to update avatar' };
    }
};

export const getKYCStatus = async () => {
    try {
        const response = await api.get('/auth/kyc/status/');
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to fetch KYC status' };
    }
};

export const resubmitKYC = async (formData) => {
    try {
        const response = await api.post('/auth/kyc/submit/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to resubmit KYC' };
    }
};

export const getMfaStatus = async () => {
    try {
        const response = await api.get('/auth/mfa/status/');
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to fetch MFA status' };
    }
};

export const initMfaSetup = async (method_type = 'totp') => {
    try {
        const response = await api.post('/auth/mfa/setup/init/', { method_type });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to initialize MFA setup' };
    }
};

export const verifyMfaSetup = async (method_type, code) => {
    try {
        const response = await api.post('/auth/mfa/setup/verify/', { method_type, code });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to verify MFA setup' };
    }
};

export const disableMfa = async (password, method_type = 'all') => {
    try {
        const response = await api.post('/auth/mfa/disable/', { password, method_type });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to disable MFA' };
    }
};

export const verifyMfaLogin = async (mfa_session_token, code) => {
    try {
        const response = await api.post('/auth/mfa/verify/', { mfa_session_token, code });

        if (response.data.user) {
            if (response.data.user.role === 'admin') {
                try { await api.post('/auth/logout/'); } catch { }
                localStorage.removeItem('user');
                throw { detail: 'Admins must use the dedicated Admin portal to log in.' };
            }
            setAuthUser(response.data.user);
        }

        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'MFA verification failed' };
    }
};

export const resendMfaCode = async (mfa_session_token) => {
    try {
        const response = await api.post('/auth/mfa/send-code/', { mfa_session_token });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to resend MFA code' };
    }
};

export const regenerateBackupCodes = async () => {
    try {
        const response = await api.post('/auth/mfa/backup-codes/regenerate/');
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to regenerate backup codes' };
    }
};

export const deactivateAccount = async () => {
    const response = await api.post('/auth/account/deactivate/');
    return response.data;
};

export const deleteAccount = async () => {
    const response = await api.delete('/auth/account/delete/');
    return response.data;
};

export default api;