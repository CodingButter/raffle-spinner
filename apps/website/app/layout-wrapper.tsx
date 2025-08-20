'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're on a dashboard or extension page
  const isIsolatedRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/extension');

  return (
    <>
      {/* Only show navigation if not on isolated routes */}
      {!isIsolatedRoute && <Navigation />}
      <main className="flex-1">{children}</main>
      {/* Only show footer if not on isolated routes */}
      {!isIsolatedRoute && <Footer />}
    </>
  );
}
