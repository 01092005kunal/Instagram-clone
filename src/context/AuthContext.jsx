import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../Supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        if (!userId) return null;
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            if (!error && data) {
                setUserProfile(data);
            }
            return data;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    };

    useEffect(() => {
        const getSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Session error:', error);
                }
                const session = data?.session;
                setUser(session?.user || null);
                if (session?.user) {
                    fetchProfile(session.user.id);
                }
            } catch (err) {
                console.error('Error in getSession:', err);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
                if (session?.user) {
                    fetchProfile(session.user.id);
                } else {
                    setUserProfile(null);
                }
                setLoading(false);
            }
        );

        return () => subscription?.unsubscribe();
    }, []);

    const signUp = async (email, password, username, fullName = '') => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    full_name: fullName,
                },
            },
        });

        if (authError) throw authError;

        if (authData.user) {
            const { error: profileError } = await supabase
                .from('users')
                .insert([{
                    id: authData.user.id,
                    email,
                    username,
                    full_name: fullName,
                }]);

            if (profileError) throw profileError;
        }

        return authData.user;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data.user;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setUserProfile(null);
    };

    const value = {
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        signOut,
        fetchProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
