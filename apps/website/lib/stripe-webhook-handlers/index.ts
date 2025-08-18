/**
 * Stripe Webhook Event Handlers - Modular Export
 * 
 * This module exports all webhook handlers from their respective files.
 * Each handler is focused on a specific domain for better maintainability.
 */

// Subscription event handlers
export {
  handleCheckoutCompleted,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
} from './subscription-handlers';

// Payment event handlers
export {
  handlePaymentSucceeded,
  handlePaymentFailed,
} from './payment-handlers';

// Utility services
export { getTierFromPriceId, isValidTier } from './tier-resolver';
export { createOrUpdateSubscriptionInDirectus, clearTokenCache } from './directus-integration';
export { logPlanChange, sendPlanChangeNotification } from './audit-service';

// Re-export for backward compatibility with existing imports
export * from './subscription-handlers';
export * from './payment-handlers';