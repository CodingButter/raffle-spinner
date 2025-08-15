'use client';

import { QuickActions } from '@/app/dashboard/components/QuickActions';
import { ActiveSubscriptionsCard } from '@/app/dashboard/components/ActiveSubscriptionsCard';
import { OverviewTabProps } from '@/app/dashboard/components/types';

export function OverviewTab({
  userData,
  userTier,
  userSubscriptions,
  subscriptionsLoading,
  onDownloadExtension,
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <QuickActions 
        userData={userData} 
        onDownloadExtension={onDownloadExtension} 
      />

      {/* Active Subscriptions */}
      <ActiveSubscriptionsCard 
        subscriptions={userSubscriptions} 
        loading={subscriptionsLoading} 
      />
    </div>
  );
}
