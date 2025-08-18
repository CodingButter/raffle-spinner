/**
 * Payment Event Handlers
 * Handles Stripe webhook events for payments and invoices
 */

import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/directus-admin';
import Stripe from 'stripe';
import { getTierFromPriceId } from './tier-resolver';

/**
 * Handle successful payment events
 * Logs successful payments for audit trail
 */
export async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('Payment succeeded for invoice:', invoice.id);

  try {
    // Optional: Log successful payments for audit trail
    if ((invoice as any).subscription && invoice.customer_email) {
      const amountPaid = invoice.amount_paid / 100;
      const currency = invoice.currency.toUpperCase();
      
      console.log(
        `Payment successful for ${invoice.customer_email}, amount: ${amountPaid} ${currency}`
      );

      // TODO: Consider adding payment success tracking to Directus
      // This could be useful for financial reporting and customer support
    }
  } catch (error) {
    console.error('Failed to process payment success:', error);
    throw error;
  }
}

/**
 * Handle failed payment events
 * Updates subscription status and triggers recovery flows
 */
export async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('Payment failed for invoice:', invoice.id);

  try {
    const directusAdmin = createAdminClient();

    // Update subscription status to past_due
    if ((invoice as any).subscription && invoice.customer_email) {
      const subscription = await stripe.subscriptions.retrieve(
        (invoice as any).subscription as string
      );

      const tier = getTierFromPriceId(subscription.items.data[0]?.price.id);

      await directusAdmin.updateUserSubscription(invoice.customer_email, {
        stripe_customer_id: invoice.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_status: 'past_due',
        subscription_tier: tier,
        subscription_current_period_end: new Date(
          (subscription as any).current_period_end * 1000
        ).toISOString(),
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
      });

      console.log(
        `Payment failed for ${invoice.customer_email}, subscription marked as past_due`
      );

      // TODO: Send payment failed email to customer
      // TODO: Implement retry/recovery logic
      // TODO: Consider implementing dunning management
    }
  } catch (error) {
    console.error('Failed to update payment failed status:', error);
    throw error;
  }
}