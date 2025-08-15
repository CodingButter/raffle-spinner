#!/usr/bin/env node

/**
 * Add enterprise tier with correct structure
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
  console.log('🔧 Adding Enterprise Tier\n');

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
      console.log('  Current data:', JSON.stringify(checkData.data[0], null, 2));
      return;
    }

    // Add enterprise tier with correct structure
    const enterpriseTier = {
      status: 'published',
      name: 'Enterprise',
      tier_key: 'enterprise',
      max_contestants: null, // null means unlimited
      max_raffles: null, // null means unlimited  
      has_api_support: true,
      has_branding: false, // no DrawDay branding
      has_customization: true,
      sort: 3,
    };

    console.log('\n📝 Creating enterprise tier with:');
    console.log(JSON.stringify(enterpriseTier, null, 2));

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

    const created = await createResponse.json();
    console.log('\n✅ Successfully added enterprise tier');
    console.log('  Created:', JSON.stringify(created.data, null, 2));

    // Verify all tiers
    const allTiersResponse = await fetch(
      `${DIRECTUS_URL}/items/subscription_tiers?sort=sort`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const allTiersData = await allTiersResponse.json();
    const tiers = allTiersData.data || [];
    
    console.log('\n📊 All subscription tiers:');
    console.log('─'.repeat(50));
    tiers.forEach((tier: any, index: number) => {
      console.log(`${index + 1}. ${tier.name} (${tier.tier_key})`);
      console.log(`   - Max Contestants: ${tier.max_contestants || 'Unlimited'}`);
      console.log(`   - Max Raffles: ${tier.max_raffles || 'Unlimited'}`);
      console.log(`   - API Support: ${tier.has_api_support ? 'Yes' : 'No'}`);
      console.log(`   - Customization: ${tier.has_customization ? 'Yes' : 'No'}`);
      console.log(`   - DrawDay Branding: ${tier.has_branding ? 'Yes' : 'No'}`);
      console.log('');
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