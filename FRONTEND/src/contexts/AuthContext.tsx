import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  level: number;
  xp: number;
  streak_count?: number;
  target_company?: string | null;
  is_public?: boolean;
  achievements?: any[];
  skill_matrix?: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // NON-BLOCKING Profile Fetch
  const fetchProfile = async (userId: string, authUser?: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (!error && data) {
        setProfile(data);
      } else if (authUser) {
        const { data: syncedProfile } = await supabase
          .from('profiles')
          .upsert([{ 
            id: userId, 
            role: 'student', 
            full_name: authUser.email?.split('@')[0],
            email: authUser.email 
          }])
          .select()
          .maybeSingle();
        if (syncedProfile) setProfile(syncedProfile);
      }
    } catch (err) {
      console.warn('Profile sync pending');
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      
      const newUser = newSession?.user ?? null;
      setSession(newSession);
      setUser(newUser);
      
      if (newUser) {
        fetchProfile(newUser.id, newUser); // DON'T AWAIT
      } else {
        setProfile(null);
      }
      
      // Stop loading on any significant auth event
      setLoading(false);
    });

    // Initial session check with FAILSAFE TIMEOUT
    const checkSession = async () => {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth Timeout')), 3000)
      );

      try {
        // Race getSession against a 3s timeout
        const sessionPromise = supabase.auth.getSession();
        const { data: { session: currentSession } } = await Promise.race([sessionPromise, timeout]) as any;
        
        if (mounted) {
          setSession(currentSession);
          const currentUser = currentSession?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            fetchProfile(currentUser.id, currentUser); // DON'T AWAIT
          }
        }
      } catch (err) {
        console.warn('Auth system initialization delayed or timed out. Proceeding...');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, session, profile, loading, 
      signOut, refreshProfile, signInWithGoogle, resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
