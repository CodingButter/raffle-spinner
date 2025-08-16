import { useCallback } from 'react';
import { User, AuthTokens, Subscription } from '../types';
import { authService as defaultAuthService } from '../services/auth-service';
import type { AuthAction } from '../providers/auth-context';

interface UseAuthMethodsProps {
  dispatch: React.Dispatch<AuthAction>;
  service: typeof defaultAuthService;
  extractSubscription: (user: User) => Subscription | null;
  handleAuthSuccess: (user: User, tokens: AuthTokens, subscription: Subscription | null) => void;
}

export function useAuthMethods({
  dispatch,
  service,
  extractSubscription,
  handleAuthSuccess,
}: UseAuthMethodsProps) {
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
        const subscription = extractSubscription(currentUser);
        handleAuthSuccess(currentUser, newTokens, subscription);
      } else {
        // Token still valid - use subscriptions from stored user
        const subscription = extractSubscription(user);
        handleAuthSuccess(user, tokens, subscription);
      }
    } catch (error) {
      service.clearStorage();
      dispatch({ type: 'AUTH_ERROR', payload: 'Authentication check failed' });
    }
  }, [service, handleAuthSuccess, extractSubscription, dispatch]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      dispatch({ type: 'AUTH_START' });

      try {
        const { user, tokens } = await service.login(credentials);
        const subscription = extractSubscription(user);

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
    [service, extractSubscription, dispatch]
  );

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
    [service, dispatch]
  );

  return {
    checkAuth,
    login,
    register,
  };
}
