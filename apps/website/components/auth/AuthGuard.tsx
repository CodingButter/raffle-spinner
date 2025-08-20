/**
 * AuthGuard Component for Website Extension Pages
 * 
 * Ensures user is authenticated before accessing extension features
 * Redirects to login if not authenticated
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@drawday/auth';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page if not authenticated
      router.push('/login?redirect=/extension/sidepanel');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <SubscriptionProvider>{children}</SubscriptionProvider>;
}