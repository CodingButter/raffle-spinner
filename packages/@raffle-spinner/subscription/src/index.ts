/**
 * Subscription Service
 *
 * Manages subscription tiers, limits, and feature access for the raffle spinner
 */

import { SubscriptionTier, SubscriptionLimits, UserSubscription } from '@drawday/types';

// Subscription tier configurations
export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionLimits> = {
  starter: {
    maxContestants: 1000,
    maxRaffles: 5,
    hasApiSupport: false,
    hasBranding: false,
    hasCustomization: false,
  },
  pro: {
    maxContestants: null, // unlimited
    maxRaffles: null, // unlimited
    hasApiSupport: true,
    hasBranding: true,
    hasCustomization: true,
  },
};

/**
 * Get subscription limits for a given tier
 */
export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  return SUBSCRIPTION_TIERS[tier];
}

/**
 * Check if a user can add more contestants
 */
export function canAddContestants(
  subscription: UserSubscription,
  currentCount: number,
  adding: number = 1
): boolean {
  if (!subscription.isActive) return false;

  const { maxContestants } = subscription.limits;
  if (maxContestants === null) return true; // unlimited

  return currentCount + adding <= maxContestants;
}

/**
 * Check if a user can conduct more raffles
 */
export function canConductRaffle(
  subscription: UserSubscription,
  currentRaffleCount: number
): boolean {
  if (!subscription.isActive) return false;

  const { maxRaffles } = subscription.limits;
  if (maxRaffles === null) return true; // unlimited

  return currentRaffleCount < maxRaffles;
}

/**
 * Check if a feature is available for the subscription
 */
export function hasFeature(
  subscription: UserSubscription,
  feature: keyof SubscriptionLimits
): boolean {
  if (!subscription.isActive) return false;

  const featureValue = subscription.limits[feature];
  return typeof featureValue === 'boolean' ? featureValue : true;
}

/**
 * Get remaining quota for a subscription limit
 */
export function getRemainingQuota(
  subscription: UserSubscription,
  limitType: 'contestants' | 'raffles',
  currentUsage: number
): number | null {
  if (!subscription.isActive) return 0;

  const maxValue =
    limitType === 'contestants'
      ? subscription.limits.maxContestants
      : subscription.limits.maxRaffles;

  if (maxValue === null) return null; // unlimited

  return Math.max(0, maxValue - currentUsage);
}

/**
 * Create a default starter subscription
 */
export function createStarterSubscription(): UserSubscription {
  return {
    tier: 'starter',
    isActive: true,
    limits: getSubscriptionLimits('starter'),
  };
}

/**
 * Create a pro subscription
 */
export function createProSubscription(expiresAt?: string): UserSubscription {
  return {
    tier: 'pro',
    isActive: true,
    expiresAt,
    limits: getSubscriptionLimits('pro'),
  };
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(subscription: UserSubscription): boolean {
  if (!subscription.expiresAt) return false;

  const expirationDate = new Date(subscription.expiresAt);
  const now = new Date();

  return now > expirationDate;
}

/**
 * Update subscription active status based on expiration
 */
export function updateSubscriptionStatus(subscription: UserSubscription): UserSubscription {
  const isExpired = isSubscriptionExpired(subscription);

  return {
    ...subscription,
    isActive: !isExpired,
  };
}

/**
 * Get subscription status message
 */
export function getSubscriptionStatusMessage(subscription: UserSubscription): string {
  if (!subscription.isActive) {
    return isSubscriptionExpired(subscription)
      ? 'Your subscription has expired'
      : 'Your subscription is inactive';
  }

  if (subscription.tier === 'starter') {
    return 'Starter Plan - Upgrade to Pro for unlimited features';
  }

  return subscription.expiresAt
    ? `Pro Plan - Expires ${new Date(subscription.expiresAt).toLocaleDateString()}`
    : 'Pro Plan - Active';
}

/**
 * Get upgrade reasons for starter users
 */
export function getUpgradeReasons(): string[] {
  return [
    'Unlimited contestants per competition',
    'Unlimited raffles',
    'API support for data integration',
    'Priority customer support',
  ];
}
