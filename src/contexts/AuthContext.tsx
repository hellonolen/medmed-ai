/**
 * AuthContext — Real authentication wired to the MedMed.AI Cloudflare Worker.
 * Endpoints: POST /api/auth/signup, POST /api/auth/signin
 * JWT token stored in localStorage. Session restored on mount.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WORKER_URL =
  (import.meta as any).env?.VITE_WORKER_URL ||
  'https://medmed-agent.hellonolen.workers.dev';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  tier: 'free' | 'premium' | 'business';
  memberSince: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateTier: (tier: AuthUser['tier']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'medmed_auth_token';
const USER_KEY = 'medmed_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = (t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const res = await fetch(`${WORKER_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
          signal: AbortSignal.timeout(15000),
        });
        const data = await res.json() as any;
        if (!res.ok) {
          return { success: false, error: data.error || 'Registration failed' };
        }
        persist(data.token, data.user);
        // Send welcome email (fire-and-forget)
        fetch(`${WORKER_URL}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'welcome', to: email, name }),
        }).catch(() => {});
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message || 'Network error' };
      }
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${WORKER_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json() as any;
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
      persist(data.token, data.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateTier = useCallback((tier: AuthUser['tier']) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, tier };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
        updateTier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
