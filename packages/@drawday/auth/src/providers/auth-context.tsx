'use client';

import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import { AuthContextValue, AuthState, User, AuthTokens, Subscription } from '../types';
import { authService } from '../services/auth-service';
import { useAuthMethods } from '../hooks/use-auth-methods';
import { useAuthOperations } from '../hooks/use-auth-operations';

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  subscription: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
export type AuthAction =
  | { type: 'AUTH_START' }
  | {
      type: 'AUTH_SUCCESS';
      payload: {
        user: User;
        tokens: AuthTokens;
        subscription?: Subscription | null;
      };
    }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription | null };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        subscription: action.payload.subscription || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscription: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider component
export function AuthProvider({
  children,
  authService: customAuthService,
}: {
  children: React.ReactNode;
  authService?: typeof authService;
}) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const service = customAuthService || authService;

  // Helper to extract subscription from user object
  const extractSubscription = (user: User): Subscription | null => {
    const userWithSubs = user as User & { subscriptions?: Subscription[] };
    return userWithSubs.subscriptions?.[0] || null;
  };

  // Helper to handle successful authentication
  const handleAuthSuccess = useCallback(
    (user: User, tokens: AuthTokens, subscription: Subscription | null) => {
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, tokens, subscription },
      });
    },
    []
  );

  // Use auth methods hook
  const { checkAuth, login, register } = useAuthMethods({
    dispatch,
    service,
    extractSubscription,
    handleAuthSuccess,
  });

  // Use auth operations hook
  const { logout, refreshToken, updateUser } = useAuthOperations({
    state,
    dispatch,
    service,
  });

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    register,
    refreshToken,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export context for direct use if needed
export { AuthContext };
