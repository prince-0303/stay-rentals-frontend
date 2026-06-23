import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Simple full-screen spinner shown while auth state is being resolved from localStorage
const AuthLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-brand-offwhite">
        <div className="w-10 h-10 rounded-full border-4 border-brand-blue-primary border-t-transparent animate-spin" />
    </div>
);

/**
 * ProtectedRoute — any authenticated user can pass.
 * Waits for auth state to resolve before redirecting, preventing flash-to-login loops.
 */
export const ProtectedRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return <AuthLoader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

/**
 * ListerRoute — only users with role === 'lister' (or 'admin') can pass.
 * Authenticated non-listers are redirected to /listings.
 */
export const ListerRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return <AuthLoader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== 'lister' && user?.role !== 'admin') {
        return <Navigate to="/listings" replace />;
    }

    return children;
};

/**
 * ConsumerRoute — only regular users (or unauthenticated ones who will bypass to login) can pass.
 * If a 'lister' tries to pass, they are redirected to /lister/dashboard.
 */
export const ConsumerRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return <AuthLoader />;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role === 'lister' || user?.role === 'admin') {
        return <Navigate to="/lister/dashboard" replace />;
    }

    return children;
};
