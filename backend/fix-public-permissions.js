#!/usr/bin/env node

/**
 * Fix public permissions for singleton collections
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'drawday';

let accessToken = null;

async function authenticate() {
  try {
    const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    accessToken = response.data.data.access_token;
    console.log('✅ Authenticated with Directus');
    return accessToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function fixPublicPermissions() {
  await authenticate();

  console.log('\n🔧 Fixing public permissions...\n');

  const collections = ['homepage', 'features_page', 'demo_page', 'site_settings'];

  for (const collection of collections) {
    try {
      // Create read permission for public role (role = null)
      await axios.post(
        `${DIRECTUS_URL}/permissions`,
        {
          role: null, // null = public role
          collection: collection,
          action: 'read',
          permissions: {},
          validation: {},
          fields: '*',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`✅ Created public read permission for ${collection}`);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
        console.log(`⚠️  Public permission for ${collection} already exists`);
      } else {
        console.error(`❌ Failed to create permission for ${collection}:`, error.response?.data || error.message);
      }
    }
  }

  console.log('\n🧪 Testing public access...\n');

  // Test without authentication
  for (const collection of collections) {
    try {
      const response = await axios.get(`${DIRECTUS_URL}/items/${collection}`);
      console.log(`✅ ${collection} is publicly accessible`);
    } catch (error) {
      console.error(`❌ ${collection} is NOT publicly accessible`);
    }
  }

  console.log('\n✅ Public permissions fixed!');
  console.log('\n📝 You can now access the singletons without authentication:');
  console.log(`  - ${DIRECTUS_URL}/items/homepage`);
  console.log(`  - ${DIRECTUS_URL}/items/features_page`);
  console.log(`  - ${DIRECTUS_URL}/items/demo_page`);
  console.log(`  - ${DIRECTUS_URL}/items/site_settings`);
}

// Run the fix
fixPublicPermissions().catch((error) => {
  console.error('Fix failed:', error);
  process.exit(1);
});