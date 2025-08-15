'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { Badge } from '@drawday/ui/badge';
import { CheckCircle2, AlertCircle, Clock, CreditCard } from 'lucide-react';

interface ActiveSubscription {
  id: string;
  product: string;
  tier: string;
  status: string;
  expires_at?: string;
  stripe_subscription_id?: string;
}

interface ActiveSubscriptionsProps {
  subscriptions: ActiveSubscription[];
  onManage: () => void;
}

export function ActiveSubscriptions({ subscriptions, onManage }: ActiveSubscriptionsProps) {
  // Filter for active or trialing subscriptions
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'active' || sub.status === 'trialing'
  );

  if (activeSubscriptions.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle>Your Active Subscriptions</CardTitle>
          <CardDescription>Manage your active product subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="mb-4">No active subscriptions</p>
            <p className="text-sm">Upgrade to a paid plan to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle>Your Active Subscriptions</CardTitle>
        <CardDescription>Manage your active product subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSubscriptions.map((subscription) => (
            <SubscriptionItem
              key={subscription.id}
              subscription={subscription}
              onManage={onManage}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionItem({
  subscription,
  onManage,
}: {
  subscription: ActiveSubscription;
  onManage: () => void;
}) {
  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'trialing':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-900/50 text-green-400 border-green-400/20">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-900/50 text-blue-400 border-blue-400/20">Trial</Badge>;
      default:
        return (
          <Badge className="bg-yellow-900/50 text-yellow-400 border-yellow-400/20">
            {subscription.status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium capitalize">
                {subscription.product} - {subscription.tier} Plan
              </p>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-400">
              {subscription.expires_at
                ? `Renews: ${formatDate(subscription.expires_at)}`
                : 'Ongoing subscription'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-gray-600" onClick={onManage}>
          <CreditCard className="mr-2 w-4 h-4" />
          Manage
        </Button>
      </div>
    </div>
  );
}
