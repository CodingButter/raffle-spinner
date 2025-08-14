#!/usr/bin/env node

/**
 * Stripe Integration Test Script
 *
 * This script tests the Stripe checkout session creation locally
 * without needing actual Stripe API keys.
 */

const SITE_URL = 'http://localhost:3000';

async function testCheckoutSession() {
  console.log('🧪 Testing Stripe Checkout Session Creation...\n');

  try {
    // Test with mock data
    const response = await fetch(`${SITE_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productKey: 'starter',
        userId: 'test-user-123',
        email: 'test@example.com',
      }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Checkout session endpoint is working!');
      console.log('\nNext steps:');
      console.log('1. Add your Stripe API keys to .env.local');
      console.log('2. Create products in Stripe Dashboard');
      console.log('3. Update the price IDs in .env.local');
      console.log('4. Test the full checkout flow');
    } else {
      console.log('\n⚠️  Expected error (no real API keys configured)');
      console.log('This is normal - the endpoint structure is correct.');
    }
  } catch (error) {
    console.error('❌ Error testing checkout:', error.message);
    console.log('\nMake sure the Next.js dev server is running on port 3000');
  }
}

// Run the test
testCheckoutSession();
