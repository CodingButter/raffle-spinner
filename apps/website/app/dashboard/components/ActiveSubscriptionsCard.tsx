'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { SubscriptionsList } from './SubscriptionsList';
import { ActiveSubscriptionsCardProps } from './types';

export function ActiveSubscriptionsCard({ subscriptions, loading }: ActiveSubscriptionsCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle>Your Active Subscriptions</CardTitle>
        <CardDescription>Products and services you're currently subscribed to</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <SubscriptionsList subscriptions={subscriptions} />
        )}
      </CardContent>
    </Card>
  );
}
