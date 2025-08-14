#!/usr/bin/env node

/**
 * Sync Directus data from production to local
 * This script will clear existing data and replace with production data
 */

const PRODUCTION_URL = 'https://admin.drawday.app';
const LOCAL_URL = 'http://localhost:8055';
const PRODUCTION_EMAIL = 'admin@drawday.app';
const PRODUCTION_PASSWORD = 'Speed4Dayz1!';
const LOCAL_EMAIL = 'admin@drawday.app';
const LOCAL_PASSWORD = 'drawday';

// Collections to sync (in order)
const COLLECTIONS_TO_SYNC = [
  'products',
  'product_categories',
  'product_tiers',
  'subscriptions',
  'subscription_tiers',
  'subscription_features',
  'testimonials',
  'faqs',
  'features',
  'careers',
  'company_info',
  'team_members',
  'blog_posts',
  'privacy_policy'
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
  const responseText = await response.text();
  
  try {
    const data = JSON.parse(responseText);
    
    if (!response.ok && response.status !== 404) {
      if (response.status === 409 || (data.errors && data.errors[0].message.includes('already exists'))) {
        // Resource already exists, not a critical error
        return { exists: true, data };
      }
      throw new Error(data.errors ? data.errors[0].message : 'Unknown error');
    }
    
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      if (response.ok) {
        return { success: true };
      }
      throw new Error(`Invalid response from ${endpoint}: ${responseText}`);
    }
    throw error;
  }
}

async function getCollectionInfo(url, token, collection) {
  try {
    const response = await apiCall(url, token, `/collections/${collection}`);
    return response.data;
  } catch (error) {
    console.log(`Collection ${collection} not found in source`);
    return null;
  }
}

async function getFields(url, token, collection) {
  try {
    const response = await apiCall(url, token, `/fields/${collection}`);
    return response.data || [];
  } catch (error) {
    console.log(`No fields found for ${collection}`);
    return [];
  }
}

async function getItems(url, token, collection) {
  try {
    const response = await apiCall(url, token, `/items/${collection}?limit=-1`);
    return response.data || [];
  } catch (error) {
    console.log(`No items found in ${collection}`);
    return [];
  }
}

async function deleteAllItems(url, token, collection) {
  try {
    // Get all items
    const items = await getItems(url, token, collection);
    if (items.length === 0) return;
    
    // Delete all items
    const ids = items.map(item => item.id);
    await apiCall(url, token, `/items/${collection}`, 'DELETE', ids);
    console.log(`  🗑️  Cleared ${items.length} existing items`);
  } catch (error) {
    console.log(`  ⚠️  Could not clear items: ${error.message}`);
  }
}

async function ensureCollection(url, token, collection, collectionInfo) {
  try {
    // Check if collection exists
    const existing = await apiCall(url, token, `/collections/${collection}`);
    if (existing && !existing.exists) {
      console.log(`  ✅ Collection exists`);
      return true;
    }
  } catch (error) {
    // Collection doesn't exist, create it
  }

  try {
    // Create collection with minimal schema
    await apiCall(url, token, '/collections', 'POST', {
      collection: collection,
      meta: collectionInfo?.meta || {
        collection: collection,
        icon: 'folder',
        note: null,
        display_template: null,
        hidden: false,
        singleton: false,
        archive_field: null,
        archive_app_filter: true,
        archive_value: null,
        unarchive_value: null,
        sort_field: null
      }
    });
    console.log(`  ✅ Created collection`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`  ✅ Collection already exists`);
      return true;
    }
    console.log(`  ❌ Failed to create collection: ${error.message}`);
    return false;
  }
}

