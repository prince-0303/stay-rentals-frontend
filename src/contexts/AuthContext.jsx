import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const syncAuth = () => {
            const token = localStorage.getItem('access_token');
            const storedUser = localStorage.getItem('user');

            const hasToken = token && token !== 'null' && token !== 'undefined';
            const hasUser = storedUser && storedUser !== 'null' && storedUser !== 'undefined';

            if (hasToken || hasUser) {
                setIsAuthenticated(true);
                if (hasUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setUser(parsedUser);
                    } catch {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        syncAuth();

        const handleAuthChange = () => {
            syncAuth();
        };

        // Listen to our custom event and cross-tab storage events
        window.addEventListener('auth-change', handleAuthChange);
        window.addEventListener('auth-expired', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);
        
        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
            window.removeEventListener('auth-expired', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
