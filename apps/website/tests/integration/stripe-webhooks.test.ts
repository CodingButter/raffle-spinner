/**
 * Stripe Webhook Integration Tests
 * Tests webhook handlers using Playwright for realistic scenarios
 */

import { test, expect } from '@playwright/test';
import crypto from 'crypto';

// Test webhook secret (use test environment)
const WEBHOOK_SECRET = process.env.STRIPE_TEST_WEBHOOK_SECRET || 'whsec_test_secret';
const WEBHOOK_URL = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';

/**
 * Generate Stripe webhook signature
 */
function generateStripeSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Create test subscription event payload
 */
function createSubscriptionEvent(type: string, subscriptionData: any = {}) {
  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    created: Math.floor(Date.now() / 1000),
    type,
    data: {
      object: {
        id: 'sub_test_123',
        object: 'subscription',
        customer: 'cus_test_123',
        status: 'active',
        items: {
          data: [{
            price: {
              id: 'price_test_starter'
            }
          }]
        },
        created: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
        cancel_at_period_end: false,
        ...subscriptionData
      }
    }
  };
}

test.describe('Stripe Webhook Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Stripe customer API call
    await page.route('**/v1/customers/cus_test_123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'cus_test_123',
          email: 'test@example.com',
          created: Math.floor(Date.now() / 1000)
        })
      });
    });

    // Mock Directus authentication
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            access_token: 'test_token_123',
            refresh_token: 'test_refresh_123'
          }
        })
      });
    });

    // Mock Directus user lookup
    await page.route('**/users?filter*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{
            id: 'user_123',
            email: 'test@example.com'
          }]
        })
      });
    });

    // Mock subscription tier lookup
    await page.route('**/items/subscription_tiers?filter*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{
            id: 'tier_123',
            tier_key: 'starter'
          }]
        })
      });
    });

    // Mock subscription creation/update
    await page.route('**/items/subscriptions*', async route => {
      const method = route.request().method();
      await route.fulfill({
        status: method === 'POST' ? 201 : 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'subscription_123',
            stripe_subscription_id: 'sub_test_123'
          }
        })
      });
    });
  });

  test('should handle customer.subscription.created webhook', async ({ request }) => {
    const eventData = createSubscriptionEvent('customer.subscription.created');
    const payload = JSON.stringify(eventData);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(responseData).toHaveProperty('received', true);
  });

  test('should handle customer.subscription.updated webhook', async ({ request }) => {
    const eventData = createSubscriptionEvent('customer.subscription.updated', {
      status: 'active',
      metadata: {
        change_type: 'upgrade',
        change_timestamp: Math.floor(Date.now() / 1000)
      }
    });
    const payload = JSON.stringify(eventData);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(responseData).toHaveProperty('received', true);
  });

  test('should handle customer.subscription.deleted webhook', async ({ request }) => {
    // Mock subscription lookup for cancellation
    await request.patch('**/items/subscriptions/*', {
      data: {
        status: 'canceled',
        cancel_at_period_end: true
      }
    });

    const eventData = createSubscriptionEvent('customer.subscription.deleted', {
      status: 'canceled'
    });
    const payload = JSON.stringify(eventData);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
  });

  test('should reject webhook with invalid signature', async ({ request }) => {
    const eventData = createSubscriptionEvent('customer.subscription.created');
    const payload = JSON.stringify(eventData);
    const invalidSignature = 'invalid_signature';

    const response = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': invalidSignature,
        'content-type': 'application/json'
      }
    });

    expect(response.status()).toBe(400);
    const responseData = await response.json();
    expect(responseData).toHaveProperty('error', 'Invalid signature');
  });

  test('should handle invoice.payment_succeeded webhook', async ({ request }) => {
    const eventData = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_test_123',
          object: 'invoice',
          customer: 'cus_test_123',
          customer_email: 'test@example.com',
          subscription: 'sub_test_123',
          amount_paid: 999, // $9.99
          currency: 'usd'
        }
      }
    };

    const payload = JSON.stringify(eventData);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
  });

  test('should handle invoice.payment_failed webhook', async ({ request }) => {
    // Mock subscription lookup for payment failure
    await request.route('**/v1/subscriptions/sub_test_123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'sub_test_123',
          customer: 'cus_test_123',
          status: 'past_due',
          items: {
            data: [{
              price: { id: 'price_test_starter' }
            }]
          },
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          cancel_at_period_end: false
        })
      });
    });

    const eventData = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_test_123',
          object: 'invoice',
          customer: 'cus_test_123',
          customer_email: 'test@example.com',
          subscription: 'sub_test_123',
          amount_due: 999
        }
      }
    };

    const payload = JSON.stringify(eventData);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
  });

  test('should handle checkout.session.completed webhook', async ({ request }) => {
    // Mock Stripe session retrieval
    await request.route('**/v1/checkout/sessions/cs_test_123*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'cs_test_123',
          customer_email: 'test@example.com',
          subscription: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            items: {
              data: [{
                price: { id: 'price_test_starter' }
              }]
            },
            created: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000
          }
        })
      });
    });

    const eventData = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          object: 'checkout.session',
          customer_email: 'test@example.com',
          subscription: 'sub_test_123'
        }
      }
    };

    const payload = JSON.stringify(eventData);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
  });

  test('should handle retry logic on Directus failure', async ({ request, page }) => {
    let attemptCount = 0;

    // Mock Directus to fail first two attempts, succeed on third
    await page.route('**/items/subscriptions', async route => {
      attemptCount++;
      if (attemptCount < 3) {
        await route.fulfill({
          status: 500,
          body: 'Internal Server Error'
        });
      } else {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { id: 'subscription_123' }
          })
        });
      }
    });

    const eventData = createSubscriptionEvent('customer.subscription.created');
    const payload = JSON.stringify(eventData);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    expect(attemptCount).toBe(3); // Verify retry logic worked
  });

  test('should handle idempotent webhook delivery', async ({ request }) => {
    const eventData = createSubscriptionEvent('customer.subscription.created');
    const payload = JSON.stringify(eventData);
    const signature = generateStripeSignature(payload, WEBHOOK_SECRET);

    // Send the same webhook twice
    const response1 = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    });

    const response2 = await request.post(`${WEBHOOK_URL}/api/stripe-webhook`, {
      data: payload,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    });

    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    // Both should succeed due to idempotency
  });
});