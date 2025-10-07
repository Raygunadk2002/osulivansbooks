'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;

  signIn: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Handle auth code exchange if present in URL
    const handleAuthCode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log('Exchanging auth code:', code);
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Auth code exchange error:', error);
        } else {
          console.log('Auth code exchange successful:', data.session?.user?.email);
          // Remove the code from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      await handleAuthCode();
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session:', session?.user?.email);
      
      if (session?.user) {
        setUser(session.user);
        await checkUserRole(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
          if (session?.user) {
            await checkUserRole(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          setIsUser(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, checkUserRole]);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
        setIsUser(false);
        return;
      }

      setIsAdmin(member?.role === 'ADMIN');
      setIsUser(member?.role === 'USER' || member?.role === 'MEMBER');
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
      setIsUser(false);
    }
  };

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithPassword = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    // Clear local state
    setUser(null);
    setIsAdmin(false);
    setIsUser(false);
  };

  const value = {
    user,
    loading,
    isAdmin,
    isUser,
    signIn,
    signInWithPassword,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
