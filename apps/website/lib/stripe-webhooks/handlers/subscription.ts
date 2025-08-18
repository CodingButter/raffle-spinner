/**
 * Subscription Webhook Handlers
 * Handles all subscription-related webhook events with proper error handling
 */

import Stripe from 'stripe';
import { stripe, PRODUCTS } from '@/lib/stripe';
import { createAdminClient } from '@/lib/directus-admin';
import { SubscriptionUpdateData } from '../types';
import {
  executeWithRetry,
  withErrorHandling,
  directusCircuitBreaker,
} from '../services/error-handling';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

/**
 * Get admin token for Directus operations with retry logic
 */
async function getAdminToken(): Promise<string> {
  return executeWithRetry(async () => {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app',
        password: process.env.DIRECTUS_ADMIN_PASSWORD || 'Speed4Dayz1!',
      }),
    });

    if (!response.ok) {
      throw new Error(`Directus authentication failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data.access_token;
  });
}

/**
 * Determine subscription tier from Stripe price ID
 */
export function getTierFromPriceId(priceId: string): string {
  if (!priceId) {
    console.warn('No price ID provided, defaulting to starter tier');
    return 'starter';
  }

  const productEntries = Object.entries(PRODUCTS);
  for (const [key, product] of productEntries) {
    if (product.priceId === priceId) {
      // Map Stripe product keys to our subscription tier keys
      if (key === 'professional') return 'pro';
      return key; // 'starter', 'enterprise'
    }
  }

  console.warn(`Unknown price ID: ${priceId}, defaulting to starter tier`);
  return 'starter';
}

/**
 * Create or update subscription in Directus collections
 */
async function createOrUpdateSubscriptionInDirectus(data: SubscriptionUpdateData): Promise<void> {
  const { user_email, subscription, tier } = data;

  return directusCircuitBreaker.execute(async () => {
    const token = await getAdminToken();

    // Get user ID
    const userResponse = await fetch(
      `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(user_email)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!userResponse.ok) {
      throw new Error(`Failed to find user: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const user = userData.data?.[0];
    if (!user) {
      throw new Error(`User not found: ${user_email}`);
    }

    // Get subscription tier ID
    const tierResponse = await fetch(
      `${DIRECTUS_URL}/items/subscription_tiers?filter[tier_key][_eq]=${tier}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!tierResponse.ok) {
      throw new Error(`Failed to find subscription tier: ${tierResponse.status}`);
    }

    const tierData = await tierResponse.json();
    const tierRecord = tierData.data?.[0];
    if (!tierRecord) {
      throw new Error(`Subscription tier not found: ${tier}`);
    }

    // Check for existing subscription
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
      raffle_count: 0,
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
          throw new Error(`Failed to update subscription: ${updateResponse.status}`);
        }

        console.log(`✅ Updated subscription ${subscription.id} for ${user_email}`);
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
      throw new Error(`Failed to create subscription: ${createResponse.status}`);
    }

    console.log(`✅ Created subscription ${subscription.id} for ${user_email}`);
  });
}

/**
 * Handle checkout session completed events
 */
export const handleCheckoutCompleted = withErrorHandling(
  async (session: Stripe.Checkout.Session): Promise<void> => {
    console.log('Processing checkout completion:', session.id);

    // Get full session details with expanded data
    const fullSession = (await executeWithRetry(
      () =>
        stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'subscription'],
        }),
      { max_attempts: 2 },
      session.id
    )) as any; // Type assertion needed due to executeWithRetry return type

    if (fullSession.subscription && fullSession.customer_email) {
      const subscription = fullSession.subscription as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      console.log(`✅ Processed checkout completion for ${fullSession.customer_email}`);
    } else {
      console.warn('Checkout session missing subscription or customer email:', session.id);
    }
  },
  'handleCheckoutCompleted'
);

/**
 * Handle subscription update/creation events
 */
export const handleSubscriptionUpdate = withErrorHandling(
  async (subscription: Stripe.Subscription): Promise<void> => {
    console.log('Processing subscription update:', {
      id: subscription.id,
      status: subscription.status,
      customer: subscription.customer,
    });

    // Get customer details with retry
    const customer = await executeWithRetry(
      () => stripe.customers.retrieve(subscription.customer as string) as Promise<Stripe.Customer>,
      { max_attempts: 2 },
      subscription.id
    );

    if (!customer.email) {
      throw new Error(`No customer email found for subscription: ${subscription.id}`);
    }

    // Determine tier from price ID
    const priceId = subscription.items.data[0]?.price.id;
    const tier = getTierFromPriceId(priceId);

    // Check for plan change metadata
    const changeType = subscription.metadata?.change_type;
    const changeTimestamp = subscription.metadata?.change_timestamp;

    if (changeType && changeTimestamp) {
      console.log(`Processing ${changeType} for ${customer.email} to ${tier} tier`);
    } else {
      console.log(`Updating ${customer.email} to ${tier} tier`);
    }

    // Update in new collections system
    await createOrUpdateSubscriptionInDirectus({
      user_email: customer.email,
      subscription,
      tier,
      change_type: changeType,
    });

    // Update legacy user fields for backward compatibility
    const directusAdmin = createAdminClient();
    await executeWithRetry(
      () =>
        directusAdmin.updateUserSubscription(customer.email!, {
          stripe_customer_id: customer.id,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          subscription_tier: tier,
          subscription_current_period_end: new Date(
            (subscription as any).current_period_end * 1000
          ).toISOString(),
          subscription_cancel_at_period_end: subscription.cancel_at_period_end,
        }),
      { max_attempts: 2 },
      subscription.id
    );

    console.log(`✅ Successfully updated subscription for ${customer.email} to ${tier}`);
  },
  'handleSubscriptionUpdate'
);

/**
 * Handle subscription deletion/cancellation events
 */
export const handleSubscriptionDeleted = withErrorHandling(
  async (subscription: Stripe.Subscription): Promise<void> => {
    console.log('Processing subscription cancellation:', subscription.id);

    const directusAdmin = createAdminClient();

    await executeWithRetry(
      () => directusAdmin.cancelSubscription(subscription.id),
      { max_attempts: 2 },
      subscription.id
    );

    console.log(`✅ Cancelled subscription ${subscription.id} in Directus`);
  },
  'handleSubscriptionDeleted'
);
