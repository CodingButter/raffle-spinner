'use client';

import { AuthProvider } from '@raffle-spinner/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider config={{ mockMode: true }}>
      {children}
    </AuthProvider>
  );
}