import React, { useEffect } from 'react';
import { AuthProvider as DrawDayAuthProvider, useAuth } from '@drawday/auth';
import { AuthService } from '@drawday/auth';
import { API_CONFIG } from '../config/api';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import {
  syncSubscriptionFromAuth,
  clearSubscriptionFromStorage,
} from '../services/subscription-sync';

// Create auth service instance with production backend
const authService = new AuthService(API_CONFIG.DIRECTUS_URL);

interface ExtensionAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Component that syncs auth state with subscription storage
 */
function AuthSyncWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, subscription } = useAuth();

  useEffect(() => {
    // Sync subscription when auth state changes
    if (isAuthenticated) {
      syncSubscriptionFromAuth();
    } else {
      clearSubscriptionFromStorage();
    }
  }, [isAuthenticated, subscription]);

  return <>{children}</>;
}

/**
 * Auth provider wrapper for the extension that configures the backend URL
 */
export function ExtensionAuthProvider({ children }: ExtensionAuthProviderProps) {
  return (
    <DrawDayAuthProvider authService={authService}>
      <SubscriptionProvider>
        <AuthSyncWrapper>{children}</AuthSyncWrapper>
      </SubscriptionProvider>
    </DrawDayAuthProvider>
  );
}
