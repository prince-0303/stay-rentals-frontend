import api from './api';

// Helper: persist user AND notify same-tab listeners (e.g. ChatWidget)
const setAuthUser = (userData, access, refresh) => {
    localStorage.setItem('user', JSON.stringify(userData));
    if (access) localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    window.dispatchEvent(new Event('auth-change'));
};


export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login/', { email, password });
        console.log('[login] Backend response.data:', response.data);

        const access = response.data.access || response.data.tokens?.access || response.data.token?.access || response.data.access_token || response.data.token;
        const refresh = response.data.refresh || response.data.tokens?.refresh || response.data.token?.refresh || response.data.refresh_token;

        if (access) localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);

        if (response.data.user) {
            // Block admin from logging into the main app frontend
            if (response.data.user.role === 'admin') {
                try { await api.post('/auth/logout/'); } catch (e) { /* ignore */ }
                localStorage.removeItem('user');
                throw { detail: 'Admins must use the dedicated Admin portal to log in.' };
            }
            setAuthUser(response.data.user, access, refresh);
        } else if (access) {
            window.dispatchEvent(new Event('auth-change'));
        }

        return response.data;

    } catch (error) {
        if (error.response) {
            // If the backend returns user data even on error (e.g. 403 KYC required),
            // persist it so ProtectedRoute/KYC pages can function.
            if (error.response.data && error.response.data.user) {
                setAuthUser(error.response.data.user, error.response.data.access, error.response.data.refresh);
            }
            throw error.response.data;
        } else if (error.request) {
            throw { detail: 'Cannot connect to server. Please check if backend is running.' };
        } else {
            throw { detail: error.message || 'Login failed' };
        }
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


export const googleAuth = async (code) => {
    try {
        const response = await api.post('/auth/google/login/', { code });

        // Store user data immediately so Dashboard can read it before API call
        if (response.data.user) {
            if (response.data.user.role === 'admin') {
                try { await api.post('/auth/logout/'); } catch (e) { /* ignore */ }
                localStorage.removeItem('user');
                throw { error: 'Admins must use the dedicated Admin portal to log in.' };
            }
            const access = response.data.access || response.data.tokens?.access || response.data.token?.access || response.data.access_token;
            const refresh = response.data.refresh || response.data.tokens?.refresh || response.data.token?.refresh || response.data.refresh_token;
            setAuthUser(response.data.user, access, refresh);
        }

        return response.data;

    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { error: 'Google authentication failed' };
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
    } catch (error) {
        console.error('⚠️ Logout error (continuing):', error);
    } finally {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('compare_list');
        window.dispatchEvent(new Event('auth-change'));
        window.location.href = '/login';
    }
};


export const getProfile = async () => {
    try {
        console.log('Token in Storage:', localStorage.getItem('access_token'));
        const response = await api.get('/auth/profile/');
        // Keep localStorage in sync with latest profile from server
        const userData = response.data?.user || response.data;
        if (userData) {
            if (userData.role === 'admin') {
                // If an admin somehow loads this page, kick them back to login page
                localStorage.removeItem('user');
                throw { detail: 'Admins must use the dedicated Admin portal.' };
            }
            setAuthUser(userData, response.data?.access, response.data?.refresh);
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
        if (response.data) {
            setAuthUser(response.data);
        }
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
                try { await api.post('/auth/logout/'); } catch (e) { /* ignore */ }
                localStorage.removeItem('user');
                throw { detail: 'Admins must use the dedicated Admin portal to log in.' };
            }
            const access = response.data.access || response.data.tokens?.access || response.data.token?.access || response.data.access_token;
            const refresh = response.data.refresh || response.data.tokens?.refresh || response.data.token?.refresh || response.data.refresh_token;
            setAuthUser(response.data.user, access, refresh);
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