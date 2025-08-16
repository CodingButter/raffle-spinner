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

  // Check feature requirement first (simpler check)
  if (requiredFeature && !canAccessFeature(requiredFeature)) {
    return <>{fallback}</>;
  }

  // Check tier requirement using a map for cleaner logic
  if (requiredTier) {
    const hasRequiredTier = checkTierAccess(requiredTier, {
      isStarter,
      isProfessional,
      isEnterprise,
    });
    if (!hasRequiredTier) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Helper function to check tier access (reduces complexity)
function checkTierAccess(
  requiredTier: 'starter' | 'professional' | 'enterprise',
  tiers: { isStarter: boolean; isProfessional: boolean; isEnterprise: boolean }
): boolean {
  switch (requiredTier) {
    case 'enterprise':
      return tiers.isEnterprise;
    case 'professional':
      return tiers.isProfessional || tiers.isEnterprise;
    case 'starter':
      return tiers.isStarter || tiers.isProfessional || tiers.isEnterprise;
    default:
      return true;
  }
}
