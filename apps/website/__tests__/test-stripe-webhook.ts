#!/usr/bin/env node

/**
 * Stripe Webhook Testing Script
 * Tests webhook integration and database updates
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';
import crypto from 'crypto';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

if (!WEBHOOK_SECRET || !STRIPE_SECRET_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure STRIPE_WEBHOOK_SECRET and STRIPE_SECRET_KEY are set');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Test event templates
const testEvents = {
  checkoutCompleted: {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_' + Date.now(),
        customer: 'cus_test_123',
        customer_email: 'test@drawday.app',
        subscription: 'sub_test_123',
        payment_status: 'paid',
        status: 'complete',
      },
    },
  },
  subscriptionCreated: {
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test_' + Date.now(),
        customer: 'cus_test_123',
        status: 'active',
        items: {
          data: [
            {
              price: {
                id: 'price_starter', // Replace with actual price ID
                product: 'prod_starter',
              },
            },
          ],
        },
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        cancel_at_period_end: false,
      },
    },
  },
  subscriptionUpdated: {
    type: 'customer.subscription.updated',
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        items: {
          data: [
            {
              price: {
                id: 'price_pro', // Changed to pro tier
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
      },
    },
  },
  subscriptionDeleted: {
    type: 'customer.subscription.deleted',
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'canceled',
      },
    },
  },
  paymentSucceeded: {
    type: 'invoice.payment_succeeded',
    data: {
      object: {
        id: 'in_test_' + Date.now(),
        customer: 'cus_test_123',
        customer_email: 'test@drawday.app',
        subscription: 'sub_test_123',
        amount_paid: 1499,
        currency: 'gbp',
      },
    },
  },
  paymentFailed: {
    type: 'invoice.payment_failed',
    data: {
      object: {
        id: 'in_test_' + Date.now(),
        customer: 'cus_test_123',
        customer_email: 'test@drawday.app',
        subscription: 'sub_test_123',
        amount_due: 1499,
        currency: 'gbp',
      },
    },
  },
};

// Generate webhook signature
function generateSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

// Send webhook event to endpoint
async function sendWebhookEvent(eventType: string, eventData: any) {
  const payload = JSON.stringify({
    id: 'evt_test_' + Date.now(),
    object: 'event',
    api_version: '2024-11-20.acacia',
    created: Math.floor(Date.now() / 1000),
    type: eventType,
    data: eventData.data,
  });

  const signature = generateSignature(payload, WEBHOOK_SECRET);

  try {
    const response = await fetch(`${API_URL}/api/stripe-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      body: payload,
    });

    const result = await response.text();

    if (response.ok) {
      console.log(`✅ ${eventType}: Success`);
      console.log(`   Response: ${result}`);
    } else {
      console.error(`❌ ${eventType}: Failed (${response.status})`);
      console.error(`   Response: ${result}`);
    }

    return { success: response.ok, status: response.status, data: result };
  } catch (error) {
    console.error(`❌ ${eventType}: Error`);
    console.error(`   ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  console.log('🔧 Testing Stripe Webhook Integration\n');
  console.log(`📍 Webhook URL: ${API_URL}/api/stripe-webhook`);
  console.log(`🔑 Using webhook secret: ${WEBHOOK_SECRET.substring(0, 10)}...`);
  console.log('');

  const results = [];

  // Test each event type
  for (const [name, event] of Object.entries(testEvents)) {
    console.log(`\n📝 Testing: ${name}`);
    console.log(`   Event type: ${event.type}`);

    const result = await sendWebhookEvent(event.type, event);
    results.push({ name, ...result });

    // Add delay between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n\n📊 Test Summary');
  console.log('═══════════════════════════════════');

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((r) => {
    const icon = r.success ? '✅' : '❌';
    const status = r.success ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${r.name}: ${status}`);
  });

  console.log('═══════════════════════════════════');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check webhook handlers and database connection.');
    process.exit(1);
  } else {
    console.log('\n✨ All tests passed!');
  }
}

// Check connectivity first
async function checkConnectivity() {
  console.log('🔍 Checking connectivity...\n');

  // Check if API is reachable
  try {
    const response = await fetch(`${API_URL}/api/products`);
    if (response.ok) {
      console.log('✅ API is reachable');
    } else {
      console.log(`⚠️  API returned status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Cannot reach API:', error.message);
    console.error('   Make sure the Next.js dev server is running (pnpm dev)');
    process.exit(1);
  }

  // Check Stripe connection
  try {
    const customer = await stripe.customers.list({ limit: 1 });
    console.log('✅ Stripe API connected');
  } catch (error) {
    console.error('❌ Cannot connect to Stripe:', error.message);
    console.error('   Check your STRIPE_SECRET_KEY');
    process.exit(1);
  }

  console.log('');
}

// Main execution
async function main() {
  console.log('🚀 Stripe Webhook Integration Test\n');

  await checkConnectivity();
  await runTests();
}

// Run the tests
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
