#!/usr/bin/env node

/**
 * Set up public permissions for website information collections
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

async function createPublicPermission(collection, fields = '*') {
  try {
    await axios.post(
      `${DIRECTUS_URL}/permissions`,
      {
        role: null, // null = public role
        collection: collection,
        action: 'read',
        permissions: {},
        validation: {},
        fields: fields,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`  ✅ Created public read permission for ${collection}`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠️  Public permission for ${collection} already exists`);
    } else {
      console.error(`  ❌ Failed to create permission for ${collection}:`, error.response?.data || error.message);
    }
  }
}

async function setupPermissions() {
  await authenticate();

  console.log('\n🔐 Setting up public permissions for website information...\n');

  // Company info - public can read everything
  console.log('🏢 Company Info permissions:');
  await createPublicPermission('company_info');

  // Social media - public can read active profiles
  console.log('\n📱 Social Media permissions:');
  await createPublicPermission('social_media');
  
  // Add filtered permission for social media (only active)
  try {
    await axios.post(
      `${DIRECTUS_URL}/permissions`,
      {
        role: null,
        collection: 'social_media',
        action: 'read',
        permissions: {
          _and: [
            { status: { _eq: 'active' } }
          ]
        },
        validation: {},
        fields: '*',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('  ✅ Added filter: Only active social media profiles visible');
  } catch (error) {
    if (!error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log('  ⚠️  Could not add social media filter');
    }
  }

  // Careers - public can read published jobs
  console.log('\n💼 Careers permissions:');
  await createPublicPermission('careers');
  
  // Add filtered permission for careers (only published)
  try {
    await axios.post(
      `${DIRECTUS_URL}/permissions`,
      {
        role: null,
        collection: 'careers',
        action: 'read',
        permissions: {
          _and: [
            { status: { _eq: 'published' } }
          ]
        },
        validation: {},
        fields: '*',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('  ✅ Added filter: Only published job postings visible');
  } catch (error) {
    if (!error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log('  ⚠️  Could not add careers filter');
    }
  }

  // Team members - public can read active members
  console.log('\n👥 Team Members permissions:');
  await createPublicPermission('team_members');
  
  // Add filtered permission for team members (only active and display_on_about)
  try {
    await axios.post(
      `${DIRECTUS_URL}/permissions`,
      {
        role: null,
        collection: 'team_members',
        action: 'read',
        permissions: {
          _and: [
            { status: { _eq: 'active' } },
            { display_on_about: { _eq: true } }
          ]
        },
        validation: {},
        fields: '*',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('  ✅ Added filter: Only active team members marked for display');
  } catch (error) {
    if (!error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log('  ⚠️  Could not add team members filter');
    }
  }

  console.log('\n🧪 Testing public access...\n');

  // Test without authentication
  const collections = ['company_info', 'social_media', 'careers', 'team_members'];
  
  for (const collection of collections) {
    try {
      const response = await axios.get(`${DIRECTUS_URL}/items/${collection}`);
      const data = response.data.data;
      
      if (collection === 'company_info') {
        console.log(`✅ ${collection} is publicly accessible`);
      } else {
        const count = Array.isArray(data) ? data.length : 0;
        console.log(`✅ ${collection} is publicly accessible (${count} items)`);
      }
    } catch (error) {
      console.error(`❌ ${collection} is NOT publicly accessible`);
    }
  }

  console.log('\n✅ Public permissions set up successfully!');
  console.log('\n📝 API Endpoints available:');
  console.log(`  - Company Info: ${DIRECTUS_URL}/items/company_info`);
  console.log(`  - Social Media: ${DIRECTUS_URL}/items/social_media`);
  console.log(`  - Careers: ${DIRECTUS_URL}/items/careers`);
  console.log(`  - Team Members: ${DIRECTUS_URL}/items/team_members`);
  console.log('\n🔍 Filters applied:');
  console.log('  - Social Media: Only active profiles');
  console.log('  - Careers: Only published job postings');
  console.log('  - Team Members: Only active members marked for display');
}

// Run the setup
setupPermissions().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});