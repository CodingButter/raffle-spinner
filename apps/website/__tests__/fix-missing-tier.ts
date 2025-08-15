#!/usr/bin/env node

/**
 * Fix missing enterprise tier in database
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

async function addEnterpriseTier() {
  console.log('🔧 Adding missing enterprise tier...\n');

  try {
    const token = await getAdminToken();
    console.log('✅ Authenticated with Directus');

    // Check if enterprise tier already exists
    const checkResponse = await fetch(
      `${DIRECTUS_URL}/items/subscription_tiers?filter[tier_key][_eq]=enterprise`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const checkData = await checkResponse.json();
    if (checkData.data && checkData.data.length > 0) {
      console.log('ℹ️ Enterprise tier already exists');
      return;
    }

    // Add enterprise tier
    const enterpriseTier = {
      tier_key: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      price_monthly: 199.99,
      price_yearly: 1999.99,
      raffle_limit: -1, // unlimited
      contestant_limit: -1, // unlimited
      features: {
        unlimitedRaffles: true,
        unlimitedContestants: true,
        advancedCustomization: true,
        prioritySupport: true,
        apiAccess: true,
        whiteLabel: true,
        dedicatedAccountManager: true,
        customIntegrations: true,
        sla: true,
      },
      is_active: true,
      sort_order: 3,
    };

    const createResponse = await fetch(`${DIRECTUS_URL}/items/subscription_tiers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enterpriseTier),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create tier: ${error}`);
    }

    console.log('✅ Successfully added enterprise tier');

    // Verify all tiers
    const allTiersResponse = await fetch(`${DIRECTUS_URL}/items/subscription_tiers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const allTiersData = await allTiersResponse.json();
    const tiers = allTiersData.data || [];
    
    console.log('\n📊 Current subscription tiers:');
    tiers.forEach((tier: any) => {
      console.log(`  - ${tier.tier_key}: ${tier.name} ($${tier.price_monthly}/mo)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the fix
addEnterpriseTier().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});