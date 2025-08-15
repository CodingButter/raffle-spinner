/**
 * Stripe Webhook Event Handlers
 */

import { stripe, PRODUCTS } from '@/lib/stripe';
import { createAdminClient } from '@/lib/directus-admin';
import Stripe from 'stripe';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app';
const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Speed4Dayz1!';

// Helper function to determine tier from price ID
export function getTierFromPriceId(priceId: string): string {
  const productEntries = Object.entries(PRODUCTS);
  for (const [key, product] of productEntries) {
    if (product.priceId === priceId) {
      // Map Stripe product keys to our subscription tier keys
      if (key === 'professional') return 'pro';
      return key; // 'starter', 'enterprise'
    }
  }
  return 'starter'; // Default to starter instead of free
}

// Get admin token for Directus operations
async function getAdminToken(): Promise<string> {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: DIRECTUS_ADMIN_EMAIL,
      password: DIRECTUS_ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Directus');
  }

  const data = await response.json();
  return data.data.access_token;
}

// Create or update subscription in our collections
async function createOrUpdateSubscriptionInDirectus(
  userEmail: string,
  subscription: Stripe.Subscription,
  tier: string
) {
  try {
    const token = await getAdminToken();

    // First, get the user ID
    const userResponse = await fetch(
      `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(userEmail)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!userResponse.ok) {
      throw new Error('Failed to find user');
    }

    const userData = await userResponse.json();
    const user = userData.data?.[0];
    if (!user) {
      throw new Error(`User not found: ${userEmail}`);
    }

    // Get the subscription tier ID
    const tierResponse = await fetch(
      `${DIRECTUS_URL}/items/subscription_tiers?filter[tier_key][_eq]=${tier}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!tierResponse.ok) {
      throw new Error('Failed to find subscription tier');
    }

    const tierData = await tierResponse.json();
    const tierRecord = tierData.data?.[0];
    if (!tierRecord) {
      throw new Error(`Subscription tier not found: ${tier}`);
    }

    // Check if subscription record already exists
    const existingResponse = await fetch(
      `${DIRECTUS_URL}/items/subscriptions?filter[stripe_subscription_id][_eq]=${subscription.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const subscriptionData = {
      user: user.id,
      tier: tierRecord.id,
      product: 'spinner',
      status: subscription.status,
      starts_at: new Date(subscription.created * 1000).toISOString(),
      expires_at:
        subscription.status === 'active' && (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : null,
      stripe_subscription_id: subscription.id,
      raffle_count: 0, // Reset or preserve existing count
    };

    if (existingResponse.ok) {
      const existingData = await existingResponse.json();
      const existingSub = existingData.data?.[0];

      if (existingSub) {
        // Update existing subscription
        const updateResponse = await fetch(
          `${DIRECTUS_URL}/items/subscriptions/${existingSub.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionData),
          }
        );

        if (!updateResponse.ok) {
          throw new Error('Failed to update subscription');
        }

        console.log(`Updated subscription ${subscription.id} for ${userEmail}`);
        return;
      }
    }

    // Create new subscription
    const createResponse = await fetch(`${DIRECTUS_URL}/items/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!createResponse.ok) {
      throw new Error('Failed to create subscription');
    }

    console.log(`Created subscription ${subscription.id} for ${userEmail}`);
  } catch (error) {
    console.error('Failed to create/update subscription in Directus:', error);
    throw error;
  }
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

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
}

export async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
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

// Helper function to log plan changes for audit trail
async function logPlanChange(
  userEmail: string,
  subscription: Stripe.Subscription,
  changeType: string,
  newTier: string
) {
  try {
    const token = await getAdminToken();

    // Create audit log entry (assuming we have an audit_logs collection)
    const auditData = {
      user_email: userEmail,
      action: 'subscription_plan_change',
      details: {
        subscription_id: subscription.id,
        change_type: changeType,
        new_tier: newTier,
        change_timestamp: subscription.metadata?.change_timestamp,
        scheduled_change: subscription.metadata?.scheduled_change === 'true',
      },
      timestamp: new Date().toISOString(),
    };

    // Note: This assumes an audit_logs collection exists
    // If not, this will fail silently and just log to console
    await fetch(`${DIRECTUS_URL}/items/audit_logs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData),
    });

    console.log(`Logged ${changeType} for ${userEmail} to ${newTier}`);
  } catch (error) {
    console.log('Note: Could not create audit log (collection may not exist):', error.message);
  }
}

// Helper function to send plan change notifications
async function sendPlanChangeNotification(userEmail: string, changeType: string, newTier: string) {
  try {
    // TODO: Implement email notification system
    // This could integrate with your email service (SendGrid, Mailgun, etc.)
    console.log(`Plan change notification needed: ${changeType} to ${newTier} for ${userEmail}`);

    // For now, just log the notification
    // In a production system, you would:
    // 1. Send email notification to user
    // 2. Create in-app notification
    // 3. Update user's notification preferences
  } catch (error) {
    console.error('Failed to send plan change notification:', error);
  }
}
