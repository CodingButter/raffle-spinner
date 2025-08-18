/**
 * Subscription Event Handlers
 * Handles Stripe webhook events for subscriptions
 */

import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/directus-admin';
import Stripe from 'stripe';
import { getTierFromPriceId } from './tier-resolver';
import { createOrUpdateSubscriptionInDirectus } from './directus-integration';
import { logPlanChange, sendPlanChangeNotification } from './audit-service';

/**
 * Handle checkout session completion
 * Processes successful subscription purchases
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('Checkout completed:', session.id);

  try {
    // Get the full session details with line items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'subscription'],
    });

    if (fullSession.subscription && fullSession.customer_email) {
      const subscription = fullSession.subscription as Stripe.Subscription;

      // Handle subscription update
      await handleSubscriptionUpdate(subscription);

      console.log(`Processed checkout completion for ${fullSession.customer_email}`);
    }
  } catch (error) {
    console.error('Failed to handle checkout completion:', error);
    throw error;
  }
}

/**
 * Handle subscription updates (created/updated events)
 * Core subscription synchronization logic
 */
export async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription updated:', subscription.id);
  console.log('Subscription status:', subscription.status);

  try {
    // Get customer email from Stripe
    const customer = (await stripe.customers.retrieve(
      subscription.customer as string
    )) as Stripe.Customer;

    if (!customer.email) {
      console.error('No customer email found for subscription:', subscription.id);
      return;
    }

    // Determine tier from price ID
    const priceId = subscription.items.data[0]?.price.id;
    const tier = getTierFromPriceId(priceId);

    // Check if this is a plan change
    const changeType = subscription.metadata?.change_type;
    const changeTimestamp = subscription.metadata?.change_timestamp;

    if (changeType && changeTimestamp) {
      console.log(`Processing ${changeType} for ${customer.email} to ${tier} tier`);

      // Log the plan change for audit trail
      await logPlanChange(customer.email, subscription, changeType, tier);
    } else {
      console.log(`Updating ${customer.email} to ${tier} tier`);
    }

    // Create subscription in our new collections system
    await createOrUpdateSubscriptionInDirectus(customer.email, subscription, tier);

    // Also update the old user fields for backward compatibility
    const directusAdmin = createAdminClient();
    await directusAdmin.updateUserSubscription(customer.email, {
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_tier: tier,
      subscription_current_period_end: new Date(
        (subscription as any).current_period_end * 1000
      ).toISOString(),
      subscription_cancel_at_period_end: subscription.cancel_at_period_end,
    });

    console.log(`Successfully updated subscription for ${customer.email} to ${tier}`);

    // Send notification for plan changes
    if (changeType) {
      await sendPlanChangeNotification(customer.email, changeType, tier);
    }
  } catch (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }
}

/**
 * Handle subscription deletion/cancellation
 * Processes subscription cancellations and downgrades
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription cancelled:', subscription.id);

  try {
    const directusAdmin = createAdminClient();
    
    // Cancel the subscription in Directus
    await directusAdmin.cancelSubscription(subscription.id);

    console.log(`Cancelled subscription ${subscription.id} in Directus`);
  } catch (error) {
    console.error('Failed to cancel subscription in Directus:', error);
    throw error;
  }
}