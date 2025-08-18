/**
 * Stripe Webhook Event Handlers - Legacy Compatibility File
 * 
 * This file maintains backward compatibility while using the new modular structure.
 * All functionality has been moved to dedicated modules for better maintainability.
 * 
 * File structure after refactoring:
 * - stripe-webhook-handlers/
 *   ├── index.ts                 (main export)
 *   ├── subscription-handlers.ts (subscription events)
 *   ├── payment-handlers.ts      (payment events) 
 *   ├── tier-resolver.ts         (price ID to tier mapping)
 *   ├── directus-integration.ts  (Directus sync operations)
 *   └── audit-service.ts         (logging and notifications)
 */

export {
  // Subscription event handlers
  handleCheckoutCompleted,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
  
  // Payment event handlers  
  handlePaymentSucceeded,
  handlePaymentFailed,
  
  // Utility functions
  getTierFromPriceId,
  isValidTier,
  createOrUpdateSubscriptionInDirectus,
  clearTokenCache,
  logPlanChange,
  sendPlanChangeNotification,
} from './stripe-webhook-handlers';

// Maintain backward compatibility for existing imports
export * from './stripe-webhook-handlers';
