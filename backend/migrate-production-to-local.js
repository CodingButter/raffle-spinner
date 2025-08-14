#!/usr/bin/env node

/**
 * Migrate Directus collections and data from production to local
 */

const PRODUCTION_URL = 'https://admin.drawday.app';
const LOCAL_URL = 'http://localhost:8055';
const PRODUCTION_EMAIL = 'admin@drawday.app';
const PRODUCTION_PASSWORD = 'Speed4Dayz1!';
const LOCAL_EMAIL = 'admin@drawday.app';
const LOCAL_PASSWORD = 'drawday';

// System collections to skip
const SYSTEM_COLLECTIONS = [
  'directus_activity',
  'directus_collections',
  'directus_dashboards',
  'directus_fields',
  'directus_files',
  'directus_flows',
  'directus_folders',
  'directus_migrations',
  'directus_notifications',
  'directus_operations',
  'directus_panels',
  'directus_permissions',
  'directus_presets',
  'directus_relations',
  'directus_revisions',
  'directus_roles',
  'directus_sessions',
  'directus_settings',
  'directus_shares',
  'directus_translations',
  'directus_users',
  'directus_webhooks'
];

async function authenticate(url, email, password) {
  try {
    const response = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Authentication failed at ${url}: ${error}`);
    }

    const { data } = await response.json();
    return data.access_token;
  } catch (error) {
    console.error(`Failed to authenticate with ${url}:`, error.message);
    throw error;
  }
}

async function apiCall(url, token, endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${url}${endpoint}`, options);
  
  if (!response.ok && response.status !== 409) {
    const error = await response.text();
    console.error(`API Error at ${endpoint}:`, error);
    throw new Error(`API call failed: ${endpoint}`);
  }
  
  return response.json();
}

async function getCollections(url, token) {
  const { data } = await apiCall(url, token, '/collections');
  return data.filter(col => !SYSTEM_COLLECTIONS.includes(col.collection));
}

async function getFields(url, token, collection) {
  const { data } = await apiCall(url, token, `/fields/${collection}`);
  return data;
}

async function getItems(url, token, collection) {
  try {
    const { data } = await apiCall(url, token, `/items/${collection}?limit=-1`);
    return data || [];
  } catch (error) {
    console.log(`No items found in ${collection}`);
    return [];
  }
}

