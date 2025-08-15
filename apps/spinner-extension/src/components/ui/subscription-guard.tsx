/**
 * Subscription Guard Component
 * 
 * Wraps features that require subscription limits and shows upgrade prompts
 */

import { ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { getUpgradeReasons } from '@raffle-spinner/subscription';

interface SubscriptionGuardProps {
  feature: 'contestants' | 'raffles' | 'api' | 'branding' | 'customization';
  currentUsage?: number;
  children: ReactNode;
  fallback?: ReactNode;
  onUpgradeClick?: () => void;
}

export function SubscriptionGuard({ 
  feature, 
  currentUsage = 0,
  children, 
  fallback,
  onUpgradeClick 
}: SubscriptionGuardProps) {
  const { 
    subscription,
    canAddContestants,
    canConductRaffle,
    hasApiSupport,
    hasBranding,
    hasCustomization
  } = useSubscription();

  if (!subscription || !subscription.isActive) {
    return (
      <SubscriptionRequiredFallback 
        title="Subscription Required"
        description="This feature requires an active subscription."
        onUpgradeClick={onUpgradeClick}
        fallback={fallback}
      />
    );
  }

  // Check feature-specific access
  let hasAccess = true;
  let limitMessage = '';

  switch (feature) {
    case 'contestants':
      hasAccess = canAddContestants(currentUsage, 1);
      if (!hasAccess) {
        limitMessage = `You've reached your contestant limit of ${subscription.limits.maxContestants}. Upgrade to Pro for unlimited contestants.`;
      }
      break;
      
    case 'raffles':
      hasAccess = canConductRaffle();
      if (!hasAccess) {
        limitMessage = `You've reached your raffle limit of ${subscription.limits.maxRaffles}. Upgrade to Pro for unlimited raffles.`;
      }
      break;
      
    case 'api':
      hasAccess = hasApiSupport();
      if (!hasAccess) {
        limitMessage = 'API support is only available with Pro subscription.';
      }
      break;
      
    case 'branding':
      hasAccess = hasBranding();
      if (!hasAccess) {
        limitMessage = 'Custom branding is only available with Pro subscription.';
      }
      break;
      
    case 'customization':
      hasAccess = hasCustomization();
      if (!hasAccess) {
        limitMessage = 'Advanced customization is only available with Pro subscription.';
      }
      break;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <SubscriptionRequiredFallback
      title="Upgrade Required"
      description={limitMessage}
      onUpgradeClick={onUpgradeClick}
      fallback={fallback}
    />
  );
}

interface SubscriptionRequiredFallbackProps {
  title: string;
  description: string;
  onUpgradeClick?: () => void;
  fallback?: ReactNode;
}

function SubscriptionRequiredFallback({ 
  title, 
  description, 
  onUpgradeClick,
  fallback 
}: SubscriptionRequiredFallbackProps) {
  if (fallback) {
    return <>{fallback}</>;
  }

  const upgradeReasons = getUpgradeReasons();

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-amber-800">
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-amber-700">
          {description}
        </CardDescription>
      </CardHeader>
      
      {onUpgradeClick && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-amber-800 mb-2">
                Pro features include:
              </p>
              <ul className="space-y-1">
                {upgradeReasons.map((reason, index) => (
                  <li key={index} className="text-xs text-amber-700 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-amber-600" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              onClick={onUpgradeClick}
              size="sm" 
              className="w-full text-xs"
            >
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Convenience components for specific features
export function ContestantGuard({ 
  currentCount, 
  children, 
  onUpgradeClick 
}: { 
  currentCount: number; 
  children: ReactNode; 
  onUpgradeClick?: () => void;
}) {
  return (
    <SubscriptionGuard 
      feature="contestants" 
      currentUsage={currentCount}
      onUpgradeClick={onUpgradeClick}
    >
      {children}
    </SubscriptionGuard>
  );
}

export function RaffleGuard({ 
  children, 
  onUpgradeClick 
}: { 
  children: ReactNode; 
  onUpgradeClick?: () => void;
}) {
  return (
    <SubscriptionGuard 
      feature="raffles"
      onUpgradeClick={onUpgradeClick}
    >
      {children}
    </SubscriptionGuard>
  );
}

export function ApiGuard({ 
  children, 
  onUpgradeClick 
}: { 
  children: ReactNode; 
  onUpgradeClick?: () => void;
}) {
  return (
    <SubscriptionGuard 
      feature="api"
      onUpgradeClick={onUpgradeClick}
    >
      {children}
    </SubscriptionGuard>
  );
}