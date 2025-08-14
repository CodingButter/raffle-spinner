/**
 * Dashboard Overview Page
 *
 * Main dashboard landing page showing overview information
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@drawday/auth';
import { TrialBanner } from '@/components/dashboard/shared/TrialBanner';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { useDashboardData } from '@/hooks/useDashboardData';
import { extractUserData } from '@/lib/dashboard-helpers';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Fetch products and subscriptions using custom hook
  const { userSubscriptions, subscriptionsLoading } = useDashboardData(user, null);

  // User is guaranteed to exist because of layout protection
  if (!user) {
    return null;
  }

  // Get user's active spinner subscription from user.subscriptions
  const activeSpinnerSub = user?.subscriptions?.find(
    (s: any) => s.product === 'spinner' && (s.status === 'active' || s.status === 'trialing')
  );
  const userTier = activeSpinnerSub?.tier || 'free';

  // Extract user data
  const userData = extractUserData(user, activeSpinnerSub);

  const handleDownloadExtension = () => {
    // TODO: Implement actual download
    window.open('https://chrome.google.com/webstore', '_blank');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userData.name}</h1>
        <p className="text-gray-400">
          Manage your DrawDay subscription and download the Chrome extension
        </p>
      </div>

      {/* Trial Banner - Only show for free tier users */}
      {userTier === 'free' && (
        <TrialBanner
          trialEndsAt={userData.trialEndsAt}
          onUpgradeClick={() => router.push('/dashboard/subscription')}
        />
      )}

      {/* Overview Content */}
      <OverviewTab
        userData={userData}
        userTier={userTier}
        userSubscriptions={userSubscriptions}
        subscriptionsLoading={subscriptionsLoading}
        onDownloadExtension={handleDownloadExtension}
      />
    </main>
  );
}
