import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthExpired } from '../api/client';
import { login as loginRequest } from '../api/funds';
import { tokenStorage } from './tokenStorage';

interface AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => tokenStorage.read() !== null,
  );

  // The API client emits `auth expired` when the refresh attempt itself fails
  // (refresh token expired / invalid). React layer reacts by flipping the
  // auth flag, which kicks the protected routes back to /login.
  useEffect(() => {
    const unsubscribe = onAuthExpired(() => {
      setIsAuthenticated(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginRequest(email, password);
    tokenStorage.write({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
