'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import Footer from '@/components/Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're on a dashboard page
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <>
      {/* Only show navigation if not on dashboard */}
      {!isDashboard && <Navigation />}
      <main className="flex-1">{children}</main>
      {/* Only show footer if not on dashboard */}
      {!isDashboard && <Footer />}
    </>
  );
}
