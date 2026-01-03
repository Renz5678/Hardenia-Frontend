import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Auto-refresh token every 50 minutes (tokens expire after 1 hour)
        const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes in milliseconds

        const refreshInterval = setInterval(async () => {
            const { data: { session }, error } = await supabase.auth.refreshSession();
            if (error) {
                console.error('Token refresh failed:', error);
            } else if (session) {
                console.log('Token refreshed successfully');
                setUser(session.user);
            }
        }, REFRESH_INTERVAL);

        return () => {
            subscription.unsubscribe();
            clearInterval(refreshInterval);
        };
    }, []);

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    // Get the current JWT token
    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token ?? null;
    };

    // Manually refresh the token if needed
    const refreshToken = async () => {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return session?.access_token ?? null;
    };

    const value = {
        user,
        signUp,
        signIn,
        signOut,
        loading,
        getToken,
        refreshToken, // Add refresh function
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}