async function createCollection(url, token, collection) {
  try {
    await apiCall(url, token, '/collections', 'POST', {
      collection: collection.collection,
      meta: collection.meta,
      schema: collection.schema
    });
    console.log(`✅ Created collection: ${collection.collection}`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  Collection ${collection.collection} already exists`);
    } else {
      console.error(`❌ Failed to create collection ${collection.collection}:`, error.message);
    }
  }
}

async function createFields(url, token, collection, fields) {
  for (const field of fields) {
    // Skip system fields
    if (field.field === 'id' || field.field === 'user_created' || field.field === 'date_created' || 
        field.field === 'user_updated' || field.field === 'date_updated') {
      continue;
    }

    try {
      await apiCall(url, token, `/fields/${collection}`, 'POST', field);
      console.log(`  ✅ Created field: ${field.field}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ⚠️  Field ${field.field} already exists`);
      } else {
        console.log(`  ❌ Failed to create field ${field.field}`);
      }
    }
  }
}

async function createItems(url, token, collection, items) {
  if (!items || items.length === 0) {
    console.log(`  No items to migrate for ${collection}`);
    return;
  }

  try {
    // Try to create all items at once
    await apiCall(url, token, `/items/${collection}`, 'POST', items);
    console.log(`  ✅ Migrated ${items.length} items`);
  } catch (error) {
    console.log(`  ⚠️  Batch insert failed, trying one by one...`);
    
    // If batch fails, try one by one
    let success = 0;
    let failed = 0;
    
    for (const item of items) {
      try {
        await apiCall(url, token, `/items/${collection}`, 'POST', item);
        success++;
      } catch (err) {
        failed++;
      }
    }
    
    console.log(`  ✅ Migrated ${success} items, ${failed} failed`);
  }
}

async function addUserSubscriptionFields(url, token) {
  console.log('\n📝 Adding subscription fields to directus_users...\n');
  
  const fields = [
    {
      field: 'stripe_customer_id',
      type: 'string',
      meta: {
        interface: 'input',
        options: { font: 'monospace' },
        note: 'Stripe Customer ID',
        readonly: true,
        width: 'half'
      }
    },
    {
      field: 'stripe_subscription_id',
      type: 'string',
      meta: {
        interface: 'input',
        options: { font: 'monospace' },
        note: 'Active Stripe Subscription ID',
        readonly: true,
        width: 'half'
      }
    },
    {
      field: 'subscription_status',
      type: 'string',
      schema: {
        default_value: 'free'
      },
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Free', value: 'free' },
            { text: 'Trialing', value: 'trialing' },
            { text: 'Active', value: 'active' },
            { text: 'Past Due', value: 'past_due' },
            { text: 'Canceled', value: 'canceled' },
            { text: 'Unpaid', value: 'unpaid' }
          ]
        },
        note: 'Current subscription status',
        width: 'half'
      }
    },
    {
      field: 'subscription_tier',
      type: 'string',
      schema: {
        default_value: 'free'
      },
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Free', value: 'free' },
            { text: 'Starter', value: 'starter' },
            { text: 'Professional', value: 'professional' },
            { text: 'Enterprise', value: 'enterprise' }
          ]
        },
        note: 'Current subscription tier',
        width: 'half'
      }
    },
    {
      field: 'subscription_current_period_end',
      type: 'datetime',
      meta: {
        interface: 'datetime',
        note: 'When the current subscription period ends',
        readonly: true
      }
    },
    {
      field: 'subscription_cancel_at_period_end',
      type: 'boolean',
      schema: {
        default_value: false
      },
      meta: {
        interface: 'boolean',
        note: 'Whether subscription will cancel at period end'
      }
    }
  ];

  for (const field of fields) {
    try {
      await apiCall(url, token, '/fields/directus_users', 'POST', field);
      console.log(`✅ Added field: ${field.field}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  Field ${field.field} already exists`);
      } else {
        console.log(`❌ Failed to add field ${field.field}`);
      }
    }
  }
}

async function migrate() {
  console.log('🚀 Starting Directus migration from production to local...\n');

  try {
    // Authenticate with both servers
    console.log('🔐 Authenticating with production...');
    const prodToken = await authenticate(PRODUCTION_URL, PRODUCTION_EMAIL, PRODUCTION_PASSWORD);
    console.log('✅ Authenticated with production\n');

    console.log('🔐 Authenticating with local...');
    const localToken = await authenticate(LOCAL_URL, LOCAL_EMAIL, LOCAL_PASSWORD);
    console.log('✅ Authenticated with local\n');

    // Get collections from production
    console.log('📚 Fetching collections from production...');
    const collections = await getCollections(PRODUCTION_URL, prodToken);
    console.log(`Found ${collections.length} custom collections\n`);

    // Add subscription fields to users first
    await addUserSubscriptionFields(LOCAL_URL, localToken);

    // Migrate each collection
    for (const collection of collections) {
      console.log(`\n📦 Processing collection: ${collection.collection}`);
      
      // Create collection
      await createCollection(LOCAL_URL, localToken, collection);
      
      // Get and create fields
      console.log(`  Fetching fields...`);
      const fields = await getFields(PRODUCTION_URL, prodToken, collection.collection);
      await createFields(LOCAL_URL, localToken, collection.collection, fields);
      
      // Get and migrate items
      console.log(`  Fetching items...`);
      const items = await getItems(PRODUCTION_URL, prodToken, collection.collection);
      await createItems(LOCAL_URL, localToken, collection.collection, items);
    }

    console.log('\n✨ Migration complete!\n');
    console.log('Next steps:');
    console.log('1. Update nginx to point admin.drawday.app to localhost:8055');
    console.log('2. Update apps/website/.env.local to use local Directus');
    console.log('3. Test the application with local data');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrate();