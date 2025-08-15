/**
 * Prefetch Links Component
 * 
 * Prefetches critical routes to improve navigation speed
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const criticalRoutes = [
  '/pricing',
  '/spinner',
  '/login',
  '/register',
];

export function PrefetchLinks() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch critical routes after initial load
    const timer = setTimeout(() => {
      criticalRoutes.forEach(route => {
        router.prefetch(route);
      });
    }, 2000); // Wait 2 seconds after page load

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}