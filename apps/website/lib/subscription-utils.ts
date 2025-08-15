import { PRODUCTS, ProductKey } from './stripe';

// Define plan hierarchy for validation
export const PLAN_HIERARCHY = {
  starter: 1,
  professional: 2,
  enterprise: 3,
} as const;

export type SubscriptionChangeType = 'upgrade' | 'downgrade' | 'same';

export interface SubscriptionValidation {
  isValid: boolean;
  changeType: SubscriptionChangeType;
  reason?: string;
  restrictions?: string[];
}

export interface ProrationEstimate {
  amount: number;
  currency: string;
  description: string;
  daysRemaining: number;
}

/**
 * Validates if a subscription plan change is allowed
 */
export function validateSubscriptionChange(
  currentPlan: ProductKey,
  newPlan: ProductKey,
  subscriptionStatus?: string
): SubscriptionValidation {
  // Check if subscription is in a valid state for changes
  if (subscriptionStatus && !['active', 'trialing'].includes(subscriptionStatus)) {
    return {
      isValid: false,
      changeType: 'same',
      reason: 'Subscription must be active or in trial to make changes',
    };
  }

  // Check if it's the same plan
  if (currentPlan === newPlan) {
    return {
      isValid: false,
      changeType: 'same',
      reason: 'You are already subscribed to this plan',
    };
  }

  const currentLevel = PLAN_HIERARCHY[currentPlan];
  const newLevel = PLAN_HIERARCHY[newPlan];

  if (!currentLevel || !newLevel) {
    return {
      isValid: false,
      changeType: 'same',
      reason: 'Invalid plan configuration',
    };
  }

  const changeType: SubscriptionChangeType = newLevel > currentLevel ? 'upgrade' : 'downgrade';

  // All plan changes are generally allowed, but we can add specific restrictions here
  const restrictions: string[] = [];

  // Example: Enterprise might have special requirements
  if (newPlan === 'enterprise') {
    restrictions.push('Enterprise plans may require additional verification');
  }

  return {
    isValid: true,
    changeType,
    restrictions: restrictions.length > 0 ? restrictions : undefined,
  };
}

/**
 * Estimates proration amount for immediate plan changes
 */
export function estimateProration(
  currentPlan: ProductKey,
  newPlan: ProductKey,
  daysRemainingInPeriod: number
): ProrationEstimate | null {
  if (currentPlan === newPlan) return null;

  const currentPrice = PRODUCTS[currentPlan].price;
  const newPrice = PRODUCTS[newPlan].price;
  const priceDifference = newPrice - currentPrice;

  if (priceDifference === 0) return null;

  // Calculate daily rate difference
  const dailyDifference = priceDifference / 30; // Assuming monthly billing
  const prorationAmount = Math.round(dailyDifference * daysRemainingInPeriod * 100); // Convert to cents

  return {
    amount: prorationAmount,
    currency: 'gbp',
    description:
      priceDifference > 0
        ? `Prorated charge for ${daysRemainingInPeriod} days at higher tier`
        : `Prorated credit for ${daysRemainingInPeriod} days`,
    daysRemaining: daysRemainingInPeriod,
  };
}

/**
 * Determines the recommended upgrade type based on plan change
 */
export function getRecommendedUpgradeType(
  currentPlan: ProductKey,
  newPlan: ProductKey,
  daysRemainingInPeriod: number
): 'immediate' | 'end_of_period' {
  const validation = validateSubscriptionChange(currentPlan, newPlan);

  if (validation.changeType === 'upgrade') {
    // For upgrades, recommend immediate if there are many days left
    return daysRemainingInPeriod > 7 ? 'immediate' : 'end_of_period';
  } else {
    // For downgrades, recommend end of period to avoid prorated charges
    return 'end_of_period';
  }
}

/**
 * Formats a plan change message for the user
 */
export function formatPlanChangeMessage(
  validation: SubscriptionValidation,
  currentPlan: ProductKey,
  newPlan: ProductKey,
  upgradeType: 'immediate' | 'end_of_period'
): string {
  if (!validation.isValid) {
    return validation.reason || 'Plan change not allowed';
  }

  const currentPlanName = PRODUCTS[currentPlan].name;
  const newPlanName = PRODUCTS[newPlan].name;

  if (validation.changeType === 'upgrade') {
    if (upgradeType === 'immediate') {
      return `Upgrade from ${currentPlanName} to ${newPlanName} will take effect immediately. You'll be charged a prorated amount for the remaining billing period.`;
    } else {
      return `Upgrade from ${currentPlanName} to ${newPlanName} will take effect at the start of your next billing period.`;
    }
  } else {
    if (upgradeType === 'immediate') {
      return `Downgrade from ${currentPlanName} to ${newPlanName} will take effect immediately. You'll receive a prorated credit.`;
    } else {
      return `Downgrade from ${currentPlanName} to ${newPlanName} will take effect at the end of your current billing period. You'll continue to have access to ${currentPlanName} features until then.`;
    }
  }
}

/**
 * Gets the display name for upgrade type
 */
export function getUpgradeTypeDisplayName(upgradeType: 'immediate' | 'end_of_period'): string {
  return upgradeType === 'immediate' ? 'Apply Now' : 'Apply at Period End';
}
