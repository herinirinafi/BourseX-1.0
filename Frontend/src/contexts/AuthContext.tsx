import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, getAuthToken, setRefreshToken, loadTokensFromStorage, getRefreshToken } from '../services/authToken';
import { setApiAuthToken } from '../services/apiClient';

export type AuthContextValue = {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  loginWithToken: (token: string) => void;
  setRefresh: (refresh: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [refresh, setRefreshState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Keep api client in sync
  useEffect(() => {
    // Hydrate tokens from storage on initial mount
    (async () => {
      await loadTokensFromStorage();
      setTokenState(getAuthToken());
      setRefreshState(getRefreshToken());
      setApiAuthToken(getAuthToken());
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setAuthToken(token);
    setApiAuthToken(token);
  }, [token, hydrated]);

  useEffect(() => {
    setRefreshToken(refresh);
  }, [refresh]);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
  setRefreshState(null);
  // Immediately clear token stores to prevent stale headers
  setAuthToken(null);
  setRefreshToken(null);
  setApiAuthToken(null);
  }, []);

  const loginWithToken = useCallback((t: string) => {
  // Set state and immediately sync to token stores to avoid race
  setTokenState(t || null);
  setAuthToken(t || null);
  setApiAuthToken(t || null);
  }, []);

  const setRefresh = useCallback((t: string | null) => {
  setRefreshState(t);
  // Sync refresh token immediately for auto-refresh
  setRefreshToken(t);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    setToken,
    isAuthenticated: !!token,
    logout,
    loginWithToken,
    setRefresh,
  }), [token, setToken, logout, loginWithToken, setRefresh]);

  if (!hydrated) return null; // wait for token hydration to avoid unauthenticated initial fetches
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
