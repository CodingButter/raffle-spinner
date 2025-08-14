#!/usr/bin/env node

/**
 * Setup permissions for Directus collections
 * Configures public and authenticated user access
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

// Get or create public role
async function getPublicRole() {
  try {
    // First, check if public role exists
    const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    let publicRole = rolesResponse.data.data.find(role => role.name === 'Public' || role.public === true);
    
    if (!publicRole) {
      // Create public role
      const createResponse = await axios.post(
        `${DIRECTUS_URL}/roles`,
        {
          name: 'Public',
          icon: 'public',
          public: true,
          description: 'Public access role',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      publicRole = createResponse.data.data;
      console.log('✅ Created Public role');
    } else {
      console.log('✅ Found existing Public role');
    }
    
    publicRoleId = publicRole.id;
    return publicRole;
  } catch (error) {
    console.error('❌ Failed to get/create public role:', error.response?.data || error.message);
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

async function setupPermissions() {
  await authenticate();
  await getPublicRole();

  console.log('\n🔒 Setting up permissions...');

  // Public permissions (no authentication required)
  console.log('\n📢 Setting up public permissions...');
  const publicPermissions = [
    // Read Terms of Service (active only)
    {
      role: publicRoleId,
      collection: 'terms_of_service',
      action: 'read',
      permissions: {
        status: {
          _eq: 'active'
        }
      },
      fields: ['*'],
    },
    // Read Privacy Policy (active only)
    {
      role: publicRoleId,
      collection: 'privacy_policy',
      action: 'read',
      permissions: {
        status: {
          _eq: 'active'
        }
      },
      fields: ['*'],
    },
    // Create contact submissions
    {
      role: publicRoleId,
      collection: 'contact_submissions',
      action: 'create',
      permissions: {},
      fields: ['name', 'email', 'subject', 'message'],
    },
  ];

  for (const permission of publicPermissions) {
    await createPermission(permission);
  }

  // Authenticated user permissions
  console.log('\n🔐 Setting up authenticated user permissions...');
  
  // Note: For authenticated users, we'll use Directus's built-in $CURRENT_USER variable
  // This requires setting up permissions for the default user role
  
  // Get the default user role
  const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  // Find the default user role (usually created by Directus)
  let userRole = rolesResponse.data.data.find(role => 
    role.name === 'User' || 
    (role.name !== 'Administrator' && role.name !== 'Public' && !role.public)
  );

  if (!userRole) {
    // Create a user role
    const createResponse = await axios.post(
      `${DIRECTUS_URL}/roles`,
      {
        name: 'User',
        icon: 'person',
        description: 'Authenticated users',
        app_access: true,
        admin_access: false,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    userRole = createResponse.data.data;
    console.log('✅ Created User role');
  } else {
    console.log('✅ Found existing User role');
  }

  const userPermissions = [
    // Users can read their own subscriptions
    {
      role: userRole.id,
      collection: 'subscriptions',
      action: 'read',
      permissions: {
        user: {
          _eq: '$CURRENT_USER'
        }
      },
      fields: ['*'],
    },
    // Users can read their own user data
    {
      role: userRole.id,
      collection: 'directus_users',
      action: 'read',
      permissions: {
        id: {
          _eq: '$CURRENT_USER'
        }
      },
      fields: ['id', 'first_name', 'last_name', 'email', 'avatar', 'description', 'location', 'title', 'language'],
    },
    // Users can update their own profile
    {
      role: userRole.id,
      collection: 'directus_users',
      action: 'update',
      permissions: {
        id: {
          _eq: '$CURRENT_USER'
        }
      },
      fields: ['first_name', 'last_name', 'avatar', 'description', 'location', 'title', 'language'],
    },
  ];

  for (const permission of userPermissions) {
    await createPermission(permission);
  }

  // Assign the User role to our test users
  console.log('\n👥 Assigning User role to test users...');
  const testEmails = ['free@drawday.app', 'pro@drawday.app', 'trial@drawday.app'];
  
  for (const email of testEmails) {
    try {
      // Get user
      const userResponse = await axios.get(
        `${DIRECTUS_URL}/users?filter[email][_eq]=${email}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      if (userResponse.data.data.length > 0) {
        const user = userResponse.data.data[0];
        
        // Update user role
        await axios.patch(
          `${DIRECTUS_URL}/users/${user.id}`,
          { role: userRole.id },
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        console.log(`  ✅ Assigned User role to ${email}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to assign role to ${email}:`, error.response?.data || error.message);
    }
  }

  console.log('\n✅ Permissions setup completed!');
  console.log('\n📝 Permission Summary:');
  console.log('  Public users can:');
  console.log('    - Read active Terms of Service');
  console.log('    - Read active Privacy Policy');
  console.log('    - Submit contact forms');
  console.log('  Authenticated users can:');
  console.log('    - Read their own subscriptions');
  console.log('    - Read and update their own profile');
}

// Run the setup
setupPermissions().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});