/**
 * Tier Resolution Service
 * Maps Stripe price IDs to subscription tiers
 */

import { PRODUCTS } from '@/lib/stripe';

/**
 * Determines subscription tier from Stripe price ID
 * @param priceId - Stripe price ID from subscription item
 * @returns Tier key (starter, pro, enterprise)
 */
export function getTierFromPriceId(priceId: string): string {
  const productEntries = Object.entries(PRODUCTS);
  
  for (const [key, product] of productEntries) {
    if (product.priceId === priceId) {
      // Map Stripe product keys to our subscription tier keys
      if (key === 'professional') return 'pro';
      return key; // 'starter', 'enterprise'
    }
  }
  
  return 'starter'; // Default to starter instead of free
}

/**
 * Validates that a tier key is valid
 * @param tier - Tier key to validate
 * @returns boolean indicating if tier is valid
 */
export function isValidTier(tier: string): boolean {
  const validTiers = ['starter', 'pro', 'enterprise'];
  return validTiers.includes(tier);
}