/**
 * Stripe Webhooks - Main Export
 * Refactored webhook system with idempotency, error handling, and modular architecture
 *
 * CRITICAL FIXES IMPLEMENTED:
 * ✅ Idempotency - Prevents duplicate webhook processing (P1 fix from Memento)
 * ✅ Error Handling - Comprehensive retry logic with exponential backoff
 * ✅ Modular Design - 388 lines reduced to focused modules under 200 lines
 * ✅ Circuit Breaker - Prevents cascading failures
 * ✅ Audit Logging - Complete trail for compliance and debugging
 * ✅ Type Safety - Full TypeScript coverage with strict types
 */

// Main processor with idempotency
export { processWebhookEvent, webhookHealthCheck } from './webhook-processor';

// Individual handlers (for backward compatibility and testing)
export {
  handleCheckoutCompleted,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
  getTierFromPriceId,
} from './handlers/subscription';

export { handlePaymentSucceeded, handlePaymentFailed } from './handlers/payment';

// Services
export {
  isEventProcessed,
  markEventProcessing,
  markEventCompleted,
  markEventFailed,
  cleanupOldEvents,
} from './services/idempotency';

export {
  executeWithRetry,
  withErrorHandling,
  classifyError,
  directusCircuitBreaker,
} from './services/error-handling';

export {
  createAuditLog,
  logPlanChange,
  logPaymentEvent,
  logSubscriptionEvent,
  queryAuditLogs,
} from './services/audit';

export {
  sendPlanChangeNotification,
  sendPaymentFailureNotification,
  sendSubscriptionCancelledNotification,
  sendInternalAlert,
} from './services/notifications';

// Types
export type {
  WebhookEventLog,
  SubscriptionUpdateData,
  PaymentEventData,
  WebhookError,
  RetryConfig,
  AuditLogEntry,
  NotificationData,
  WebhookProcessingResult,
} from './types';

// Note: Individual handlers are already exported above for backward compatibility
