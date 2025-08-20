'use client';

/**
 * AuthGuard Component (Website Integration)
 *
 * Purpose: Simple auth guard for website extension pages.
 * For now, this is a pass-through to allow development.
 * Can be enhanced later with proper authentication.
 */

import React from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  // For website integration, we'll bypass auth for now
  // This allows the extension pages to work in browser context
  // TODO: Implement proper auth when needed
  return <>{children}</>;
}
