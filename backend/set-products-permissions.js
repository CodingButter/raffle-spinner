#!/usr/bin/env node

/**
 * Set public read permissions for products collection
 * This allows the website to fetch products without authentication
 */

const API_URL = 'http://localhost:8055';
const EMAIL = 'admin@drawday.app';
const PASSWORD = 'Speed4Dayz1!';

async function setProductsPermissions() {
  try {
    // Authenticate
    console.log('🔐 Authenticating...');
    const authResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    const { data: authData } = await authResponse.json();
    const token = authData.access_token;
    console.log('✅ Authenticated\n');

    // Get the public role
    console.log('🔍 Finding public role...');
    const rolesResponse = await fetch(`${API_URL}/roles?filter[name][_eq]=Public`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const { data: roles } = await rolesResponse.json();
    
    if (!roles || roles.length === 0) {
      throw new Error('Public role not found');
    }
    
    const publicRole = roles[0];
    console.log(`✅ Found public role: ${publicRole.id}\n`);

    // Check if permission already exists
    const existingPermsResponse = await fetch(
      `${API_URL}/permissions?filter[role][_eq]=${publicRole.id}&filter[collection][_eq]=products&filter[action][_eq]=read`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const { data: existingPerms } = await existingPermsResponse.json();

    if (existingPerms && existingPerms.length > 0) {
      console.log('⚠️  Read permission already exists for products\n');
    } else {
      // Create read permission for public role on products
      console.log('📝 Creating public read permission for products...');
      const permissionResponse = await fetch(`${API_URL}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: publicRole.id,
          collection: 'products',
          action: 'read',
          permissions: {
            _and: [
              {
                status: {
                  _eq: 'published'
                }
              }
            ]
          },
          fields: '*'
        })
      });

      if (permissionResponse.ok) {
        console.log('✅ Public read permission created for products\n');
      } else {
        const error = await permissionResponse.text();
        console.log('❌ Failed to create permission:', error, '\n');
      }
    }

    // Test public access
    console.log('🧪 Testing public access...');
    const testResponse = await fetch(`${API_URL}/items/products?filter[status][_eq]=published&limit=1`);
    
    if (testResponse.ok) {
      const { data: testData } = await testResponse.json();
      console.log(`✅ Public access works! Found ${testData.length} product(s)\n`);
    } else {
      console.log('❌ Public access test failed\n');
    }

    console.log('🎉 Products permissions configured!');
    console.log('\nThe website can now fetch products without authentication.');
    console.log('\nIn Directus Admin:');
    console.log('1. Go to Settings > Roles & Permissions > Public');
    console.log('2. You should see Products with Read permission');
    console.log('3. Only published products are visible publicly\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setProductsPermissions();