'use client';

import React from 'react';
import { AuthProvider as DrawDayAuthProvider } from '@drawday/auth';
import { AuthService } from '@drawday/auth';

// Create auth service instance with production backend
const authService = new AuthService(
  process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.drawday.app'
);

interface ExtensionAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider wrapper for the extension that configures the backend URL
 */
export function ExtensionAuthProvider({ children }: ExtensionAuthProviderProps) {
  return <DrawDayAuthProvider authService={authService}>{children}</DrawDayAuthProvider>;
}
