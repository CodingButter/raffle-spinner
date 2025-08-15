'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { Badge } from '@drawday/ui/badge';
import { Alert, AlertDescription } from '@drawday/ui/alert';
import { ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { PricingCard } from '@/components/pricing-card';
import { PlanChangeDialog } from './PlanChangeDialog';
import { ManagementCards } from './ManagementCards';
import { ProductKey } from '@/lib/stripe';
import { validateSubscriptionChange } from '@/lib/subscription-utils';

interface EnhancedSubscriptionCardsProps {
  products: any[];
  user: any;
  onUpgrade: (productKey: string) => Promise<void>;
}

export function EnhancedSubscriptionCards({
  products,
  user,
  onUpgrade,
}: EnhancedSubscriptionCardsProps) {
  const [selectedPlan, setSelectedPlan] = useState<ProductKey | null>(null);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const currentPlan = user?.subscription_tier as ProductKey;
  const hasActiveSubscription = user?.subscription_status === 'active';

  const handlePlanChange = async (newPlan: ProductKey) => {
    if (!hasActiveSubscription || !currentPlan) {
      // For new subscriptions, use the existing upgrade flow
      return onUpgrade(newPlan);
    }

    const validation = validateSubscriptionChange(currentPlan, newPlan, user?.subscription_status);

    if (!validation.isValid) {
      alert(validation.reason);
      return;
    }

    setSelectedPlan(newPlan);
    setShowChangeDialog(true);
  };

  const handleConfirmPlanChange = async (upgradeType: 'immediate' | 'end_of_period') => {
    if (!selectedPlan || !user?.stripe_subscription_id) return;

    setIsChangingPlan(true);
    try {
      const response = await fetch('/api/subscription/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: user.stripe_subscription_id,
          newProductKey: selectedPlan,
          upgradeType,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'Plan changed successfully!');
        setShowChangeDialog(false);
        setSelectedPlan(null);
        // Refresh the page to update subscription data
        window.location.reload();
      } else {
        alert(result.error || 'Failed to change plan');
      }
    } catch (error) {
      console.error('Plan change error:', error);
      alert('An error occurred while changing your plan. Please try again.');
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleManageSubscription = async () => {
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

  return (
    <>
      <div className="space-y-8">
        {/* Current Subscription Status */}
        {hasActiveSubscription && (
          <SubscriptionStatusCard
            user={user}
            currentPlan={currentPlan}
            onManage={handleManageSubscription}
          />
        )}

        {/* Plans Selection */}
        <PlansCard
          products={products}
          currentPlan={currentPlan}
          hasActiveSubscription={hasActiveSubscription}
          onPlanChange={handlePlanChange}
          onManage={handleManageSubscription}
        />

        {/* Additional Management Cards */}
        <ManagementCards user={user} onManage={handleManageSubscription} />
      </div>

      {/* Plan Change Dialog */}
      {selectedPlan && currentPlan && (
        <PlanChangeDialog
          open={showChangeDialog}
          onOpenChange={setShowChangeDialog}
          currentPlan={currentPlan}
          newPlan={selectedPlan}
          subscriptionId={user?.stripe_subscription_id}
          currentPeriodEnd={
            user?.subscription_current_period_end
              ? new Date(user.subscription_current_period_end).getTime() / 1000
              : Date.now() / 1000 + 30 * 24 * 60 * 60 // Default to 30 days if not available
          }
          onConfirm={handleConfirmPlanChange}
          isLoading={isChangingPlan}
        />
      )}
    </>
  );
}

// Sub-components for better organization
function SubscriptionStatusCard({ user, currentPlan, onManage }: any) {
  const planName = currentPlan
    ? currentPlan === 'professional'
      ? 'Professional'
      : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)
    : 'Unknown';

  return (
    <Alert>
      <Settings className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-medium">Current Plan: </span>
          <Badge variant="secondary" className="ml-1">
            {planName}
          </Badge>
          {user?.subscription_cancel_at_period_end && (
            <Badge variant="destructive" className="ml-2">
              Canceling
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onManage}>
          Manage
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function PlansCard({ products, currentPlan, hasActiveSubscription, onPlanChange, onManage }: any) {
  const categoryInfo = products[0]?.category;

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle>{categoryInfo?.name || 'Subscription'} Plans</CardTitle>
        <CardDescription>
          {hasActiveSubscription
            ? 'Change your plan or manage your subscription'
            : 'Choose the perfect plan for your needs'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((plan: any) => {
            const isCurrent = plan.tier?.key === currentPlan;
            const planValidation = currentPlan
              ? validateSubscriptionChange(currentPlan, plan.tier?.key)
              : { isValid: true, changeType: 'upgrade' as const };

            return (
              <PlanCard
                key={plan.key}
                plan={plan}
                isCurrent={isCurrent}
                validation={planValidation}
                hasActiveSubscription={hasActiveSubscription}
                onPlanChange={onPlanChange}
                onManage={onManage}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PlanCard({
  plan,
  isCurrent,
  validation,
  hasActiveSubscription,
  onPlanChange,
  onManage,
}: any) {
  const getButtonProps = () => {
    if (isCurrent) {
      return {
        text: hasActiveSubscription ? 'Manage' : 'Current Plan',
        variant: 'outline' as const,
        onClick: hasActiveSubscription ? onManage : undefined,
        icon: hasActiveSubscription ? <Settings className="w-4 h-4" /> : null,
      };
    }

    if (validation.changeType === 'upgrade') {
      return {
        text: plan.tier?.key === 'enterprise' ? 'Contact Sales' : 'Upgrade',
        variant: 'default' as const,
        onClick: () => onPlanChange(plan.tier?.key),
        icon: <ArrowUp className="w-4 h-4" />,
      };
    }

    return {
      text: 'Downgrade',
      variant: 'outline' as const,
      onClick: () => onPlanChange(plan.tier?.key),
      icon: <ArrowDown className="w-4 h-4" />,
    };
  };

  const buttonProps = getButtonProps();

  return (
    <PricingCard
      plan={{
        ...plan,
        cta: buttonProps.text,
      }}
      onUpgrade={buttonProps.onClick}
      onManage={undefined}
      customButton={
        <Button
          variant={buttonProps.variant}
          className="w-full"
          onClick={buttonProps.onClick}
          disabled={!buttonProps.onClick}
        >
          {buttonProps.icon}
          {buttonProps.text}
        </Button>
      }
    />
  );
}
