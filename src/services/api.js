import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    timeout: 60000,
});

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

// URLs that should NEVER trigger a token refresh (they ARE the auth endpoints)
const AUTH_URLS = ['/auth/login/', '/auth/register/', '/auth/token/refresh/', '/auth/google/login/', '/auth/logout/'];

const isAuthUrl = (url) => AUTH_URLS.some(authUrl => url?.includes(authUrl));

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
                // The refresh token is stored in an HttpOnly cookie.
                // We send withCredentials so the browser includes it automatically.
                await axios.post(
                    `${API_URL}/auth/token/refresh/`,
                    {},
                    {
                        withCredentials: true,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                processQueue(null);
                return api(originalRequest);

            } catch (refreshError) {
                console.warn('[api] Token refresh failed', refreshError?.response?.status, refreshError?.response?.data);
                processQueue(refreshError);

                // Only logout on genuine expiry (401/403), NOT on network errors
                const status = refreshError?.response?.status;
                if (status === 401 || status === 403) {
                    localStorage.removeItem('user');
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