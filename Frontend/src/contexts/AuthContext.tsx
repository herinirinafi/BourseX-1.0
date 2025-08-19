import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, getAuthToken, setRefreshToken, loadTokensFromStorage, getRefreshToken } from '../services/authToken';
import { setApiAuthToken } from '../services/apiClient';
import { authService, UserProfile } from '../services/authService';

export type AuthContextValue = {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  loginWithToken: (token: string) => void;
  setRefresh: (refresh: string | null) => void;
  user: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [refresh, setRefreshState] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Keep api client in sync
  useEffect(() => {
    // Hydrate tokens from storage on initial mount
    (async () => {
      await loadTokensFromStorage();
      const storedToken = getAuthToken();
      setTokenState(storedToken);
      setRefreshState(getRefreshToken());
      setApiAuthToken(storedToken);
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

  // Load user profile when token is available
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!token || !hydrated) {
        console.log('⏩ Skipping user profile load - no token or not hydrated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Loading user profile...');
        // Try to get user profile from API
        try {
          const userProfile = await authService.getCurrentUser();
          console.log('✅ User profile loaded from API:', userProfile);
          setUser(userProfile);
        } catch (apiError) {
          console.log('⚠️ API failed, falling back to token decoding:', apiError);
          // Fallback to token decoding if API fails
          const tokenPayload = authService.decodeToken(token);
          if (tokenPayload) {
            const fallbackUser = {
              id: tokenPayload.user_id,
              username: tokenPayload.username || 'Unknown',
              email: tokenPayload.email || '',
              first_name: tokenPayload.first_name || '',
              last_name: tokenPayload.last_name || '',
              is_staff: tokenPayload.is_staff || false,
              is_active: tokenPayload.is_active !== false,
              date_joined: new Date().toISOString(),
            };
            console.log('📝 Fallback user from token:', fallbackUser);
            setUser(fallbackUser);
          }
        }
      } catch (error) {
        console.error('❌ Error loading user profile:', error);
        // If token is invalid, clear it
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [token, hydrated]);

  const refreshUserProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      const userProfile = await authService.getCurrentUser();
      setUser(userProfile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  }, [token]);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (!t) {
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🚪 AuthContext logout called');
    console.log('📝 Current state before logout:', { 
      hasToken: !!token, 
      hasUser: !!user, 
      username: user?.username 
    });
    
    setTokenState(null);
    setRefreshState(null);
    setUser(null);
    
    // Immediately clear token stores to prevent stale headers
    setAuthToken(null);
    setRefreshToken(null);
    setApiAuthToken(null);
    
    console.log('🧹 Tokens and user state cleared');
    console.log('✅ AuthContext logout completed');
  }, [token, user]);

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

  const value = useMemo<AuthContextValue>(() => {
    const isAdmin = user?.is_staff || false;
    console.log('🏛️ AuthContext - User:', user?.username, 'isAdmin:', isAdmin, 'is_staff:', user?.is_staff);
    return {
      token,
      setToken,
      isAuthenticated: !!token,
      logout,
      loginWithToken,
      setRefresh,
      user,
      isAdmin,
      loading,
      refreshUserProfile,
    };
  }, [token, setToken, logout, loginWithToken, setRefresh, user, loading, refreshUserProfile]);

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
