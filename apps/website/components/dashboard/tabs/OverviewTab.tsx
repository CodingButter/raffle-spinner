'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { Chrome, Download, Activity, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

interface OverviewTabProps {
  userData: {
    plan: string;
    trialEndsAt: string;
    usage: {
      draws: number;
      participants: number;
      lastDraw: string;
    };
  };
  userTier: string;
  userSubscriptions: any;
  subscriptionsLoading: boolean;
  onTabChange: (tab: string) => void;
  onDownloadExtension: () => void;
}

export function OverviewTab({
  userData,
  userTier,
  userSubscriptions,
  subscriptionsLoading,
  onTabChange,
  onDownloadExtension,
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <QuickActionCard
          icon={<Chrome className="w-5 h-5 text-purple-400" />}
          title="Chrome Extension"
          description="Download and install the DrawDay Spinner"
          action={
            <Button
              onClick={onDownloadExtension}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Download className="mr-2 w-4 h-4" />
              Download Extension
            </Button>
          }
          footer="Version 1.2.0"
        />

        <QuickActionCard
          icon={<Activity className="w-5 h-5 text-blue-400" />}
          title="Recent Activity"
          description={`Your last draw was ${userData.usage.lastDraw}`}
          content={
            <div className="space-y-2">
              <StatRow label="Total Draws" value={userData.usage.draws.toString()} />
              <StatRow label="Participants" value={userData.usage.participants.toLocaleString()} />
            </div>
          }
        />

        <QuickActionCard
          icon={<CreditCard className="w-5 h-5 text-green-400" />}
          title="Current Plan"
          description={userData.plan}
          action={
            <Button
              variant="outline"
              className="w-full border-gray-700"
              onClick={() => onTabChange('subscription')}
            >
              Manage Subscription
            </Button>
          }
          footer={`Next billing: ${userData.trialEndsAt}`}
        />
      </div>

      {/* Active Subscriptions */}
      <ActiveSubscriptionsCard subscriptions={userSubscriptions} loading={subscriptionsLoading} />
    </div>
  );
}

// Sub-components for better organization
function QuickActionCard({ icon, title, description, action, content, footer }: any) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {content}
        {action}
        {footer && <p className="text-xs text-gray-500 mt-2 text-center">{footer}</p>}
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function ActiveSubscriptionsCard({ subscriptions, loading }: any) {
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

function SubscriptionsList({ subscriptions }: any) {
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

function SubscriptionCategory({ title, subscriptions, color }: any) {
  return (
    <div>
      <h4 className={`text-sm font-semibold text-${color}-400 mb-2`}>{title}</h4>
      {subscriptions.map((sub: any) => (
        <div
          key={sub.id}
          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg mb-2"
        >
          <div>
            <p className="font-medium">{sub.product?.tier?.key || 'Subscription'}</p>
            <p className="text-sm text-gray-400">
              Status: {sub.status === 'active' ? 'Active' : sub.status}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sub.status === 'active' || sub.status === 'trialing' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
