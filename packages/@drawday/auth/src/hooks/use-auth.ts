'use client';

import { useContext } from 'react';
import { AuthContext } from '../providers/auth-context';
import { AuthContextValue } from '../types';

/**
 * Hook to access the auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
