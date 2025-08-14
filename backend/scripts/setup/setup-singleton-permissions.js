#!/usr/bin/env node

/**
 * Setup permissions for singleton collections
 * Allow public read access to website content
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'drawday';

let accessToken = null;
let publicRoleId = null;

// Authenticate with Directus
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

// Get public role
async function getPublicRole() {
  try {
    const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const publicRole = rolesResponse.data.data.find(role => 
      role.name === 'Public' || role.public === true
    );
    
    if (publicRole) {
      publicRoleId = publicRole.id;
      console.log('✅ Found Public role');
      return publicRole;
    } else {
      console.error('❌ Public role not found');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to get public role:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Create permission
async function createPermission(permission) {
  try {
    await axios.post(
      `${DIRECTUS_URL}/permissions`,
      permission,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    console.log(`  ✅ Created permission: ${permission.collection} - ${permission.action}`);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`  ⚠️  Permission might already exist: ${permission.collection} - ${permission.action}`);
    } else {
      console.error(`  ❌ Failed to create permission:`, error.response?.data || error.message);
    }
  }
}

async function setupSingletonPermissions() {
  await authenticate();
  await getPublicRole();

  console.log('\n🔒 Setting up singleton permissions...');

  // Public permissions for singletons
  const singletonCollections = [
    'homepage',
    'features_page',
    'demo_page',
    'site_settings',
  ];

  console.log('\n📢 Setting up public read access for singletons...');
  
  for (const collection of singletonCollections) {
    await createPermission({
      role: publicRoleId,
      collection: collection,
      action: 'read',
      permissions: {},
      fields: ['*'],
    });
  }

  console.log('\n✅ Singleton permissions setup completed!');
  console.log('\nPublic users can now read:');
  console.log('  - Homepage content');
  console.log('  - Features page content');
  console.log('  - Demo page content');
  console.log('  - Site settings');
}

// Run the setup
setupSingletonPermissions().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});