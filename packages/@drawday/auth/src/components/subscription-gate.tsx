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

  // Helper function to check tier access
  const hasTierAccess = () => {
    if (!requiredTier) return true;

    const tierMap = {
      enterprise: isEnterprise,
      professional: isProfessional || isEnterprise,
      starter: isStarter || isProfessional || isEnterprise,
    };

    return tierMap[requiredTier] || false;
  };

  // Check both tier and feature requirements
  const hasAccess = hasTierAccess() && (!requiredFeature || canAccessFeature(requiredFeature));

  return <>{hasAccess ? children : fallback}</>;
}
