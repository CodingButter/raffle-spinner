#!/usr/bin/env node

/**
 * Fix public permissions for products and related collections
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Speed4Dayz1!';

async function authenticate() {
  console.log('🔐 Authenticating with Directus...');
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data.access_token;
}

async function fixPublicPermissions(token) {
  console.log('🔧 Fixing public permissions...');

  // Get all roles to find the public role
  const rolesResponse = await fetch(`${DIRECTUS_URL}/roles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data: roles } = await rolesResponse.json();
  
  // Find public roles
  const publicRoles = roles.filter(role => role.name === 'Public' || role.id === '2f9ffc88-1ffc-4e20-9013-162aee5fbeda');
  console.log(`Found ${publicRoles.length} public role(s)`);
  
  // Use the specific public role you mentioned
  const publicRole = roles.find(role => role.id === '2f9ffc88-1ffc-4e20-9013-162aee5fbeda');
  
  if (!publicRole) {
    console.log('❌ Public role 2f9ffc88-1ffc-4e20-9013-162aee5fbeda not found');
    return;
  }

  console.log(`Using public role: ${publicRole.name} (${publicRole.id})`);

  // Collections that should be publicly readable
  const publicCollections = [
    'products',
    'product_categories', 
    'tiers'
  ];

  // Get existing permissions for this role
  const permissionsResponse = await fetch(
    `${DIRECTUS_URL}/permissions?filter[role][_eq]=${publicRole.id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const { data: existingPermissions } = await permissionsResponse.json();

  for (const collection of publicCollections) {
    // Check if read permission already exists
    const existingReadPermission = existingPermissions.find(
      p => p.collection === collection && p.action === 'read'
    );

    if (!existingReadPermission) {
      // Create read permission for public role
      const permissionData = {
        role: publicRole.id,
        collection: collection,
        action: 'read',
        permissions: {},
        validation: {},
        presets: null,
        fields: '*'
      };

      try {
        const response = await fetch(`${DIRECTUS_URL}/permissions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(permissionData),
        });

        if (response.ok) {
          console.log(`✅ Added public read permission for ${collection}`);
        } else {
          const error = await response.text();
          console.log(`⚠️ Failed to add permission for ${collection}: ${error}`);
        }
      } catch (error) {
        console.log(`⚠️ Error adding permission for ${collection}:`, error.message);
      }
    } else {
      console.log(`✓ Public read permission already exists for ${collection}`);
    }
  }

  // Remove duplicate public roles if any
  const duplicateRoles = publicRoles.filter(role => role.id !== '2f9ffc88-1ffc-4e20-9013-162aee5fbeda');
  
  if (duplicateRoles.length > 0) {
    console.log(`\n🗑️ Found ${duplicateRoles.length} duplicate public role(s) to remove`);
    
    for (const role of duplicateRoles) {
      try {
        // First delete all permissions for this role
        const rolePermissionsResponse = await fetch(
          `${DIRECTUS_URL}/permissions?filter[role][_eq]=${role.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { data: rolePermissions } = await rolePermissionsResponse.json();
        
        for (const permission of rolePermissions) {
          await fetch(`${DIRECTUS_URL}/permissions/${permission.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        
        // Then delete the role
        const deleteResponse = await fetch(`${DIRECTUS_URL}/roles/${role.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Removed duplicate public role: ${role.name} (${role.id})`);
        } else {
          console.log(`⚠️ Could not remove role ${role.id}: It might be in use`);
        }
      } catch (error) {
        console.log(`⚠️ Error removing role ${role.id}:`, error.message);
      }
    }
  }
}

async function testPublicAccess() {
  console.log('\n🧪 Testing public access...');
  
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/products?limit=1`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Public access to products is working!');
      console.log(`   Found ${data.data?.length || 0} product(s)`);
    } else {
      const error = await response.text();
      console.log('❌ Public access test failed:', error);
    }
  } catch (error) {
    console.log('❌ Error testing public access:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Fixing Public Permissions\n');

    const token = await authenticate();
    console.log('✅ Authentication successful\n');

    await fixPublicPermissions(token);
    
    // Wait a moment for permissions to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPublicAccess();

    console.log('\n✨ Public permissions fix complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };