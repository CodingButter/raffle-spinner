'use client';

/**
 * Providers (Website Integration)
 *
 * Simple provider wrapper for website. Auth is handled differently
 * in the website context than in the extension.
 */

export function Providers({ children }: { children: React.ReactNode }) {
  // For website integration, we don't need the auth provider
  // Extension pages handle their own auth context
  return <>{children}</>;
}
