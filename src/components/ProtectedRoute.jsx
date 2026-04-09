import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute — any authenticated user can pass.
 * Reads the cached user from localStorage (set by authService on login).
 */
export const ProtectedRoute = ({ children }) => {
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();

    const location = useLocation();

    if (!user || !localStorage.getItem('access_token')) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

/**
 * ListerRoute — only users with role === 'lister' (or 'admin') can pass.
 * Authenticated non-listers are redirected to /listings.
 */
export const ListerRoute = ({ children }) => {
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();

    const location = useLocation();

    if (!user || !localStorage.getItem('access_token')) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== 'lister' && user.role !== 'admin') {
        // Regular user — redirect to browse page
        return <Navigate to="/listings" replace />;
    }

    return children;
};

/**
 * ConsumerRoute — only regular users (or unauthenticated ones who will bypass to login) can pass.
 * If a 'lister' tries to pass, they are redirected to /lister/dashboard.
 */
export const ConsumerRoute = ({ children }) => {
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();

    const location = useLocation();

    if (!user || !localStorage.getItem('access_token')) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role === 'lister' || user.role === 'admin') {
        // Lister user — redirect to their specific dashboard
        return <Navigate to="/lister/dashboard" replace />;
    }

    return children;
};
