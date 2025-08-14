#!/usr/bin/env node

/**
 * Setup Directus Collections for DrawDay
 * Run this after Directus is initialized to create the necessary collections
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'drawday';

let accessToken = null;

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

// Create a collection
async function createCollection(collection) {
  try {
    await axios.post(
      `${DIRECTUS_URL}/collections`,
      collection,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`✅ Created collection: ${collection.collection}`);
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`⚠️  Collection already exists: ${collection.collection}`);
    } else {
      console.error(`❌ Failed to create collection ${collection.collection}:`, error.response?.data || error.message);
    }
  }
}

// Create fields for a collection
async function createFields(collectionName, fields) {
  for (const field of fields) {
    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/${collectionName}`,
        field,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(`  ✅ Created field: ${field.field}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`  ⚠️  Field already exists: ${field.field}`);
      } else {
        console.error(`  ❌ Failed to create field ${field.field}:`, error.response?.data || error.message);
      }
    }
  }
}

async function setupCollections() {
  await authenticate();

  // Subscriptions Collection
  console.log('\n📦 Setting up Subscriptions collection...');
  await createCollection({
    collection: 'subscriptions',
    meta: {
      collection: 'subscriptions',
      icon: 'credit_card',
      display_template: '{{user.email}} - {{product}} ({{status}})',
      archive_field: 'status',
      archive_value: 'cancelled',
      sort_field: 'created_at',
    },
    schema: {
      name: 'subscriptions',
      comment: 'User subscriptions for DrawDay products'
    },
  });

  await createFields('subscriptions', [
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
    {
      field: 'user',
      type: 'uuid',
      meta: {
        interface: 'select-dropdown-m2o',
        special: ['m2o'],
        required: true,
      },
      schema: {
        foreign_key_table: 'directus_users',
        foreign_key_column: 'id',
      },
    },
    {
      field: 'product',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Spinner', value: 'spinner' },
            { text: 'Streaming', value: 'streaming' },
            { text: 'Websites', value: 'websites' },
          ],
        },
        required: true,
      },
      schema: {
        max_length: 50,
      },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Active', value: 'active' },
            { text: 'Trial', value: 'trial' },
            { text: 'Cancelled', value: 'cancelled' },
            { text: 'Expired', value: 'expired' },
          ],
        },
        required: true,
        default_value: 'trial',
      },
      schema: {
        max_length: 20,
        default_value: 'trial',
      },
    },
    {
      field: 'starts_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        required: true,
      },
    },
    {
      field: 'ends_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
      },
    },
    {
      field: 'created_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        hidden: true,
        special: ['date-created'],
      },
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        hidden: true,
        special: ['date-updated'],
      },
    },
  ]);

  // Terms of Service Collection
  console.log('\n📜 Setting up Terms of Service collection...');
  await createCollection({
    collection: 'terms_of_service',
    meta: {
      collection: 'terms_of_service',
      icon: 'gavel',
      display_template: 'Version {{version}} - {{status}}',
      archive_field: 'status',
      archive_value: 'archived',
      sort_field: 'version',
    },
    schema: {
      name: 'terms_of_service',
      comment: 'Terms of Service versions'
    },
  });

  await createFields('terms_of_service', [
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
      },
    },
    {
      field: 'version',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 20,
      },
    },
    {
      field: 'content',
      type: 'text',
      meta: {
        interface: 'input-rich-text-html',
        required: true,
      },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Active', value: 'active' },
            { text: 'Draft', value: 'draft' },
            { text: 'Archived', value: 'archived' },
          ],
        },
        required: true,
        default_value: 'draft',
      },
      schema: {
        max_length: 20,
        default_value: 'draft',
      },
    },
    {
      field: 'effective_date',
      type: 'date',
      meta: {
        interface: 'datetime',
        required: true,
      },
    },
    {
      field: 'created_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        hidden: true,
        special: ['date-created'],
      },
    },
  ]);

  // Privacy Policy Collection
  console.log('\n🔒 Setting up Privacy Policy collection...');
  await createCollection({
    collection: 'privacy_policy',
    meta: {
      collection: 'privacy_policy',
      icon: 'privacy_tip',
      display_template: 'Version {{version}} - {{status}}',
      archive_field: 'status',
      archive_value: 'archived',
      sort_field: 'version',
    },
    schema: {
      name: 'privacy_policy',
      comment: 'Privacy Policy versions'
    },
  });

  await createFields('privacy_policy', [
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
      },
    },
    {
      field: 'version',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 20,
      },
    },
    {
      field: 'content',
      type: 'text',
      meta: {
        interface: 'input-rich-text-html',
        required: true,
      },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Active', value: 'active' },
            { text: 'Draft', value: 'draft' },
            { text: 'Archived', value: 'archived' },
          ],
        },
        required: true,
        default_value: 'draft',
      },
      schema: {
        max_length: 20,
        default_value: 'draft',
      },
    },
    {
      field: 'effective_date',
      type: 'date',
      meta: {
        interface: 'datetime',
        required: true,
      },
    },
    {
      field: 'created_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        hidden: true,
        special: ['date-created'],
      },
    },
  ]);

  // Contact Submissions Collection
  console.log('\n📧 Setting up Contact Submissions collection...');
  await createCollection({
    collection: 'contact_submissions',
    meta: {
      collection: 'contact_submissions',
      icon: 'email',
      display_template: '{{name}} - {{subject}}',
      sort_field: 'created_at',
    },
    schema: {
      name: 'contact_submissions',
      comment: 'Contact form submissions'
    },
  });

  await createFields('contact_submissions', [
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
      },
    },
    {
      field: 'name',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'email',
      type: 'string',
      meta: {
        interface: 'input',
        validation: {
          _and: [
            {
              email: {
                _nnull: true,
              },
            },
          ],
        },
        required: true,
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'subject',
      type: 'string',
      meta: {
        interface: 'input',
        required: true,
      },
      schema: {
        max_length: 255,
      },
    },
    {
      field: 'message',
      type: 'text',
      meta: {
        interface: 'input-multiline',
        required: true,
      },
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'New', value: 'new' },
            { text: 'In Progress', value: 'in_progress' },
            { text: 'Resolved', value: 'resolved' },
          ],
        },
        default_value: 'new',
      },
      schema: {
        max_length: 20,
        default_value: 'new',
      },
    },
    {
      field: 'created_at',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        special: ['date-created'],
      },
    },
  ]);

  console.log('\n✅ All collections have been set up successfully!');
  console.log('\n📍 Access Directus at: http://localhost:8055');
  console.log('📧 Login with: admin@drawday.app / drawday');
}

// Run the setup
setupCollections().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});