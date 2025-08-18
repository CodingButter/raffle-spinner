'use client';

import { useAuth } from './use-auth';
import { User } from '../types';

/**
 * Hook to get the current user
 */
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}
