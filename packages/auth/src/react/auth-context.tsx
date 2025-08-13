'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthClient } from '../auth-client';
import { 
  AuthState, 
  LoginCredentials, 
  SignupData, 
  ResetPasswordRequest,
  ResetPasswordConfirm,
  User,
  Subscription
} from '../types';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (data: ResetPasswordRequest) => Promise<void>;
  confirmPasswordReset: (data: ResetPasswordConfirm) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  hasAccess: (product: string) => boolean;
  isPro: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  config?: {
    apiUrl?: string;
    mockMode?: boolean;
  };
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  const [authClient] = useState(() => new AuthClient(config));
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    subscriptions: [],
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    authClient.initialize().then((initialState) => {
      setState(initialState);
    });
  }, [authClient]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newState = await authClient.login(credentials);
      setState(newState);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [authClient]);

  const signup = useCallback(async (data: SignupData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newState = await authClient.signup(data);
      setState(newState);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [authClient]);

  const logout = useCallback(async () => {
    await authClient.logout();
    setState({
      user: null,
      tokens: null,
      subscriptions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, [authClient]);

  const requestPasswordReset = useCallback(async (data: ResetPasswordRequest) => {
    await authClient.requestPasswordReset(data);
  }, [authClient]);

  const confirmPasswordReset = useCallback(async (data: ResetPasswordConfirm) => {
    await authClient.confirmPasswordReset(data);
  }, [authClient]);

  const refreshSubscriptions = useCallback(async () => {
    try {
      const subscriptions = await authClient.getSubscriptions();
      setState(prev => ({ ...prev, subscriptions }));
    } catch (error) {
      console.error('Failed to refresh subscriptions:', error);
    }
  }, [authClient]);

  const hasAccess = useCallback((product: string) => {
    return authClient.hasAccess(product);
  }, [authClient]);

  const isPro = useCallback(() => {
    return authClient.isPro();
  }, [authClient]);

  const value: AuthContextValue = {
    ...state,
    login,
    signup,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    refreshSubscriptions,
    hasAccess,
    isPro,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Helper hooks for common auth checks
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useSubscriptions(): Subscription[] {
  const { subscriptions } = useAuth();
  return subscriptions;
}

export function useHasAccess(product: string): boolean {
  const { hasAccess } = useAuth();
  return hasAccess(product);
}

export function useIsPro(): boolean {
  const { isPro } = useAuth();
  return isPro();
}