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
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
    // For development, we'll use hardcoded users
    // In production, this would integrate with Supabase Auth
    const knownUsers = [
      { email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { email: 'member@example.com', password: 'member123', role: 'user' },
      { email: 'alexkeal@me.com', password: 'password123', role: 'admin' },
    ];

    const user = knownUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Create a mock user object for the auth state
      const mockUser = {
        id: user.email,
        email: user.email,
        role: user.role,
      } as any;

      setUser(mockUser);
      setIsAdmin(user.role === 'admin');
      setIsUser(user.role === 'user');
      
      return true; // Success
    } else {
      return false; // Failure
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
