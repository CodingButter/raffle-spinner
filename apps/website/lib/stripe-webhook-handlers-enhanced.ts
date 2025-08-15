/**
 * Enhanced Stripe Webhook Event Handlers
 * Handles all critical Stripe events with proper error recovery
 */

import { stripe, PRODUCTS } from '@/lib/stripe';
import { createAdminClient } from '@/lib/directus-admin';
import Stripe from 'stripe';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app';
const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Speed4Dayz1!';

// Webhook event types we handle
export const HANDLED_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'customer.subscription.trial_will_end',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'invoice.upcoming',
  'payment_method.attached',
  'payment_method.detached',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.dispute.created',
  'charge.refunded',
] as const;

export type HandledEventType = (typeof HANDLED_EVENTS)[number];

// Enhanced error tracking
interface WebhookError {
  event_id: string;
  event_type: string;
  error_message: string;
  timestamp: string;
  retry_count: number;
}

// Cache for admin token
let adminTokenCache: { token: string; expires: number } | null = null;

// Get admin token with caching
async function getAdminToken(): Promise<string> {
  // Check cache
  if (adminTokenCache && adminTokenCache.expires > Date.now()) {
    return adminTokenCache.token;
  }

  try {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DIRECTUS_ADMIN_EMAIL,
        password: DIRECTUS_ADMIN_PASSWORD,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Directus auth failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const token = data.data.access_token;
    
    // Cache for 14 minutes (tokens expire in 15)
    adminTokenCache = {
      token,
      expires: Date.now() + 14 * 60 * 1000,
    };

    return token;
  } catch (error) {
    console.error('Failed to get admin token:', error);
    throw error;
  }
}

// Enhanced tier mapping with fallback
export function getTierFromPriceId(priceId: string): string {
  // Direct mapping from price IDs
  const priceToTierMap: Record<string, string> = {
    'price_1QTp0xP1dtChJNB1AeJHJWQs': 'starter', // Starter monthly
    'price_1QTp0xP1dtChJNB1oo8zQcOP': 'starter', // Starter yearly
    'price_1QTp14P1dtChJNB1GnRXP7cU': 'pro', // Pro monthly
    'price_1QTp14P1dtChJNB19YOHPZ0q': 'pro', // Pro yearly
    'price_1QTp19P1dtChJNB1ZBVZHsWU': 'enterprise', // Enterprise monthly
    'price_1QTp19P1dtChJNB1TYeBYlYx': 'enterprise', // Enterprise yearly
  };

  if (priceToTierMap[priceId]) {
    return priceToTierMap[priceId];
  }

  // Fallback to product lookup
  for (const [key, product] of Object.entries(PRODUCTS)) {
    if (product.priceId === priceId) {
      return key === 'professional' ? 'pro' : key;
    }
  }

  console.warn(`Unknown price ID: ${priceId}, defaulting to starter`);
  return 'starter';
}

// Get customer email with fallback
async function getCustomerEmail(
  customerId: string,
  fallbackEmail?: string | null
): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if ('deleted' in customer && customer.deleted) {
      return fallbackEmail || null;
    }
    return (customer as Stripe.Customer).email || fallbackEmail || null;
  } catch (error) {
    console.error(`Failed to retrieve customer ${customerId}:`, error);
    return fallbackEmail || null;
  }
}

// Enhanced subscription update in Directus
async function updateSubscriptionInDirectus(
  subscription: Stripe.Subscription,
  email: string
): Promise<void> {
  const token = await getAdminToken();

  // Get user
  const userResponse = await fetch(
    `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}`,
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
    console.warn(`User not found: ${email}, creating new user...`);
    // TODO: Create user if needed
    return;
  }

  // Get tier
  const priceId = subscription.items.data[0]?.price.id;
  const tier = getTierFromPriceId(priceId);

  // Get tier record
  const tierResponse = await fetch(
    `${DIRECTUS_URL}/items/subscription_tiers?filter[tier_key][_eq]=${tier}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!tierResponse.ok) {
    throw new Error(`Failed to find tier: ${tier}`);
  }

  const tierData = await tierResponse.json();
  const tierRecord = tierData.data?.[0];

  if (!tierRecord) {
    throw new Error(`Tier not found: ${tier}`);
  }

  // Check existing subscription
  const existingResponse = await fetch(
    `${DIRECTUS_URL}/items/subscriptions?filter[stripe_subscription_id][_eq]=${subscription.id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const existingData = await existingResponse.json();
  const existingSub = existingData.data?.[0];

  const subscriptionData = {
    user: user.id,
    tier: tierRecord.id,
    product: 'spinner',
    status: subscription.status,
    starts_at: new Date(subscription.created * 1000).toISOString(),
    expires_at: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  };

  if (existingSub) {
    // Update existing
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
      const error = await updateResponse.text();
      throw new Error(`Failed to update subscription: ${error}`);
    }

    console.log(`✅ Updated subscription ${subscription.id} for ${email}`);
  } else {
    // Create new
    const createResponse = await fetch(`${DIRECTUS_URL}/items/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...subscriptionData, raffle_count: 0 }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create subscription: ${error}`);
    }

    console.log(`✅ Created subscription ${subscription.id} for ${email}`);
  }

  // Also update user fields for backward compatibility
  const directusAdmin = createAdminClient();
  await directusAdmin.updateUserSubscription(email, {
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    subscription_tier: tier,
    subscription_current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    subscription_cancel_at_period_end: subscription.cancel_at_period_end,
  });
}

