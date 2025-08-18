'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { CreditCard } from 'lucide-react';
import { PricingCard } from '@/components/pricing-card';
import { ActiveSubscriptions } from './ActiveSubscriptions';

interface SubscriptionCardsProps {
  products: any[];
  user: any;
  onUpgrade: (productKey: string) => Promise<void>;
}

export function SubscriptionCards({ products, user, onUpgrade }: SubscriptionCardsProps) {
  const handleManagePlan = async () => {
    if (!user?.stripe_customer_id) {
      alert('No active subscription found. Please upgrade to a paid plan first.');
      return;
    }

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.stripe_customer_id,
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Unable to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Extract category info from the first product (all products should be in same category)
  const categoryInfo = products[0]?.category;

  return (
    <div className="space-y-8">
      {/* Plans Card */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle>{categoryInfo?.name} Plans</CardTitle>
          <CardDescription>
            {categoryInfo?.description || 'Choose the perfect plan for your needs'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((plan: any) => (
              <PricingCard
                key={plan.key}
                plan={{
                  ...plan,
                  cta: plan.current
                    ? user?.stripe_customer_id
                      ? 'Manage/Cancel'
                      : 'Current Plan'
                    : plan.tier?.key === 'enterprise'
                      ? 'Contact Sales'
                      : 'Upgrade',
                }}
                onUpgrade={onUpgrade}
                onManage={handleManagePlan}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      {user?.stripe_customer_id && <BillingInfoBanner />}

      {/* Active Subscriptions */}
      <ActiveSubscriptions subscriptions={user?.subscriptions || []} onManage={handleManagePlan} />

      {/* Payment & Billing */}
      <PaymentBillingCard user={user} onManage={handleManagePlan} />

      {/* Billing History */}
      <BillingHistoryCard user={user} onManage={handleManagePlan} />
    </div>
  );
}

// Sub-components (keeping them under 50 lines each)
function BillingInfoBanner() {
  return (
    <Card className="bg-blue-900/20 border-blue-500/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <InfoIcon />
          <div className="flex-1 text-sm">
            <p className="text-blue-300 font-medium mb-1">Managing Your Subscription</p>
            <p className="text-gray-400">
              Click "Manage/Cancel" on your current subscription to change plans, update payment
              methods, view invoices, or cancel your subscription. You'll be redirected to Stripe's
              secure customer portal where you can manage all aspects of your subscription.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentBillingCard({ user, onManage }: any) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle>Payment & Billing</CardTitle>
        <CardDescription>Manage your payment methods and billing details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium">Billing Portal</p>
                <p className="text-sm text-gray-400">
                  Manage payment methods, download invoices, and update billing info
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-gray-700"
            onClick={onManage}
            disabled={!user?.stripe_customer_id}
          >
            <CreditCard className="mr-2 w-4 h-4" />
            Manage Billing in Stripe
          </Button>
          <p className="text-xs text-gray-500 text-center">
            You'll be redirected to Stripe's secure customer portal
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function BillingHistoryCard({ user, onManage }: any) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View and download your invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="mb-4">Access your complete billing history</p>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700"
            onClick={onManage}
            disabled={!user?.stripe_customer_id}
          >
            View Invoices in Stripe
          </Button>
          <p className="text-xs mt-2">Download invoices and receipts from Stripe's portal</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoIcon() {
  return (
    <div className="w-5 h-5 mt-0.5 text-blue-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
    </div>
  );
}
