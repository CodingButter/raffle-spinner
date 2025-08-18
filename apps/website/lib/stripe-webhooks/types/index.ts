/**
 * Stripe Webhook Types
 * Type definitions for webhook handling, idempotency, and error management
 */

import type Stripe from 'stripe';

// Webhook Event Processing Status
export interface WebhookEventLog {
  id: string;
  event_id: string;
  event_type: string;
  status: 'processing' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
  error_message?: string;
  event_data?: Record<string, any>;
}

// Subscription Management Types
export interface SubscriptionUpdateData {
  user_email: string;
  subscription: Stripe.Subscription;
  tier: string;
  change_type?: string;
  is_retry?: boolean;
}

// Payment Processing Types
export interface PaymentEventData {
  invoice: Stripe.Invoice;
  customer_email?: string;
  subscription_id?: string;
  is_retry?: boolean;
}

// Error Handling Types
export interface WebhookError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
}

// Retry Configuration
export interface RetryConfig {
  max_attempts: number;
  initial_delay_ms: number;
  backoff_multiplier: number;
  max_delay_ms: number;
}

// Audit Logging Types
export interface AuditLogEntry {
  user_email: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  webhook_event_id?: string;
}

// Notification Types
export interface NotificationData {
  user_email: string;
  type: 'plan_change' | 'payment_failed' | 'subscription_cancelled';
  tier?: string;
  change_type?: string;
  webhook_event_id?: string;
}

// Webhook Processing Result
export interface WebhookProcessingResult {
  success: boolean;
  event_id: string;
  processed_at: string;
  error?: WebhookError;
  retry_scheduled?: boolean;
}
