#!/usr/bin/env node

/**
 * Inspect database structure to understand the schema
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app';
const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Speed4Dayz1!';

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
    throw new Error(`Failed to authenticate: ${response.status}`);
  }

  const data = await response.json();
  return data.data.access_token;
}

async function inspectDatabase() {
  console.log('🔍 Inspecting Database Structure\n');

  try {
    const token = await getAdminToken();
    console.log('✅ Authenticated with Directus\n');

    // 1. Check subscription_tiers structure
    console.log('📊 Subscription Tiers Collection:');
    console.log('─'.repeat(50));
    
    const tiersFieldsResponse = await fetch(`${DIRECTUS_URL}/fields/subscription_tiers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (tiersFieldsResponse.ok) {
      const tiersFields = await tiersFieldsResponse.json();
      console.log('Fields:');
      tiersFields.data.forEach((field: any) => {
        console.log(`  - ${field.field} (${field.type})`);
      });
    } else {
      console.log('❌ subscription_tiers collection not found');
    }

    // Get actual tier data
    const tiersResponse = await fetch(`${DIRECTUS_URL}/items/subscription_tiers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (tiersResponse.ok) {
      const tiersData = await tiersResponse.json();
      console.log('\nExisting tiers:');
      tiersData.data.forEach((tier: any) => {
        console.log(`  - ${JSON.stringify(tier, null, 2)}`);
      });
    }

    // 2. Check subscriptions structure
    console.log('\n\n📊 Subscriptions Collection:');
    console.log('─'.repeat(50));
    
    const subsFieldsResponse = await fetch(`${DIRECTUS_URL}/fields/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (subsFieldsResponse.ok) {
      const subsFields = await subsFieldsResponse.json();
      console.log('Fields:');
      subsFields.data.forEach((field: any) => {
        console.log(`  - ${field.field} (${field.type})`);
      });
    } else {
      console.log('❌ subscriptions collection not found');
    }

    // 3. Check products structure
    console.log('\n\n📊 Products Collection:');
    console.log('─'.repeat(50));
    
    const productsFieldsResponse = await fetch(`${DIRECTUS_URL}/fields/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (productsFieldsResponse.ok) {
      const productsFields = await productsFieldsResponse.json();
      console.log('Fields:');
      productsFields.data.forEach((field: any) => {
        console.log(`  - ${field.field} (${field.type})`);
      });
    } else {
      console.log('❌ products collection not found');
    }

    // 4. Check users structure (subscription fields)
    console.log('\n\n📊 Users Collection (subscription fields):');
    console.log('─'.repeat(50));
    
    const usersFieldsResponse = await fetch(`${DIRECTUS_URL}/fields/directus_users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (usersFieldsResponse.ok) {
      const usersFields = await usersFieldsResponse.json();
      const subFields = usersFields.data.filter((f: any) => 
        f.field.includes('stripe') || f.field.includes('subscription')
      );
      console.log('Subscription-related fields:');
      subFields.forEach((field: any) => {
        console.log(`  - ${field.field} (${field.type})`);
      });
    }

    // 5. Check for webhook_errors collection
    console.log('\n\n📊 Webhook Errors Collection:');
    console.log('─'.repeat(50));
    
    const errorsFieldsResponse = await fetch(`${DIRECTUS_URL}/fields/webhook_errors`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (errorsFieldsResponse.ok) {
      const errorsFields = await errorsFieldsResponse.json();
      console.log('Fields:');
      errorsFields.data.forEach((field: any) => {
        console.log(`  - ${field.field} (${field.type})`);
      });
    } else {
      console.log('❌ webhook_errors collection not found (optional)');
    }

    // 6. Get sample users with subscriptions
    console.log('\n\n📊 Sample Users with Subscriptions:');
    console.log('─'.repeat(50));
    
    const usersResponse = await fetch(
      `${DIRECTUS_URL}/users?filter[stripe_subscription_id][_nnull]=true&limit=3`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      if (usersData.data.length > 0) {
        usersData.data.forEach((user: any) => {
          console.log(`\nUser: ${user.email}`);
          console.log(`  - stripe_customer_id: ${user.stripe_customer_id || 'none'}`);
          console.log(`  - stripe_subscription_id: ${user.stripe_subscription_id || 'none'}`);
          console.log(`  - subscription_tier: ${user.subscription_tier || 'none'}`);
          console.log(`  - subscription_status: ${user.subscription_status || 'none'}`);
        });
      } else {
        console.log('No users with subscriptions found');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run inspection
inspectDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});