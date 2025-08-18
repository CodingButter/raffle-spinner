/**
 * Dashboard Usage Page
 *
 * View usage statistics and analytics
 */

'use client';

import { useAuth } from '@drawday/auth';
import { UsageTab } from '@/components/dashboard/tabs/UsageTab';
import { extractUserData } from '@/lib/dashboard-helpers';

export default function DashboardUsagePage() {
  const { user } = useAuth();

  // User is guaranteed to exist because of layout protection
  if (!user) {
    return null;
  }

  // Get user's active spinner subscription from user.subscriptions
  const activeSpinnerSub = user?.subscriptions?.find(
    (s: any) => s.product === 'spinner' && (s.status === 'active' || s.status === 'trialing')
  );

  // Extract user data
  const userData = extractUserData(user, activeSpinnerSub);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Usage & Analytics</h1>
        <p className="text-gray-400">Track your usage and view detailed analytics</p>
      </div>

      <UsageTab userData={userData} />
    </main>
  );
}
