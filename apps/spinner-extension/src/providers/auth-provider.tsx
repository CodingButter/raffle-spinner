import React from 'react';
import { AuthProvider as DrawDayAuthProvider } from '@drawday/auth';
import { AuthService } from '@drawday/auth';
import { API_CONFIG } from '../config/api';

// Create auth service instance with production backend
const authService = new AuthService(API_CONFIG.DIRECTUS_URL);

interface ExtensionAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider wrapper for the extension that configures the backend URL
 */
export function ExtensionAuthProvider({ children }: ExtensionAuthProviderProps) {
  return (
    <DrawDayAuthProvider authService={authService}>
      {children}
    </DrawDayAuthProvider>
  );
}