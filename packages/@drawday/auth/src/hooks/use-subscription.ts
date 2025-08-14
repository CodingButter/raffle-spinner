'use client';

import { useAuth } from './use-auth';
import { Subscription } from '../types';

/**
 * Hook to get the current user's subscription
 */
export function useSubscription(): {
  subscription: Subscription | null;
  isStarter: boolean;
  isProfessional: boolean;
  isEnterprise: boolean;
  isTrial: boolean;
  canAccessFeature: (feature: string) => boolean;
} {
  const { subscription } = useAuth();

  const isStarter = subscription?.tier === 'starter' && subscription?.status === 'active';
  const isProfessional = subscription?.tier === 'professional' && subscription?.status === 'active';
  const isEnterprise = subscription?.tier === 'enterprise' && subscription?.status === 'active';
  const isTrial = subscription?.status === 'trialing';

  const canAccessFeature = (feature: string): boolean => {
    // Define feature access based on subscription tier
    const freeFeatures = ['basic-spinner', 'csv-import', 'basic-themes'];
    const starterFeatures = [...freeFeatures, '5000-participants', 'session-management'];
    const professionalFeatures = [
      ...starterFeatures,
      'advanced-themes',
      'api-access',
      'priority-support',
      'unlimited-participants',
    ];
    const enterpriseFeatures = [
      ...professionalFeatures,
      'custom-branding',
      'white-label',
      'dedicated-support',
      'custom-features',
    ];

    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
      return freeFeatures.includes(feature);
    }

    switch (subscription.tier) {
      case 'enterprise':
        return enterpriseFeatures.includes(feature);
      case 'professional':
        return professionalFeatures.includes(feature);
      case 'starter':
        return starterFeatures.includes(feature);
      default:
        return freeFeatures.includes(feature);
    }
  };

  return {
    subscription,
    isStarter,
    isProfessional,
    isEnterprise,
    isTrial,
    canAccessFeature,
  };
}
