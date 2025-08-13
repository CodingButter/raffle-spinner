// Core auth client
export { AuthClient } from './auth-client';

// Types
export * from './types';

// Validation schemas
export * from './validation';

// React components and hooks
export { AuthProvider, useAuth, useUser, useIsAuthenticated, useSubscriptions, useHasAccess, useIsPro } from './react/auth-context';
export { ProtectedRoute } from './react/protected-route';

// Mock data for development
export { MOCK_USERS } from './mock-data';