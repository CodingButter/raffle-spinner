/**
 * Stripe Webhook Event Handlers
 */

import { stripe, PRODUCTS } from '@/lib/stripe';
import { createAdminClient } from '@/lib/directus-admin';
import Stripe from 'stripe';

// Helper function to determine tier from price ID
export function getTierFromPriceId(priceId: string): string {
  const productEntries = Object.entries(PRODUCTS);
  for (const [key, product] of productEntries) {
    if (product.priceId === priceId) {
      return key; // 'starter', 'professional', or 'enterprise'
    }
  }
  return 'free';
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const directusAdmin = createAdminClient();
  console.log('Checkout completed:', session.id);

  // Get the full session details with line items
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items', 'subscription'],
  });

  if (fullSession.subscription && fullSession.customer_email) {
    const subscription = fullSession.subscription as Stripe.Subscription;
    const priceId = subscription.items.data[0]?.price.id;
    const tier = getTierFromPriceId(priceId);

    // Update user subscription in Directus
    try {
      await directusAdmin.updateUserSubscription(fullSession.customer_email, {
        stripe_customer_id: fullSession.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_tier: tier,
        subscription_current_period_end: new Date(
          (subscription as any).current_period_end * 1000
        ).toISOString(),
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
      });

      console.log(`Updated subscription for ${fullSession.customer_email} to ${tier} tier`);
    } catch (error) {
      console.error('Failed to update user subscription in Directus:', error);
      // Don't fail the webhook, log the error for manual resolution
    }
  }
}

export async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const directusAdmin = createAdminClient();
  console.log('Subscription updated:', subscription.id);
  console.log('Subscription metadata:', subscription.metadata);

  // First try to use directus_user_id from subscription metadata
  const directusUserId = subscription.metadata?.directus_user_id;

  if (directusUserId) {
    console.log('Found directus_user_id in metadata:', directusUserId);

    // Use product key from metadata
    const productKey = subscription.metadata?.product_key || 'spinner_starter';
    console.log(`Using product key from metadata: ${productKey}`);

    try {
      // Create or update subscription record
      const subscriptionData: any = {
        user_id: directusUserId,
        product_key: productKey,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
      };

      // Only add period end if it's a valid timestamp
      if (
        (subscription as any).current_period_end &&
        (subscription as any).current_period_end > 0
      ) {
        subscriptionData.current_period_end = new Date(
          (subscription as any).current_period_end * 1000
        ).toISOString();
      }

      await directusAdmin.createOrUpdateSubscription(subscriptionData);

      console.log(
        `Created/updated subscription for user ${directusUserId} with product ${productKey}`
      );
    } catch (error) {
      console.error('Failed to update subscription by ID in Directus:', error);

      // Fallback to customer email method
      await handleSubscriptionFallback(subscription);
    }
  } else {
    // Fallback to original method using customer email
    console.log('No directus_user_id in metadata, using customer email');
    await handleSubscriptionFallback(subscription);
  }
}

async function handleSubscriptionFallback(subscription: Stripe.Subscription) {
  const directusAdmin = createAdminClient();
  const customer = (await stripe.customers.retrieve(
    subscription.customer as string
  )) as Stripe.Customer;

  if (customer.email) {
    // Use product key from metadata instead of price ID lookup
    const tier = subscription.metadata?.product_key || 'free';

    try {
      const updateData: any = {
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_tier: tier,
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
      };

      // Only add period end if it's a valid timestamp
      if (
        (subscription as any).current_period_end &&
        (subscription as any).current_period_end > 0
      ) {
        updateData.subscription_current_period_end = new Date(
          (subscription as any).current_period_end * 1000
        ).toISOString();
      }

      await directusAdmin.updateUserSubscription(customer.email, updateData);

      console.log(`Updated subscription status for ${customer.email}: ${subscription.status}`);
    } catch (error) {
      console.error('Failed to update subscription in Directus:', error);
    }
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const directusAdmin = createAdminClient();
  console.log('Subscription cancelled:', subscription.id);

  try {
    // Cancel the subscription in Directus
    await directusAdmin.cancelSubscription(subscription.id);

    console.log(`Cancelled subscription ${subscription.id} in Directus`);
  } catch (error) {
    console.error('Failed to cancel subscription in Directus:', error);
  }
}

export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);

  // Optional: Log successful payments for audit trail
  if ((invoice as any).subscription && invoice.customer_email) {
    console.log(
      `Payment successful for ${invoice.customer_email}, amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`
    );
  }
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const directusAdmin = createAdminClient();
  console.log('Payment failed for invoice:', invoice.id);

  // Update subscription status to past_due
  if ((invoice as any).subscription && invoice.customer_email) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        (invoice as any).subscription as string
      );

      await directusAdmin.updateUserSubscription(invoice.customer_email, {
        stripe_customer_id: invoice.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_status: 'past_due',
        subscription_tier: getTierFromPriceId(subscription.items.data[0]?.price.id),
        subscription_current_period_end: new Date(
          (subscription as any).current_period_end * 1000
        ).toISOString(),
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
      });

      console.log(`Payment failed for ${invoice.customer_email}, subscription marked as past_due`);

      // TODO: Send payment failed email to customer
    } catch (error) {
      console.error('Failed to update payment failed status:', error);
    }
  }
}
