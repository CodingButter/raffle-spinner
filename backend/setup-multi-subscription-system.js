#!/usr/bin/env node

/**
 * Setup Multi-Product, Multi-Subscription System
 * 
 * This script:
 * 1. Updates the products collection to support multiple product types
 * 2. Creates a proper subscriptions collection with user relationships
 * 3. Migrates existing subscription data from users to subscriptions collection
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

async function updateProductsCollection(token) {
  console.log('📦 Updating products collection structure...');

  // First, check if product_type field exists
  const fieldsResponse = await fetch(`${DIRECTUS_URL}/fields/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const existingFields = await fieldsResponse.json();
  const hasProductType = existingFields.data?.some(field => field.field === 'product_type');

  if (!hasProductType) {
    // Add product_type field
    const productTypeField = {
      field: 'product_type',
      type: 'string',
      schema: {
        is_nullable: false,
        default_value: 'spinner',
      },
      meta: {
        interface: 'select-dropdown',
        display: 'labels',
        display_options: {
          choices: [
            { text: 'Spinner', value: 'spinner', foreground: '#6B46C1', background: '#F3E8FF' },
            { text: 'Website', value: 'website', foreground: '#2563EB', background: '#DBEAFE' },
            { text: 'Streaming', value: 'streaming', foreground: '#059669', background: '#D1FAE5' },
          ],
        },
        options: {
          choices: [
            { text: 'Spinner', value: 'spinner' },
            { text: 'Website', value: 'website' },
            { text: 'Streaming', value: 'streaming' },
          ],
        },
        note: 'The type of product this is',
      },
    };

    await fetch(`${DIRECTUS_URL}/fields/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productTypeField),
    });

    console.log('✅ Added product_type field');
  }

  // Update existing products to have product_type = 'spinner'
  const productsResponse = await fetch(`${DIRECTUS_URL}/items/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const productsData = await productsResponse.json();
  const products = productsData.data || [];

  for (const product of products) {
    if (!product.product_type) {
      await fetch(`${DIRECTUS_URL}/items/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_type: 'spinner',
          key: `spinner_${product.key}`, // Update key to include product type
        }),
      });
      console.log(`✅ Updated product: ${product.name} to spinner type`);
    }
  }
}

async function createSubscriptionsCollection(token) {
  console.log('📊 Creating/updating subscriptions collection...');

  // Check if collection exists
  const collectionsResponse = await fetch(`${DIRECTUS_URL}/collections`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const collections = await collectionsResponse.json();
  const subscriptionExists = collections.data?.some(col => col.collection === 'subscriptions');

  if (!subscriptionExists) {
    // Create subscriptions collection
    const subscriptionCollection = {
      collection: 'subscriptions',
      meta: {
        singleton: false,
        icon: 'credit_card',
        display_template: '{{user.email}} - {{product.name}}',
        translations: [
          {
            language: 'en-US',
            translation: 'User Subscriptions',
            singular: 'Subscription',
            plural: 'Subscriptions',
          },
        ],
      },
      schema: {
        name: 'subscriptions',
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          meta: {
            hidden: true,
            readonly: true,
            interface: 'input',
            special: ['uuid'],
          },
          schema: {
            is_primary_key: true,
            has_auto_increment: false,
          },
        },
      ],
    };

    await fetch(`${DIRECTUS_URL}/collections`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionCollection),
    });

    console.log('✅ Created subscriptions collection');
  }

  // Add fields to subscriptions collection
  const fields = [
    {
      field: 'user',
      type: 'uuid',
      schema: {},
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        display: 'related-values',
        display_options: {
          template: '{{email}} ({{first_name}} {{last_name}})',
        },
        note: 'The user who owns this subscription',
      },
    },
    {
      field: 'product',
      type: 'uuid',
      schema: {},
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        display: 'related-values',
        display_options: {
          template: '{{name}} ({{product_type}})',
        },
        note: 'The product being subscribed to',
      },
    },
    {
      field: 'stripe_subscription_id',
      type: 'string',
      schema: {
        is_nullable: false,
        is_unique: true,
      },
      meta: {
        interface: 'input',
        note: 'Stripe subscription ID',
        readonly: true,
      },
    },
    {
      field: 'stripe_customer_id',
      type: 'string',
      schema: {},
      meta: {
        interface: 'input',
        note: 'Stripe customer ID',
        readonly: true,
      },
    },
    {
      field: 'status',
      type: 'string',
      schema: {
        default_value: 'active',
      },
      meta: {
        interface: 'select-dropdown',
        display: 'labels',
        display_options: {
          choices: [
            { text: 'Active', value: 'active', foreground: '#10B981', background: '#D1FAE5' },
            { text: 'Trialing', value: 'trialing', foreground: '#3B82F6', background: '#DBEAFE' },
            { text: 'Past Due', value: 'past_due', foreground: '#F59E0B', background: '#FEF3C7' },
            { text: 'Canceled', value: 'canceled', foreground: '#EF4444', background: '#FEE2E2' },
            { text: 'Unpaid', value: 'unpaid', foreground: '#6B7280', background: '#F3F4F6' },
          ],
        },
        options: {
          choices: [
            { text: 'Active', value: 'active' },
            { text: 'Trialing', value: 'trialing' },
            { text: 'Past Due', value: 'past_due' },
            { text: 'Canceled', value: 'canceled' },
            { text: 'Unpaid', value: 'unpaid' },
          ],
        },
      },
    },
    {
      field: 'current_period_end',
      type: 'timestamp',
      schema: {},
      meta: {
        interface: 'datetime',
        note: 'When the current billing period ends',
      },
    },
    {
      field: 'cancel_at_period_end',
      type: 'boolean',
      schema: {
        default_value: false,
      },
      meta: {
        interface: 'boolean',
        note: 'Whether the subscription will be canceled at period end',
      },
    },
    {
      field: 'created_at',
      type: 'timestamp',
      schema: {
        default_value: 'CURRENT_TIMESTAMP',
      },
      meta: {
        interface: 'datetime',
        readonly: true,
        special: ['date-created'],
      },
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      schema: {},
      meta: {
        interface: 'datetime',
        readonly: true,
        special: ['date-updated'],
      },
    },
  ];

  for (const field of fields) {
    try {
      await fetch(`${DIRECTUS_URL}/fields/subscriptions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(field),
      });
      console.log(`✅ Added field: ${field.field}`);
    } catch (error) {
      // Field might already exist
      console.log(`⚠️ Field ${field.field} might already exist`);
    }
  }

  // Create relationships
  await createRelationships(token);
}

async function createRelationships(token) {
  console.log('🔗 Creating relationships...');

  // User -> Subscriptions (one-to-many)
  try {
    await fetch(`${DIRECTUS_URL}/relations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection: 'subscriptions',
        field: 'user',
        related_collection: 'directus_users',
        meta: {
          many_collection: 'subscriptions',
          many_field: 'user',
          one_collection: 'directus_users',
          one_field: 'subscriptions',
          one_allowed_collections: null,
          junction_field: null,
          sort_field: null,
          one_collection_field: null,
          one_deselect_action: 'nullify',
        },
      }),
    });
    console.log('✅ Created user -> subscriptions relationship');
  } catch (error) {
    console.log('⚠️ User relationship might already exist');
  }

  // Product -> Subscriptions (one-to-many)
  try {
    await fetch(`${DIRECTUS_URL}/relations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection: 'subscriptions',
        field: 'product',
        related_collection: 'products',
        meta: {
          many_collection: 'subscriptions',
          many_field: 'product',
          one_collection: 'products',
          one_field: 'subscriptions',
          one_allowed_collections: null,
          junction_field: null,
          sort_field: null,
          one_collection_field: null,
          one_deselect_action: 'nullify',
        },
      }),
    });
    console.log('✅ Created product -> subscriptions relationship');
  } catch (error) {
    console.log('⚠️ Product relationship might already exist');
  }
}

async function migrateExistingSubscriptions(token) {
  console.log('🔄 Migrating existing subscription data...');

  // Get all users with subscription data
  const usersResponse = await fetch(
    `${DIRECTUS_URL}/users?filter[stripe_subscription_id][_nnull]=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const usersData = await usersResponse.json();
  const users = usersData.data || [];

  console.log(`Found ${users.length} users with subscription data to migrate`);

  // Get products to map tiers
  const productsResponse = await fetch(`${DIRECTUS_URL}/items/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const productsData = await productsResponse.json();
  const products = productsData.data || [];

  for (const user of users) {
    if (user.stripe_subscription_id && user.subscription_tier) {
      // Find matching product
      const product = products.find(
        p => p.key === `spinner_${user.subscription_tier}` || p.key === user.subscription_tier
      );

      if (product) {
        // Create subscription record
        const subscriptionData = {
          user: user.id,
          product: product.id,
          stripe_subscription_id: user.stripe_subscription_id,
          stripe_customer_id: user.stripe_customer_id,
          status: user.subscription_status || 'active',
          current_period_end: user.subscription_current_period_end,
          cancel_at_period_end: user.subscription_cancel_at_period_end || false,
        };

        try {
          await fetch(`${DIRECTUS_URL}/items/subscriptions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionData),
          });
          console.log(`✅ Migrated subscription for ${user.email}`);
        } catch (error) {
          console.log(`⚠️ Could not migrate subscription for ${user.email}`);
        }
      }
    }
  }
}

async function setPermissions(token) {
  console.log('🔒 Setting permissions for subscriptions...');

  // Get the public role ID
  const rolesResponse = await fetch(`${DIRECTUS_URL}/roles?filter[name][_eq]=Public`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const rolesData = await rolesResponse.json();
  const publicRole = rolesData.data?.[0];

  if (publicRole) {
    // Users should be able to read their own subscriptions
    const permissions = [
      {
        role: publicRole.id,
        collection: 'subscriptions',
        action: 'read',
        permissions: {
          user: {
            _eq: '$CURRENT_USER',
          },
        },
        fields: ['*'],
      },
    ];

    for (const permission of permissions) {
      try {
        await fetch(`${DIRECTUS_URL}/permissions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(permission),
        });
        console.log(`✅ Added ${permission.action} permission for ${permission.collection}`);
      } catch (error) {
        console.log(`⚠️ Permission might already exist`);
      }
    }
  }
}

async function main() {
  try {
    console.log('🚀 Setting up Multi-Subscription System\n');

    const token = await authenticate();
    console.log('✅ Authentication successful\n');

    await updateProductsCollection(token);
    await createSubscriptionsCollection(token);
    await migrateExistingSubscriptions(token);
    await setPermissions(token);

    console.log('\n✨ Multi-subscription system setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update the webhook handler to create subscription records');
    console.log('2. Update the dashboard to display multiple subscriptions');
    console.log('3. Add more products for websites and streaming services');
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