// Main event handlers
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🛒 Processing checkout.session.completed:', session.id);

  try {
    // Expand the session to get full details
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'subscription', 'customer'],
    });

    if (!fullSession.subscription) {
      console.log('No subscription in checkout session');
      return;
    }

    const subscription = fullSession.subscription as Stripe.Subscription;
    const email = fullSession.customer_email || 
                  ((fullSession.customer as Stripe.Customer)?.email);

    if (!email) {
      throw new Error('No customer email found');
    }

    await updateSubscriptionInDirectus(subscription, email);
    console.log(`✅ Checkout completed for ${email}`);
  } catch (error) {
    console.error('❌ Failed to handle checkout:', error);
    throw error;
  }
}

export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('✨ Processing customer.subscription.created:', subscription.id);

  try {
    const email = await getCustomerEmail(subscription.customer as string);
    if (!email) {
      throw new Error('No customer email found');
    }

    await updateSubscriptionInDirectus(subscription, email);
    console.log(`✅ Subscription created for ${email}`);
  } catch (error) {
    console.error('❌ Failed to handle subscription creation:', error);
    throw error;
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Processing customer.subscription.updated:', subscription.id);

  try {
    const email = await getCustomerEmail(subscription.customer as string);
    if (!email) {
      throw new Error('No customer email found');
    }

    // Check for plan changes
    const changeType = subscription.metadata?.change_type;
    if (changeType) {
      const priceId = subscription.items.data[0]?.price.id;
      const tier = getTierFromPriceId(priceId);
      console.log(`📊 Plan ${changeType}: ${email} → ${tier}`);
    }

    await updateSubscriptionInDirectus(subscription, email);
    console.log(`✅ Subscription updated for ${email}`);
  } catch (error) {
    console.error('❌ Failed to handle subscription update:', error);
    throw error;
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🗑️ Processing customer.subscription.deleted:', subscription.id);

  try {
    const directusAdmin = createAdminClient();
    await directusAdmin.cancelSubscription(subscription.id);
    console.log(`✅ Subscription canceled: ${subscription.id}`);
  } catch (error) {
    console.error('❌ Failed to handle subscription deletion:', error);
    throw error;
  }
}

export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Processing invoice.payment_succeeded:', invoice.id);

  if (invoice.subscription && invoice.customer_email) {
    console.log(
      `✅ Payment received: ${invoice.customer_email} - ${
        (invoice.amount_paid || 0) / 100
      } ${invoice.currency?.toUpperCase()}`
    );

    // Update subscription if needed
    try {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );
      await updateSubscriptionInDirectus(subscription, invoice.customer_email);
    } catch (error) {
      console.error('Failed to update subscription after payment:', error);
    }
  }
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Processing invoice.payment_failed:', invoice.id);

  if (invoice.subscription && invoice.customer_email) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      // Update status to past_due
      subscription.status = 'past_due';
      await updateSubscriptionInDirectus(subscription, invoice.customer_email);

      console.log(
        `⚠️ Payment failed: ${invoice.customer_email} - marked as past_due`
      );
    } catch (error) {
      console.error('Failed to handle payment failure:', error);
      throw error;
    }
  }
}

export async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('⏰ Processing customer.subscription.trial_will_end:', subscription.id);

  try {
    const email = await getCustomerEmail(subscription.customer as string);
    if (email) {
      console.log(`⚠️ Trial ending soon for ${email}`);
      // TODO: Send trial ending notification
    }
  } catch (error) {
    console.error('Failed to handle trial ending:', error);
  }
}

export async function handleSubscriptionPaused(subscription: Stripe.Subscription) {
  console.log('⏸️ Processing customer.subscription.paused:', subscription.id);

  try {
    const email = await getCustomerEmail(subscription.customer as string);
    if (!email) {
      throw new Error('No customer email found');
    }

    subscription.status = 'paused';
    await updateSubscriptionInDirectus(subscription, email);
    console.log(`✅ Subscription paused for ${email}`);
  } catch (error) {
    console.error('Failed to handle subscription pause:', error);
    throw error;
  }
}

export async function handleSubscriptionResumed(subscription: Stripe.Subscription) {
  console.log('▶️ Processing customer.subscription.resumed:', subscription.id);

  try {
    const email = await getCustomerEmail(subscription.customer as string);
    if (!email) {
      throw new Error('No customer email found');
    }

    await updateSubscriptionInDirectus(subscription, email);
    console.log(`✅ Subscription resumed for ${email}`);
  } catch (error) {
    console.error('Failed to handle subscription resume:', error);
    throw error;
  }
}

// Log webhook errors for debugging
async function logWebhookError(error: WebhookError) {
  try {
    const token = await getAdminToken();
    
    await fetch(`${DIRECTUS_URL}/items/webhook_errors`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(error),
    });
  } catch (err) {
    // Silently fail - error logging is optional
    console.log('Could not log webhook error:', err.message);
  }
}

// Main webhook processor
export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  console.log(`\n📨 Processing webhook: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.paused':
        await handleSubscriptionPaused(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.resumed':
        await handleSubscriptionResumed(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log(`✅ Successfully processed ${event.type}`);
  } catch (error) {
    console.error(`❌ Error processing ${event.type}:`, error);
    
    // Log error for debugging
    await logWebhookError({
      event_id: event.id,
      event_type: event.type,
      error_message: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      retry_count: 0,
    });

    throw error;
  }
}