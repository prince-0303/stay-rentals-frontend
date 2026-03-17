/**
 * Resolves a Django media URL to an absolute URL.
 *
 * Django often returns relative paths like "/media/properties/xyz.jpg".
 * The frontend (localhost:5173) can't load these — they need the backend
 * origin (e.g. "http://localhost") prepended.
 *
 * If the URL is already absolute (starts with http/https), it is returned as-is.
 */
const BACKEND_ORIGIN = (() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost/api';
    // Strip the /api suffix to get the bare origin
    try {
        const url = new URL(apiUrl);
        return url.origin;
    } catch {
        return 'http://localhost';
    }
})();

export function resolveMediaUrl(url) {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Relative path — prepend backend origin
    return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}
