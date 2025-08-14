// Provider
export { AuthProvider, AuthContext } from './providers/auth-context';

// Hooks
export { useAuth } from './hooks/use-auth';
export { useUser } from './hooks/use-user';
export { useSubscription } from './hooks/use-subscription';
export { useRequireAuth } from './hooks/use-require-auth';

// Components
export { ProtectedRoute } from './components/protected-route';
export { SubscriptionGate } from './components/subscription-gate';

// Services
export { authService, AuthService } from './services/auth-service';

// Types
export type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  Subscription,
  AuthState,
  AuthContextValue,
} from './types';
