import api from './api';

export const propertyService = {
    // Get ALL properties (public browse — any authenticated user)
    getAllProperties: async (params = {}) => {
        const response = await api.get('/properties/', { params });
        return response.data;
    },

    // Get all properties for logged-in lister
    getMyProperties: async () => {
        const response = await api.get('/properties/my/');
        return response.data;
    },


    // Get single property by ID
    getProperty: async (id) => {
        const response = await api.get(`/properties/${id}/`);
        return response.data;
    },

    createProperty: async (data) => {
        // Remove null or empty string values
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== null && v !== '')
        );
        const response = await api.post('/properties/create/', cleanData);
        return response.data;
    },

    updateProperty: async (id, data) => {
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== null && v !== '')
        );
        const response = await api.patch(`/properties/${id}/`, cleanData);
        return response.data;
    },

    // Upload images for a property
    uploadPropertyImages: async (id, formData) => {
        // formData should contain files[] and primary_index
        const response = await api.post(`/properties/${id}/images/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 120000, // Longer timeout for uploads
        });
        return response.data;
    },

    // Delete a specific image
    deletePropertyImage: async (id, imageId) => {
        const response = await api.delete(`/properties/${id}/images/${imageId}/`);
        return response.data;
    },

    // Delete entire property
    deleteProperty: async (id) => {
        const response = await api.delete(`/properties/${id}/`);
        return response.data;
    },

    // Get visit requests for the authenticated lister's properties
    getVisitRequests: async (propertyId = null) => {
        const url = propertyId
            ? `/properties/visits/?property_id=${propertyId}`
            : '/properties/visits/';
        const res = await api.get(url);
        return res.data;
    },

    // Get my scheduled visits (tenant view)
    getMyVisits: async () => {
        const response = await api.get('/properties/visits/');
        return response.data;
    },

    // Request a visit
    requestVisit: async (propertyId, requested_date, user_note = '') => {
        const response = await api.post(`/properties/${propertyId}/visit/`, { requested_date, user_note });
        return response.data;
    },

    // Accept or decline a visit request
    updateVisitRequest: async (propertyId, requestId, status, lister_note = '') => {
        const response = await api.patch(
            `/properties/visits/${requestId}/manage/`,
            { status, lister_note }
        );
        return response.data;
    },

    // Reviews
    getPropertyReviews: (id) => api.get(`/properties/${id}/reviews/`).then(r => r.data),
    submitReview: (id, data) => api.post(`/properties/${id}/reviews/`, data).then(r => r.data),
    deleteReview: (id) => api.delete(`/properties/${id}/reviews/`).then(r => r.data),

    // Saved / Wishlist
    getSavedProperties: () => api.get('/properties/saved/').then(r => r.data),
    saveProperty: (id) => api.post(`/properties/${id}/save/`).then(r => r.data),
    unsaveProperty: (id) => api.delete(`/properties/${id}/save/`).then(r => r.data),

    getPreferences: async () => {
        const response = await api.get('/properties/preferences/');
        return response.data;
    },

    updatePreferences: async (data) => {
        const response = await api.patch('/properties/preferences/', data);
        return response.data;
    },

    // AI Search
    aiSearch: (query) => api.post('/properties/search/ai/', { query }).then(r => r.data),

    // AI Compare
    compareProperties: (property_ids, preference = '') => api.post('/properties/compare/', { property_ids, preference }).then(r => r.data),

    // Recommendations
    getRecommendations: () => api.get('/properties/recommendations/').then(r => r.data),
};
