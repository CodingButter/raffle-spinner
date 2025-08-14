'use client';

import { useAuth } from './use-auth';
import { Subscription } from '../types';

/**
 * Hook to get the current user's subscription
 */
export function useSubscription(): {
  subscription: Subscription | null;
  isPro: boolean;
  isEnterprise: boolean;
  isTrial: boolean;
  canAccessFeature: (feature: string) => boolean;
} {
  const { subscription } = useAuth();

  const isPro = subscription?.tier === 'pro' && subscription?.status === 'active';
  const isEnterprise = subscription?.tier === 'enterprise' && subscription?.status === 'active';
  const isTrial = subscription?.status === 'trial';

  const canAccessFeature = (feature: string): boolean => {
    // Define feature access based on subscription tier
    const freeFeatures = ['basic-spinner', 'csv-import', 'basic-themes'];
    const proFeatures = [...freeFeatures, 'advanced-themes', 'api-access', 'priority-support'];
    const enterpriseFeatures = [
      ...proFeatures,
      'custom-branding',
      'white-label',
      'dedicated-support',
    ];

    if (!subscription || subscription.status !== 'active') {
      return freeFeatures.includes(feature);
    }

    switch (subscription.tier) {
      case 'enterprise':
        return enterpriseFeatures.includes(feature);
      case 'pro':
        return proFeatures.includes(feature);
      default:
        return freeFeatures.includes(feature);
    }
  };

  return {
    subscription,
    isPro,
    isEnterprise,
    isTrial,
    canAccessFeature,
  };
}