async function syncFields(prodUrl, prodToken, localUrl, localToken, collection) {
  const prodFields = await getFields(prodUrl, prodToken, collection);
  
  for (const field of prodFields) {
    // Skip system fields
    if (['id', 'user_created', 'date_created', 'user_updated', 'date_updated'].includes(field.field)) {
      continue;
    }

    try {
      // Create field with proper type
      const fieldData = {
        field: field.field,
        type: field.type,
        meta: field.meta
      };
      
      // Add schema if present
      if (field.schema) {
        fieldData.schema = field.schema;
      }

      await apiCall(localUrl, localToken, `/fields/${collection}`, 'POST', fieldData);
      console.log(`  ✅ Created field: ${field.field}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        // Field exists, try to update it
        try {
          await apiCall(localUrl, localToken, `/fields/${collection}/${field.field}`, 'PATCH', {
            meta: field.meta
          });
          console.log(`  ✅ Updated field: ${field.field}`);
        } catch (updateError) {
          console.log(`  ⚠️  Field ${field.field} already configured`);
        }
      } else {
        console.log(`  ❌ Failed to create field ${field.field}: ${error.message}`);
      }
    }
  }
}

async function syncItems(prodUrl, prodToken, localUrl, localToken, collection) {
  const items = await getItems(prodUrl, prodToken, collection);
  
  if (items.length === 0) {
    console.log(`  No items to sync`);
    return;
  }

  // Clear existing items first
  await deleteAllItems(localUrl, localToken, collection);

  // Insert new items
  let success = 0;
  let failed = 0;

  for (const item of items) {
    try {
      // Remove id field to let local generate new ones
      const itemCopy = { ...item };
      delete itemCopy.id;
      
      await apiCall(localUrl, localToken, `/items/${collection}`, 'POST', itemCopy);
      success++;
    } catch (error) {
      console.log(`  ⚠️  Failed to sync item: ${error.message}`);
      failed++;
    }
  }

  console.log(`  ✅ Synced ${success} items${failed > 0 ? `, ${failed} failed` : ''}`);
}

async function addUserSubscriptionFields(url, token) {
  console.log('\n📝 Configuring user subscription fields...\n');
  
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
      type: 'timestamp',
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
      await apiCall(url, token, `/fields/directus_users`, 'POST', field);
      console.log(`✅ Added field: ${field.field}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  Field ${field.field} already exists`);
      } else {
        console.log(`❌ Failed to add field ${field.field}: ${error.message}`);
      }
    }
  }
}

async function sync() {
  console.log('🚀 Starting Directus sync from production to local...\n');

  try {
    // Authenticate
    console.log('🔐 Authenticating...');
    const prodToken = await authenticate(PRODUCTION_URL, PRODUCTION_EMAIL, PRODUCTION_PASSWORD);
    const localToken = await authenticate(LOCAL_URL, LOCAL_EMAIL, LOCAL_PASSWORD);
    console.log('✅ Authentication successful\n');

    // Add user subscription fields
    await addUserSubscriptionFields(LOCAL_URL, localToken);

    // Sync each collection
    console.log('\n📦 Syncing collections...\n');
    
    for (const collection of COLLECTIONS_TO_SYNC) {
      console.log(`\n🔄 Syncing: ${collection}`);
      
      // Get collection info from production
      const collectionInfo = await getCollectionInfo(PRODUCTION_URL, prodToken, collection);
      
      if (!collectionInfo) {
        console.log(`  ⚠️  Collection not found in production, skipping`);
        continue;
      }
      
      // Ensure collection exists locally
      const created = await ensureCollection(LOCAL_URL, localToken, collection, collectionInfo);
      
      if (!created) {
        console.log(`  ⚠️  Skipping due to collection creation failure`);
        continue;
      }
      
      // Sync fields
      console.log(`  Syncing fields...`);
      await syncFields(PRODUCTION_URL, prodToken, LOCAL_URL, localToken, collection);
      
      // Sync items
      console.log(`  Syncing items...`);
      await syncItems(PRODUCTION_URL, prodToken, LOCAL_URL, localToken, collection);
    }

    console.log('\n✨ Sync complete!\n');
    console.log('Local Directus is now synced with production data.');
    console.log('\nAccess your local Directus at: http://localhost:8055/admin');
    console.log('Login with: admin@drawday.app / drawday');

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

// Run sync
sync();