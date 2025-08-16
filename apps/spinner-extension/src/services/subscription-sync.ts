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
 * Helper to determine if tier is pro-level
 */
function isProTier(tier: string): boolean {
  return tier === 'professional' || tier === 'pro' || tier === 'enterprise';
}

/**
 * Get subscription limits based on tier
 */
function getSubscriptionLimits(tier: string): UserSubscription['limits'] {
  const isPro = isProTier(tier);
  const isBasic = tier === 'basic';

  return {
    maxContestants: isPro ? null : isBasic ? 250 : 100,
    maxRaffles: isPro ? null : isBasic ? 50 : 5,
    hasApiSupport: isPro,
    hasBranding: isPro || isBasic,
    hasCustomization: isPro || isBasic,
  };
}

/**
 * Transform auth subscription to UserSubscription format
 */
function transformSubscription(
  authSubscription: NonNullable<AuthUser['subscriptions']>[0]
): UserSubscription {
  // Map to our supported tiers: 'starter' | 'pro'
  const tier = isProTier(authSubscription.tier) ? 'pro' : 'starter';

  return {
    tier,
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
