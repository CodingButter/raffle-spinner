/**
 * Subscription Sync Service
 *
 * Syncs subscription data from auth context to Chrome storage
 */

import { storage } from '@raffle-spinner/storage';
import { authService } from '@drawday/auth';
import { UserSubscription } from '@drawday/types';

interface AuthUser {
  subscriptions?: Array<{
    tier: string;
    status: string;
    expiresAt?: string;
  }>;
}

/**
 * Transform auth subscription to UserSubscription format
 */
// Helper to determine tier type
function getSubscriptionTier(tierName: string): 'starter' | 'pro' {
  const proTiers = ['professional', 'pro', 'enterprise'];
  return proTiers.includes(tierName) ? 'pro' : 'starter';
}

// Helper to get limits based on tier
function getSubscriptionLimits(tierName: string) {
  const isPro = tierName === 'professional' || tierName === 'pro';
  const isBasic = tierName === 'basic';

  return {
    maxContestants: isPro ? null : isBasic ? 250 : 100,
    maxRaffles: isPro ? null : isBasic ? 50 : 5,
    hasApiSupport: isPro,
    hasBranding: isPro,
    hasCustomization: isPro || isBasic,
  };
}

function transformSubscription(
  authSubscription: NonNullable<AuthUser['subscriptions']>[0]
): UserSubscription {
  return {
    tier: getSubscriptionTier(authSubscription.tier),
    isActive: authSubscription.status === 'active',
    expiresAt: authSubscription.expiresAt || undefined,
    limits: getSubscriptionLimits(authSubscription.tier),
  };
}

/**
 * Sync subscription data from auth to Chrome storage
 */
export async function syncSubscriptionFromAuth() {
  try {
    const tokens = authService.getStoredTokens();
    if (!tokens) return;

    const user = await authService.getCurrentUser(tokens.access_token);
    const authSubscription = (user as AuthUser).subscriptions?.[0];

    if (authSubscription) {
      const subscription = transformSubscription(authSubscription);
      await storage.saveSubscription(subscription);
      window.dispatchEvent(new CustomEvent('auth-changed'));
    }
  } catch (error) {
    console.error('Failed to sync subscription:', error);
  }
}

/**
 * Clear subscription from storage (for logout)
 */
export async function clearSubscriptionFromStorage() {
  try {
    // Reset to starter subscription
    const starterSubscription: UserSubscription = {
      tier: 'starter',
      isActive: true,
      expiresAt: undefined,
      limits: {
        maxContestants: 100,
        maxRaffles: 5,
        hasApiSupport: false,
        hasBranding: false,
        hasCustomization: false,
      },
    };

    await storage.saveSubscription(starterSubscription);

    // Reset raffle count
    await storage.resetRaffleCount();

    // Dispatch event to notify SubscriptionContext
    window.dispatchEvent(new CustomEvent('auth-changed'));
  } catch (error) {
    console.error('Failed to clear subscription:', error);
  }
}
