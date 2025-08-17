import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, getAuthToken } from '../services/authToken';
import { setApiAuthToken } from '../services/apiClient';

export type AuthContextValue = {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  loginWithToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken());

  // Keep api client in sync
  useEffect(() => {
    setAuthToken(token);
    setApiAuthToken(token);
  }, [token]);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
  }, []);

  const loginWithToken = useCallback((t: string) => {
    setTokenState(t || null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    setToken,
    isAuthenticated: !!token,
    logout,
    loginWithToken,
  }), [token, setToken, logout, loginWithToken]);

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
