/**
 * Main Webhook Processor
 * Orchestrates webhook processing with idempotency, error handling, and monitoring
 */

import type Stripe from 'stripe';
import { WebhookProcessingResult, WebhookError } from './types';
import {
  isEventProcessed,
  markEventProcessing,
  markEventCompleted,
  markEventFailed,
} from './services/idempotency';
import { classifyError } from './services/error-handling';
import { createAuditLog, logWebhookError } from './services/audit';
import { sendInternalAlert } from './services/notifications';
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
} from './handlers/subscription';
import { handlePaymentSucceeded, handlePaymentFailed } from './handlers/payment';

/**
 * Process webhook event with comprehensive idempotency and error handling
 * This is the main entry point that ensures bulletproof webhook processing
 */
export async function processWebhookEvent(event: Stripe.Event): Promise<WebhookProcessingResult> {
  const eventId = event.id;
  const eventType = event.type;
  const startTime = new Date().toISOString();

  console.log(`🔄 Processing webhook: ${eventType} (${eventId})`);

  try {
    // CRITICAL: Check if event already processed (idempotency)
    const alreadyProcessed = await isEventProcessed(eventId);
    if (alreadyProcessed) {
      console.log(`✅ Event ${eventId} already processed - skipping (idempotency)`);
      return {
        success: true,
        event_id: eventId,
        processed_at: startTime,
      };
    }

    // Mark event as being processed to prevent concurrent processing
    await markEventProcessing(eventId, eventType, event.data);

    // Process the webhook event based on type
    await processEventByType(event);

    // Mark event as successfully completed
    await markEventCompleted(eventId);

    // Log successful processing
    console.log(`✅ Webhook processed successfully: ${eventType} (${eventId})`);

    return {
      success: true,
      event_id: eventId,
      processed_at: new Date().toISOString(),
    };
  } catch (error) {
    const webhookError = classifyError(error as Error);

    console.error(`❌ Webhook processing failed: ${eventType} (${eventId})`, {
      error: webhookError,
      duration: Date.now() - new Date(startTime).getTime(),
    });

    // Mark event as failed and determine retry
    const shouldRetry = webhookError.retryable;
    await markEventFailed(eventId, webhookError, shouldRetry);

    // Log error for audit and debugging
    await logWebhookError(eventType, eventId, webhookError);

    // Send internal alert for critical errors
    if (!webhookError.retryable) {
      await sendInternalAlert(
        `Critical webhook error: ${eventType}`,
        `Non-retryable error in ${eventType} webhook: ${webhookError.message}`,
        'critical'
      );
    }

    return {
      success: false,
      event_id: eventId,
      processed_at: new Date().toISOString(),
      error: webhookError,
      retry_scheduled: shouldRetry,
    };
  }
}

/**
 * Route webhook event to appropriate handler based on event type
 */
async function processEventByType(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSucceeded(invoice);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }

    default: {
      console.log(`ℹ️ Unhandled webhook event type: ${event.type}`);
      // Log unhandled events for potential future implementation
      await createAuditLog({
        user_email: 'system',
        action: 'webhook_unhandled',
        details: {
          event_type: event.type,
          event_id: event.id,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        webhook_event_id: event.id,
      });
      break;
    }
  }
}

/**
 * Health check for webhook processing system
 * Verifies all dependencies are working
 */
export async function webhookHealthCheck(): Promise<{
  healthy: boolean;
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks = {
    directus_connection: false,
    stripe_connection: false,
    idempotency_service: false,
  };

  try {
    // Test Directus connection
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    const directusResponse = await fetch(`${directusUrl}/server/ping`, {
      timeout: 5000,
    } as RequestInit);
    checks.directus_connection = directusResponse.ok;
  } catch (error) {
    console.error('Directus health check failed:', error);
  }

  try {
    // Test idempotency service
    checks.idempotency_service = await isEventProcessed('health_check_test');
  } catch (error) {
    console.error('Idempotency service health check failed:', error);
  }

  // TODO: Add Stripe connection health check
  checks.stripe_connection = true; // Assume healthy for now

  const healthy = Object.values(checks).every((check) => check);

  return {
    healthy,
    checks,
    timestamp: new Date().toISOString(),
  };
}
