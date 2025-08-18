/**
 * Webhook Integration Tests with Playwright
 * Tests webhook endpoints with real-world scenarios including idempotency
 */

import { test, expect } from '@playwright/test';
import crypto from 'crypto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

// Generate webhook signature for testing
function generateSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

// Create test webhook event
function createWebhookEvent(eventType: string, data: any) {
  return {
    id: `evt_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    object: 'event',
    api_version: '2024-11-20.acacia',
    created: Math.floor(Date.now() / 1000),
    type: eventType,
    data: { object: data },
  };
}

test.describe('Webhook Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any necessary authentication or state
  });

  test('should handle checkout.session.completed with idempotency', async ({ request }) => {
    const eventData = {
      id: `cs_test_${Date.now()}`,
      customer: 'cus_test_123',
      customer_email: 'test@drawday.app',
      subscription: 'sub_test_123',
      payment_status: 'paid',
      status: 'complete',
    };

    const webhookEvent = createWebhookEvent('checkout.session.completed', eventData);
    const payload = JSON.stringify(webhookEvent);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    // First request should succeed
    const response1 = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });

    expect(response1.status()).toBe(200);
    const result1 = await response1.json();
    expect(result1.received).toBe(true);
    expect(result1.event_id).toBe(webhookEvent.id);

    // Second request with same event ID should be idempotent
    const response2 = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });

    expect(response2.status()).toBe(200);
    const result2 = await response2.json();
    expect(result2.received).toBe(true);
    expect(result2.event_id).toBe(webhookEvent.id);
  });

  test('should handle subscription.created event', async ({ request }) => {
    const eventData = {
      id: `sub_test_${Date.now()}`,
      customer: 'cus_test_123',
      status: 'active',
      items: {
        data: [
          {
            price: {
              id: 'price_starter',
              product: 'prod_starter',
            },
          },
        ],
      },
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      cancel_at_period_end: false,
      created: Math.floor(Date.now() / 1000),
    };

    const webhookEvent = createWebhookEvent('customer.subscription.created', eventData);
    const payload = JSON.stringify(webhookEvent);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.received).toBe(true);
    expect(result.event_id).toBe(webhookEvent.id);
  });

  test('should handle subscription.updated with plan change', async ({ request }) => {
    const eventData = {
      id: 'sub_test_123',
      customer: 'cus_test_123',
      status: 'active',
      items: {
        data: [
          {
            price: {
              id: 'price_pro',
              product: 'prod_pro',
            },
          },
        ],
      },
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      cancel_at_period_end: false,
      metadata: {
        change_type: 'upgrade',
        change_timestamp: Date.now().toString(),
      },
    };

    const webhookEvent = createWebhookEvent('customer.subscription.updated', eventData);
    const payload = JSON.stringify(webhookEvent);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.received).toBe(true);
  });

  test('should handle subscription.deleted event', async ({ request }) => {
    const eventData = {
      id: 'sub_test_123',
      customer: 'cus_test_123',
      status: 'canceled',
    };

    const webhookEvent = createWebhookEvent('customer.subscription.deleted', eventData);
    const payload = JSON.stringify(webhookEvent);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.received).toBe(true);
  });

  test('should handle payment succeeded event', async ({ request }) => {
    const eventData = {
      id: `in_test_${Date.now()}`,
      customer: 'cus_test_123',
      customer_email: 'test@drawday.app',
      subscription: 'sub_test_123',
      amount_paid: 1499,
      currency: 'gbp',
    };

    const webhookEvent = createWebhookEvent('invoice.payment_succeeded', eventData);
    const payload = JSON.stringify(webhookEvent);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.received).toBe(true);
  });

  test('should handle payment failed event', async ({ request }) => {
    const eventData = {
      id: `in_test_${Date.now()}`,
      customer: 'cus_test_123',
      customer_email: 'test@drawday.app',
      subscription: 'sub_test_123',
      amount_due: 1499,
      currency: 'gbp',
      attempt_count: 2,
    };

    const webhookEvent = createWebhookEvent('invoice.payment_failed', eventData);
    const payload = JSON.stringify(webhookEvent);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.received).toBe(true);
  });

  test('should reject invalid signature', async ({ request }) => {
    const eventData = { id: 'test' };
    const webhookEvent = createWebhookEvent('checkout.session.completed', eventData);
    const payload = JSON.stringify(webhookEvent);

    const response = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'invalid_signature',
      },
      data: payload,
    });

    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.error).toBe('Invalid signature');
  });

  test('should reject missing signature', async ({ request }) => {
    const eventData = { id: 'test' };
    const webhookEvent = createWebhookEvent('checkout.session.completed', eventData);
    const payload = JSON.stringify(webhookEvent);

    const response = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.error).toBe('No signature provided');
  });

  test('should handle unknown event types gracefully', async ({ request }) => {
    const eventData = { id: 'test_unknown' };
    const webhookEvent = createWebhookEvent('unknown.event.type', eventData);
    const payload = JSON.stringify(webhookEvent);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    const response = await request.post(`${API_BASE_URL}/api/stripe-webhook`, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.received).toBe(true);
  });

  test('should handle concurrent webhook processing', async ({ request }) => {
    const eventData = {
      id: `cs_concurrent_${Date.now()}`,
      customer: 'cus_test_123',
      customer_email: 'test@drawday.app',
      subscription: 'sub_test_123',
      payment_status: 'paid',
      status: 'complete',
    };

    const webhookEvent = createWebhookEvent('checkout.session.completed', eventData);
    const payload = JSON.stringify(webhookEvent);
    const signature = generateSignature(payload, WEBHOOK_SECRET);

    // Send same webhook multiple times concurrently
    const requests = Array(3)
      .fill(null)
      .map(() =>
        request.post(`${API_BASE_URL}/api/stripe-webhook`, {
          headers: {
            'Content-Type': 'application/json',
            'stripe-signature': signature,
          },
          data: payload,
        })
      );

    const responses = await Promise.all(requests);

    // All should succeed due to idempotency
    responses.forEach((response) => {
      expect(response.status()).toBe(200);
    });

    const results = await Promise.all(responses.map((r) => r.json()));
    results.forEach((result) => {
      expect(result.received).toBe(true);
      expect(result.event_id).toBe(webhookEvent.id);
    });
  });
});
