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
function transformSubscription(authSubscription: NonNullable<AuthUser['subscriptions']>[0]): UserSubscription {
  const isPro = authSubscription.tier === 'professional' || authSubscription.tier === 'pro';
  const isBasic = authSubscription.tier === 'basic';

  // Handle tier mapping - authSubscription.tier could be any string from Directus
  const tier = authSubscription.tier === 'professional' 
    ? 'pro' 
    : ['starter', 'basic', 'pro', 'enterprise'].includes(authSubscription.tier)
      ? authSubscription.tier as 'starter' | 'basic' | 'pro' | 'enterprise'
      : 'starter'; // Default to starter for unknown tiers

  return {
    tier,
    isActive: authSubscription.status === 'active',
    expiresAt: authSubscription.expiresAt || undefined,
    limits: {
      maxContestants: isPro ? null : isBasic ? 250 : 100,
      maxRaffles: isPro ? null : isBasic ? 50 : 5,
      hasApiSupport: isPro,
      hasBranding: isPro,
      hasCustomization: isPro || isBasic,
    },
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
