import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    timeout: 60000,
});

// URLs that should NEVER trigger a token refresh
const AUTH_URLS = ['/auth/login/', '/auth/register/', '/auth/token/refresh/', '/auth/google/login/', '/auth/logout/'];

// Background polling URLs — if these 401, silently fail (do NOT log out)
const BACKGROUND_URLS = ['/notifications/', '/chat/conversations/', '/properties/saved/', '/notifications/register-token/', '/chat/token/'];

const isAuthUrl = (url) => AUTH_URLS.some(authUrl => url?.includes(authUrl));
const isBackgroundUrl = (url) => BACKGROUND_URLS.some(bg => url?.includes(bg));

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    // Ensure we don't attach an old token or literal "null" string to auth requests
    if (token && token !== 'null' && token !== 'undefined' && !isAuthUrl(config.url)) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // SAFETY GATE 1: Already on the login page — never redirect again.
        if (window.location.pathname === '/login') {
            return Promise.reject(error);
        }

        // SAFETY GATE 2: Background polling requests that 401 should fail silently.
        // Do NOT log the user out just because a background request failed.
        if (error.response?.status === 401 && isBackgroundUrl(originalRequest.url)) {
            return Promise.reject(error);
        }

        // Only attempt refresh on 401, and only once per request
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl(originalRequest.url)) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // COOKIE-BASED AUTH: The refresh_token lives in an HttpOnly cookie.
                // JavaScript cannot read it — that's the point of HttpOnly.
                // We send withCredentials: true so the browser attaches the cookie
                // automatically. The backend reads the refresh token from the cookie.
                const response = await axios.post(
                    `${API_URL}/auth/token/refresh/`,
                    {},  // empty body — backend reads refresh_token from cookie
                    {
                        withCredentials: true,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                // Backend may return new access token in body AND/OR reset cookies
                const newAccessToken = response.data.access || response.data.access_token;

                if (newAccessToken) {
                    localStorage.setItem('access_token', newAccessToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                if (response.data.refresh) {
                    localStorage.setItem('refresh_token', response.data.refresh);
                }

                processQueue(null, newAccessToken);
                return api(originalRequest);

            } catch (refreshError) {
                console.warn('[api] Token refresh failed:', refreshError?.response?.status || refreshError?.message);
                processQueue(refreshError, null);

                // CRITICAL: Use a custom event instead of window.location.href
                // window.location.href causes a full page reload which clears the console
                // and creates an infinite request loop (5000+ requests).
                localStorage.removeItem('user');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // Let AuthContext handle the redirect via React Router
                window.dispatchEvent(new Event('auth-expired'));
                window.dispatchEvent(new Event('auth-change'));

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;