import api from './api';

export const submitKYC = async (kycData) => {
    try {
        const response = await api.post('/auth/kyc/submit/', kycData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw error.response.data;
        } else if (error.request) {
            throw { detail: 'Cannot connect to server.' };
        } else {
            throw { detail: error.message || 'KYC submission failed' };
        }
    }
};

export const getKYCStatus = async () => {
    try {
        const response = await api.get('/auth/kyc/status/');
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: 'Failed to fetch KYC status' };
    }
};