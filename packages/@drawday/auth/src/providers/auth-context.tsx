'use client';

import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import { AuthContextValue, AuthState, User, AuthTokens, Subscription } from '../types';
import { authService } from '../services/auth-service';

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
type AuthAction =
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

  const checkAuth = useCallback(async () => {
    dispatch({ type: 'AUTH_START' });

    try {
      const tokens = service.getStoredTokens();
      const user = service.getStoredUser();

      if (!tokens || !user) {
        dispatch({ type: 'AUTH_ERROR', payload: 'Not authenticated' });
        return;
      }

      // Check if token is expired
      if (service.isTokenExpired(tokens.expires)) {
        // Try to refresh
        const newTokens = await service.refreshToken(tokens.refresh_token);
        const currentUser = await service.getCurrentUser(newTokens.access_token);
        const subscription = await service.getSubscription(currentUser.id, newTokens.access_token);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: currentUser, tokens: newTokens, subscription },
        });
      } else {
        // Token still valid, fetch subscription
        const subscription = await service.getSubscription(user.id, tokens.access_token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens, subscription },
        });
      }
    } catch (error) {
      service.clearStorage();
      dispatch({ type: 'AUTH_ERROR', payload: 'Authentication check failed' });
    }
  }, [service]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      dispatch({ type: 'AUTH_START' });

      try {
        const { user, tokens } = await service.login(credentials);
        const subscription = await service.getSubscription(user.id, tokens.access_token);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens, subscription },
        });
      } catch (error) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: error instanceof Error ? error.message : 'Login failed',
        });
        throw error;
      }
    },
    [service]
  );

  const logout = useCallback(async () => {
    await service.logout(state.tokens?.refresh_token);
    dispatch({ type: 'LOGOUT' });
  }, [state.tokens, service]);

  const register = useCallback(
    async (data: { email: string; password: string; first_name?: string; last_name?: string }) => {
      dispatch({ type: 'AUTH_START' });

      try {
        const { user, tokens } = await service.register(data);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens, subscription: null },
        });
      } catch (error) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: error instanceof Error ? error.message : 'Registration failed',
        });
        throw error;
      }
    },
    [service]
  );

  const refreshToken = useCallback(async () => {
    if (!state.tokens) return;

    try {
      const newTokens = await service.refreshToken(state.tokens.refresh_token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: state.user!,
          tokens: newTokens,
          subscription: state.subscription,
        },
      });
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  }, [state.tokens, state.user, state.subscription, service]);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!state.user || !state.tokens) return;

      const updatedUser = await service.updateUser(
        state.user.id,
        updates,
        state.tokens.access_token
      );
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    },
    [state.user, state.tokens, service]
  );

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
