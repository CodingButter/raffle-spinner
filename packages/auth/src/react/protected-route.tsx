'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requirePro?: boolean;
  requireProduct?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requirePro = false,
  requireProduct,
  redirectTo = '/login',
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasAccess, isPro } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (requirePro && !isPro()) {
      router.push('/upgrade');
      return;
    }

    if (requireProduct && !hasAccess(requireProduct)) {
      router.push('/upgrade');
      return;
    }
  }, [isAuthenticated, isLoading, requireAuth, requirePro, requireProduct, redirectTo, router, hasAccess, isPro]);

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requirePro && !isPro()) {
    return null;
  }

  if (requireProduct && !hasAccess(requireProduct)) {
    return null;
  }

  return <>{children}</>;
}