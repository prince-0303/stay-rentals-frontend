import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    timeout: 60000,
});

// URLs that should NEVER trigger a token refresh (they ARE the auth endpoints)
const AUTH_URLS = ['/auth/login/', '/auth/register/', '/auth/token/refresh/', '/auth/google/login/', '/auth/logout/'];

const isAuthUrl = (url) => AUTH_URLS.some(authUrl => url?.includes(authUrl));

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && !isAuthUrl(config.url)) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve();
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh on 401, and only once per request
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl(originalRequest.url)) {

            // Queue additional requests while refresh is in progress
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refresh_token = localStorage.getItem('refresh_token');
                
                if (!refresh_token) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post(
                    `${API_URL}/auth/token/refresh/`,
                    { refresh: refresh_token },
                    {
                        withCredentials: true,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                const newAccessToken = response.data.access;
                localStorage.setItem('access_token', newAccessToken);
                if (response.data.refresh) {
                    localStorage.setItem('refresh_token', response.data.refresh);
                }

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null);
                return api(originalRequest);

            } catch (refreshError) {
                console.warn('[api] Token refresh failed', refreshError?.response?.status, refreshError?.response?.data);
                processQueue(refreshError);

                // Only logout on genuine expiry (401/403), NOT on network errors
                const status = refreshError?.response?.status;
                if (status === 401 || status === 403 || refreshError.message === 'No refresh token available') {
                    localStorage.removeItem('user');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.dispatchEvent(new Event('auth-change'));
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;