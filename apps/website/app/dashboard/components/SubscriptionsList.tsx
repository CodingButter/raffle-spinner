'use client';

import { SubscriptionCategory } from './SubscriptionCategory';
import { SubscriptionsListProps } from './types';

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const hasActiveSubscriptions = Object.values(subscriptions).some(
    (subs: any) => Array.isArray(subs) && subs.length > 0
  );

  if (!hasActiveSubscriptions) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No active subscriptions</p>
        <p className="text-sm mt-2">Upgrade to access premium features</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.spinner?.length > 0 && (
        <SubscriptionCategory
          title="Spinner Services"
          subscriptions={subscriptions.spinner}
          color="purple"
        />
      )}
      {subscriptions.website?.length > 0 && (
        <SubscriptionCategory
          title="Website Services"
          subscriptions={subscriptions.website}
          color="blue"
        />
      )}
      {subscriptions.streaming?.length > 0 && (
        <SubscriptionCategory
          title="Streaming Services"
          subscriptions={subscriptions.streaming}
          color="green"
        />
      )}
    </div>
  );
}
