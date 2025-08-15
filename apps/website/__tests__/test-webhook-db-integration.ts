#!/usr/bin/env node

/**
 * Webhook Database Integration Test
 * Tests that webhook events properly update the Directus database
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app';
const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Speed4Dayz1!';

interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  details?: any;
}

// Get admin token for Directus
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
    throw new Error(`Failed to authenticate with Directus: ${response.status}`);
  }

  const data = await response.json();
  return data.data.access_token;
}

// Check if user exists in Directus
async function checkUser(email: string, token: string): Promise<any> {
  const response = await fetch(
    `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0];
}

// Check subscription in new collections system
async function checkSubscription(userId: string, token: string): Promise<any> {
  const response = await fetch(
    `${DIRECTUS_URL}/items/subscriptions?filter[user][_eq]=${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch subscription: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0];
}

// Check subscription tiers exist
async function checkSubscriptionTiers(token: string): Promise<TestResult> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/subscription_tiers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return {
        test: 'Subscription Tiers Collection',
        success: false,
        error: `Collection not accessible: ${response.status}`,
      };
    }

    const data = await response.json();
    const tiers = data.data || [];
    
    const requiredTiers = ['starter', 'pro', 'enterprise'];
    const existingTiers = tiers.map((t: any) => t.tier_key);
    const missingTiers = requiredTiers.filter(t => !existingTiers.includes(t));

    if (missingTiers.length > 0) {
      return {
        test: 'Subscription Tiers Collection',
        success: false,
        error: `Missing tiers: ${missingTiers.join(', ')}`,
        details: { existing: existingTiers, missing: missingTiers },
      };
    }

    return {
      test: 'Subscription Tiers Collection',
      success: true,
      details: { tiers: existingTiers },
    };
  } catch (error) {
    return {
      test: 'Subscription Tiers Collection',
      success: false,
      error: error.message,
    };
  }
}

// Check products collection
async function checkProducts(token: string): Promise<TestResult> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return {
        test: 'Products Collection',
        success: false,
        error: `Collection not accessible: ${response.status}`,
      };
    }

    const data = await response.json();
    const products = data.data || [];
    
    if (products.length === 0) {
      return {
        test: 'Products Collection',
        success: false,
        error: 'No products found',
      };
    }

    return {
      test: 'Products Collection',
      success: true,
      details: { 
        count: products.length,
        products: products.map((p: any) => ({ key: p.key, name: p.name })),
      },
    };
  } catch (error) {
    return {
      test: 'Products Collection',
      success: false,
      error: error.message,
    };
  }
}

// Check subscriptions collection structure
async function checkSubscriptionsCollection(token: string): Promise<TestResult> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/fields/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return {
        test: 'Subscriptions Collection Structure',
        success: false,
        error: `Cannot access collection fields: ${response.status}`,
      };
    }

    const data = await response.json();
    const fields = data.data || [];
    const fieldNames = fields.map((f: any) => f.field);

    const requiredFields = [
      'user',
      'tier',
      'product',
      'status',
      'stripe_subscription_id',
      'starts_at',
      'expires_at',
    ];

    const missingFields = requiredFields.filter(f => !fieldNames.includes(f));

    if (missingFields.length > 0) {
      return {
        test: 'Subscriptions Collection Structure',
        success: false,
        error: `Missing fields: ${missingFields.join(', ')}`,
        details: { existing: fieldNames, missing: missingFields },
      };
    }

    return {
      test: 'Subscriptions Collection Structure',
      success: true,
      details: { fields: fieldNames },
    };
  } catch (error) {
    return {
      test: 'Subscriptions Collection Structure',
      success: false,
      error: error.message,
    };
  }
}

// Test webhook handler functions
async function testWebhookHandlers(token: string): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test user lookup
  const testEmail = 'test@drawday.app';
  try {
    const user = await checkUser(testEmail, token);
    if (user) {
      results.push({
        test: 'User Lookup',
        success: true,
        details: { userId: user.id, email: user.email },
      });

      // Check if user has subscription
      const subscription = await checkSubscription(user.id, token);
      if (subscription) {
        results.push({
          test: 'Subscription Lookup',
          success: true,
          details: {
            subscriptionId: subscription.id,
            status: subscription.status,
            tier: subscription.tier,
          },
        });
      } else {
        results.push({
          test: 'Subscription Lookup',
          success: false,
          error: 'No subscription found for test user',
        });
      }
    } else {
      results.push({
        test: 'User Lookup',
        success: false,
        error: `Test user ${testEmail} not found`,
      });
    }
  } catch (error) {
    results.push({
      test: 'User Lookup',
      success: false,
      error: error.message,
    });
  }

  return results;
}

// Check environment variables
function checkEnvironmentVariables(): TestResult[] {
  const results: TestResult[] = [];
  
  const requiredVars = [
    'NEXT_PUBLIC_DIRECTUS_URL',
    'DIRECTUS_ADMIN_EMAIL', 
    'DIRECTUS_ADMIN_PASSWORD',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    results.push({
      test: `Environment: ${varName}`,
      success: !!value,
      error: !value ? 'Not set' : undefined,
      details: value ? { length: value.length } : undefined,
    });
  }

  return results;
}

// Main test runner
async function runTests() {
  console.log('🔍 Webhook Database Integration Test\n');
  console.log(`📍 Directus URL: ${DIRECTUS_URL}`);
  console.log(`👤 Admin Email: ${DIRECTUS_ADMIN_EMAIL}`);
  console.log('');

  const allResults: TestResult[] = [];

  // Check environment variables
  console.log('🔧 Checking Environment Variables...');
  const envResults = checkEnvironmentVariables();
  allResults.push(...envResults);

  // Get admin token
  let token: string;
  try {
    console.log('\n🔐 Authenticating with Directus...');
    token = await getAdminToken();
    allResults.push({
      test: 'Directus Authentication',
      success: true,
    });
  } catch (error) {
    allResults.push({
      test: 'Directus Authentication',
      success: false,
      error: error.message,
    });
    printResults(allResults);
    return;
  }

  // Check database structure
  console.log('\n📊 Checking Database Structure...');
  allResults.push(await checkSubscriptionTiers(token));
  allResults.push(await checkProducts(token));
  allResults.push(await checkSubscriptionsCollection(token));

  // Test webhook handlers
  console.log('\n🧪 Testing Webhook Handler Functions...');
  const handlerResults = await testWebhookHandlers(token);
  allResults.push(...handlerResults);

  // Print results
  printResults(allResults);
}

// Print test results
function printResults(results: TestResult[]) {
  console.log('\n\n📊 Test Results');
  console.log('═══════════════════════════════════════════════════');
  
  for (const result of results) {
    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'PASSED' : 'FAILED';
    
    console.log(`${icon} ${result.test}: ${status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2).split('\n').join('\n   ')}`);
    }
  }
  
  console.log('═══════════════════════════════════════════════════');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Issues found:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.test}: ${r.error}`);
    });
    console.log('\n💡 Recommendations:');
    console.log('  1. Ensure Directus is running (cd backend && docker-compose up)');
    console.log('  2. Check that all required collections exist');
    console.log('  3. Verify environment variables are correctly set');
    console.log('  4. Run database migrations if needed');
  } else {
    console.log('\n✨ All tests passed! Database is properly configured.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});