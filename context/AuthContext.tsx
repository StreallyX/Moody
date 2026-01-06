import React, { createContext, useContext, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { signIn, signUp, signOut, resetPassword } from '../lib/supabase-auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, session, loading, isAuthenticated } = useSupabaseAuth();

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signIn: async (email, password) => {
      const result = await signIn(email, password);
      return { error: result.error };
    },
    signUp: async (email, password) => {
      const result = await signUp(email, password);
      return { error: result.error };
    },
    signOut: async () => {
      return await signOut();
    },
    resetPassword: async (email) => {
      return await resetPassword(email);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
