'use client';

import { useSubscription } from '../hooks/use-subscription';

interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredTier?: 'starter' | 'professional' | 'enterprise';
  requiredFeature?: string;
  fallback?: React.ReactNode;
}

/**
 * Component to gate content based on subscription
 */
export function SubscriptionGate({
  children,
  requiredTier,
  requiredFeature,
  fallback = <div>Upgrade your subscription to access this feature</div>,
}: SubscriptionGateProps) {
  const { isStarter, isProfessional, isEnterprise, canAccessFeature } = useSubscription();

  // Check tier requirement
  if (requiredTier === 'enterprise' && !isEnterprise) {
    return <>{fallback}</>;
  }

  if (requiredTier === 'professional' && !isProfessional && !isEnterprise) {
    return <>{fallback}</>;
  }

  if (requiredTier === 'starter' && !isStarter && !isProfessional && !isEnterprise) {
    return <>{fallback}</>;
  }

  // Check feature requirement
  if (requiredFeature && !canAccessFeature(requiredFeature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
