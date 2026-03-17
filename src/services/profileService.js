import api from './api';

// ── User Profile ──────────────────────────────────────────────────────────────

export const getUserProfile = async () => {
    try {
        const response = await api.get('/profile/user/');
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to fetch profile' };
    }
};

export const updateUserProfile = async (data) => {
    try {
        const response = await api.patch('/profile/user/', data);
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to update profile' };
    }
};

export const updateUserProfilePicture = async (file) => {
    try {
        const formData = new FormData();
        formData.append('profile_picture', file);
        const response = await api.patch('/profile/user/picture/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to update profile picture' };
    }
};

// ── Lister Profile ────────────────────────────────────────────────────────────

export const getListerProfile = async () => {
    try {
        const response = await api.get('/profile/lister/');
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to fetch lister profile' };
    }
};

export const updateListerProfile = async (data) => {
    try {
        const response = await api.patch('/profile/lister/', data);
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to update lister profile' };
    }
};

export const updateListerProfilePicture = async (file) => {
    try {
        const formData = new FormData();
        formData.append('profile_picture', file);
        const response = await api.patch('/profile/lister/picture/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw { detail: 'Failed to update lister profile picture' };
    }
};