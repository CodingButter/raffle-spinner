/**
 * Payment Webhook Handlers
 * Handles payment success and failure events with robust error handling
 */

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/directus-admin';
import { PaymentEventData } from '../types';
import { executeWithRetry, withErrorHandling } from '../services/error-handling';
import { getTierFromPriceId } from './subscription';

/**
 * Handle successful payment events
 */
export const handlePaymentSucceeded = withErrorHandling(
  async (invoice: Stripe.Invoice): Promise<void> => {
    console.log('Processing successful payment:', {
      invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      customer: invoice.customer,
    });

    // Log successful payment for audit trail
    if ((invoice as any).subscription && invoice.customer_email) {
      console.log(
        `✅ Payment successful for ${invoice.customer_email}: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`
      );

      // Optional: Store payment record for analytics
      await logSuccessfulPayment({
        invoice,
        customer_email: invoice.customer_email,
        subscription_id: (invoice as any).subscription as string,
      });
    } else {
      console.warn('Invoice missing subscription or customer email:', invoice.id);
    }
  },
  'handlePaymentSucceeded'
);

/**
 * Handle failed payment events
 */
export const handlePaymentFailed = withErrorHandling(
  async (invoice: Stripe.Invoice): Promise<void> => {
    console.log('Processing failed payment:', {
      invoice_id: invoice.id,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      customer: invoice.customer,
    });

    if (!(invoice as any).subscription || !invoice.customer_email) {
      console.warn('Invoice missing subscription or customer email:', invoice.id);
      return;
    }

    const subscriptionId = (invoice as any).subscription as string;

    // Get subscription details to update status
    const subscription = (await executeWithRetry(
      () => stripe.subscriptions.retrieve(subscriptionId),
      { max_attempts: 2 },
      invoice.id
    )) as any; // Type assertion needed due to executeWithRetry return type

    // Update subscription status to past_due
    const directusAdmin = createAdminClient();
    await executeWithRetry(
      () =>
        directusAdmin.updateUserSubscription(invoice.customer_email!, {
          stripe_customer_id: invoice.customer as string,
          stripe_subscription_id: subscription.id,
          subscription_status: 'past_due',
          subscription_tier: getTierFromPriceId(subscription.items.data[0]?.price.id),
          subscription_current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          subscription_cancel_at_period_end: subscription.cancel_at_period_end,
        }),
      { max_attempts: 2 },
      invoice.id
    );

    console.log(`❌ Payment failed for ${invoice.customer_email}, subscription marked as past_due`);

    // Log payment failure for follow-up
    await logFailedPayment({
      invoice,
      customer_email: invoice.customer_email,
      subscription_id: subscriptionId,
    });

    // TODO: Trigger payment failure notification
    // await sendPaymentFailureNotification(invoice.customer_email, invoice);
  },
  'handlePaymentFailed'
);

/**
 * Log successful payment for audit and analytics
 */
async function logSuccessfulPayment(data: PaymentEventData): Promise<void> {
  try {
    const { invoice, customer_email, subscription_id } = data;

    console.log('📊 Payment success logged:', {
      customer: customer_email,
      subscription: subscription_id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      invoice: invoice.id,
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in analytics collection for business intelligence
    // This could track:
    // - Revenue by customer/plan
    // - Payment success rates
    // - Churn analysis data
  } catch (error) {
    console.error('Failed to log successful payment:', error);
    // Don't throw - logging is non-critical
  }
}

/**
 * Log failed payment for follow-up and analysis
 */
async function logFailedPayment(data: PaymentEventData): Promise<void> {
  try {
    const { invoice, customer_email, subscription_id } = data;

    console.log('📊 Payment failure logged:', {
      customer: customer_email,
      subscription: subscription_id,
      amount_due: invoice.amount_due / 100,
      currency: invoice.currency,
      invoice: invoice.id,
      attempt_count: invoice.attempt_count,
      next_payment_attempt: (invoice as any).next_payment_attempt,
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in failed_payments collection for:
    // - Customer service follow-up
    // - Dunning management
    // - Churn prevention analysis
    // - Payment method update prompts
  } catch (error) {
    console.error('Failed to log payment failure:', error);
    // Don't throw - logging is non-critical
  }
}
