/**
 * Dashboard Subscription Page
 *
 * Redirects to the default subscription category (spinner)
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardSubscriptionPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default category (spinner)
    router.replace('/dashboard/subscription/spinner');
  }, [router]);

  return null; // Return null while redirecting
}
