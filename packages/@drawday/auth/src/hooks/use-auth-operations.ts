import { useCallback } from 'react';
import { User, AuthState } from '../types';
import { authService as defaultAuthService } from '../services/auth-service';
import type { AuthAction } from '../providers/auth-context';

interface UseAuthOperationsProps {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  service: typeof defaultAuthService;
}

export function useAuthOperations({ state, dispatch, service }: UseAuthOperationsProps) {
  const logout = useCallback(async () => {
    await service.logout(state.tokens?.refresh_token);
    dispatch({ type: 'LOGOUT' });
  }, [state.tokens, service, dispatch]);

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
  }, [state.tokens, state.user, state.subscription, service, dispatch]);

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
    [state.user, state.tokens, service, dispatch]
  );

  return {
    logout,
    refreshToken,
    updateUser,
  };
}
