#!/usr/bin/env node

/**
 * Directus Schema Setup Script
 * 
 * This script creates the necessary collections and fields in Directus
 * for the subscription system.
 * 
 * Usage:
 * 1. Update DIRECTUS_URL and admin credentials
 * 2. Run: node directus-schema-setup.js
 */

const DIRECTUS_URL = 'https://admin.drawday.app';
const ADMIN_EMAIL = 'your-admin-email@example.com';
const ADMIN_PASSWORD = 'your-admin-password';

async function setupDirectusSchema() {
  console.log('🚀 Setting up Directus schema for subscriptions...\n');

  // This is a template for the collections you need to create in Directus
  // You can either:
  // 1. Create these manually in the Directus Admin UI
  // 2. Use the Directus API to create them programmatically
  // 3. Use Directus CLI for migration

  const collections = {
    products: {
      collection: 'products',
      meta: {
        collection: 'products',
        icon: 'shopping_bag',
        note: 'Available products and services',
        display_template: '{{name}}',
        hidden: false,
        singleton: false,
        accountability: 'all',
        color: '#6366F1'
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          meta: {
            hidden: true,
            readonly: true,
            interface: 'input',
            special: ['uuid']
          }
        },
        {
          field: 'name',
          type: 'string',
          meta: {
            interface: 'input',
            options: { placeholder: 'Product Name' },
            display: 'formatted-value',
            required: true
          }
        },
        {
          field: 'slug',
          type: 'string',
          meta: {
            interface: 'input',
            options: { placeholder: 'product-slug', font: 'monospace' },
            display: 'formatted-value',
            required: true,
            validation: { _regex: '^[a-z0-9-]+$' }
          }
        },
        {
          field: 'description',
          type: 'text',
          meta: {
            interface: 'input-rich-text-md',
            display: 'formatted-value'
          }
        },
        {
          field: 'category',
          type: 'string',
          meta: {
            interface: 'select-dropdown',
            options: {
              choices: [
                { text: 'Extension', value: 'extension' },
                { text: 'Streaming', value: 'streaming' },
                { text: 'Website', value: 'website' },
                { text: 'Add-on', value: 'addon' }
              ]
            },
            display: 'labels',
            required: true
          }
        },
        {
          field: 'features',
          type: 'json',
          meta: {
            interface: 'list',
            options: { template: '{{feature}}' },
            display: 'formatted-json'
          }
        },
        {
          field: 'icon',
          type: 'string',
          meta: {
            interface: 'select-icon',
            display: 'icon'
          }
        },
        {
          field: 'sort_order',
          type: 'integer',
          meta: {
            interface: 'input',
            display: 'formatted-value',
            width: 'half'
          }
        },
        {
          field: 'status',
          type: 'string',
          meta: {
            interface: 'select-dropdown',
            options: {
              choices: [
                { text: 'Active', value: 'active' },
                { text: 'Archived', value: 'archived' }
              ]
            },
            display: 'labels',
            default_value: 'active',
            width: 'half'
          }
        }
      ]
    },

    product_tiers: {
      collection: 'product_tiers',
      meta: {
        collection: 'product_tiers',
        icon: 'layers',
        note: 'Pricing tiers for each product',
        display_template: '{{product_id.name}} - {{name}}',
        hidden: false,
        singleton: false,
        accountability: 'all',
        color: '#10B981'
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          meta: { hidden: true, readonly: true, special: ['uuid'] }
        },
        {
          field: 'product_id',
          type: 'uuid',
          meta: {
            interface: 'select-dropdown-m2o',
            special: ['m2o'],
            required: true
          }
        },
        {
          field: 'name',
          type: 'string',
          meta: { interface: 'input', required: true }
        },
        {
          field: 'slug',
          type: 'string',
          meta: { interface: 'input', required: true }
        },
        {
          field: 'stripe_price_id',
          type: 'string',
          meta: { 
            interface: 'input', 
            options: { placeholder: 'price_xxxx', font: 'monospace' },
            note: 'Stripe Price ID from your Stripe Dashboard'
          }
        },
        {
          field: 'price',
          type: 'integer',
          meta: { 
            interface: 'input', 
            display: 'formatted-value',
            note: 'Price in pence (2900 = £29.00)'
          }
        },
        {
          field: 'currency',
          type: 'string',
          meta: { 
            interface: 'input', 
            default_value: 'gbp',
            width: 'half'
          }
        },
        {
          field: 'billing_period',
          type: 'string',
          meta: {
            interface: 'select-dropdown',
            options: {
              choices: [
                { text: 'Monthly', value: 'monthly' },
                { text: 'Yearly', value: 'yearly' }
              ]
            },
            width: 'half'
          }
        },
        {
          field: 'trial_days',
          type: 'integer',
          meta: { interface: 'input', default_value: 14 }
        },
        {
          field: 'features',
          type: 'json',
          meta: { interface: 'list', display: 'formatted-json' }
        },
        {
          field: 'limits',
          type: 'json',
          meta: { 
            interface: 'input-code', 
            options: { language: 'json' },
            note: 'JSON object with limit values'
          }
        },
        {
          field: 'popular',
          type: 'boolean',
          meta: { interface: 'boolean', default_value: false }
        },
        {
          field: 'sort_order',
          type: 'integer',
          meta: { interface: 'input' }
        },
        {
          field: 'status',
          type: 'string',
          meta: {
            interface: 'select-dropdown',
            options: {
              choices: [
                { text: 'Active', value: 'active' },
                { text: 'Archived', value: 'archived' }
              ]
            },
            default_value: 'active'
          }
        }
      ]
    },

    user_subscriptions: {
      collection: 'user_subscriptions',
      meta: {
        collection: 'user_subscriptions',
        icon: 'credit_card',
        note: 'Active user subscriptions',
        display_template: '{{user_id.email}} - {{product_id.name}}',
        hidden: false,
        singleton: false,
        accountability: 'all',
        color: '#EC4899'
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          meta: { hidden: true, readonly: true, special: ['uuid'] }
        },
        {
          field: 'user_id',
          type: 'uuid',
          meta: {
            interface: 'select-dropdown-m2o',
            special: ['m2o'],
            required: true,
            note: 'Link to directus_users'
          }
        },
        {
          field: 'product_id',
          type: 'uuid',
          meta: { interface: 'select-dropdown-m2o', special: ['m2o'] }
        },
        {
          field: 'tier_id',
          type: 'uuid',
          meta: { interface: 'select-dropdown-m2o', special: ['m2o'] }
        },
        {
          field: 'stripe_subscription_id',
          type: 'string',
          meta: { interface: 'input', options: { font: 'monospace' } }
        },
        {
          field: 'stripe_customer_id',
          type: 'string',
          meta: { interface: 'input', options: { font: 'monospace' } }
        },
        {
          field: 'status',
          type: 'string',
          meta: {
            interface: 'select-dropdown',
            options: {
              choices: [
                { text: 'Trialing', value: 'trialing' },
                { text: 'Active', value: 'active' },
                { text: 'Past Due', value: 'past_due' },
                { text: 'Canceled', value: 'canceled' },
                { text: 'Unpaid', value: 'unpaid' }
              ]
            },
            display: 'labels'
          }
        },
        {
          field: 'current_period_start',
          type: 'datetime',
          meta: { interface: 'datetime' }
        },
        {
          field: 'current_period_end',
          type: 'datetime',
          meta: { interface: 'datetime' }
        },
        {
          field: 'cancel_at_period_end',
          type: 'boolean',
          meta: { interface: 'boolean', default_value: false }
        },
        {
          field: 'canceled_at',
          type: 'datetime',
          meta: { interface: 'datetime' }
        },
        {
          field: 'trial_ends_at',
          type: 'datetime',
          meta: { interface: 'datetime' }
        },
        {
          field: 'metadata',
          type: 'json',
          meta: { interface: 'input-code', options: { language: 'json' } }
        }
      ]
    },

    subscription_usage: {
      collection: 'subscription_usage',
      meta: {
        collection: 'subscription_usage',
        icon: 'analytics',
        note: 'Track subscription usage metrics',
        display_template: '{{subscription_id.product_id.name}} - {{metric}}: {{value}}',
        hidden: false,
        singleton: false,
        accountability: 'all',
        color: '#F59E0B'
      },
      fields: [
        {
          field: 'id',
          type: 'uuid',
          meta: { hidden: true, readonly: true, special: ['uuid'] }
        },
        {
          field: 'subscription_id',
          type: 'uuid',
          meta: { interface: 'select-dropdown-m2o', special: ['m2o'] }
        },
        {
          field: 'metric',
          type: 'string',
          meta: { 
            interface: 'input',
            note: 'e.g., participants_used, draws_created'
          }
        },
        {
          field: 'value',
          type: 'integer',
          meta: { interface: 'input' }
        },
        {
          field: 'period_start',
          type: 'datetime',
          meta: { interface: 'datetime' }
        },
        {
          field: 'period_end',
          type: 'datetime',
          meta: { interface: 'datetime' }
        }
      ]
    }
  };

  // Fields to add to directus_users
  const userFields = [
    {
      field: 'stripe_customer_id',
      type: 'string',
      meta: {
        interface: 'input',
        options: { font: 'monospace' },
        note: 'Stripe Customer ID',
        readonly: true
      }
    },
    {
      field: 'default_payment_method',
      type: 'string',
      meta: {
        interface: 'input',
        hidden: true
      }
    }
  ];

  console.log('📋 Collections to create:');
  console.log('1. products - Store all available products/services');
  console.log('2. product_tiers - Pricing tiers for each product');
  console.log('3. user_subscriptions - Active subscriptions per user');
  console.log('4. subscription_usage - Usage tracking for limits\n');

  console.log('📝 Fields to add to directus_users:');
  console.log('- stripe_customer_id (string)');
  console.log('- default_payment_method (string)\n');

  console.log('🔗 Relationships to configure:');
  console.log('- product_tiers.product_id -> products.id');
  console.log('- user_subscriptions.user_id -> directus_users.id');
  console.log('- user_subscriptions.product_id -> products.id');
  console.log('- user_subscriptions.tier_id -> product_tiers.id');
  console.log('- subscription_usage.subscription_id -> user_subscriptions.id\n');

  console.log('✅ Next Steps:');
  console.log('1. Log into Directus Admin: https://admin.drawday.app');
  console.log('2. Go to Settings → Data Model');
  console.log('3. Create the collections above with their fields');
  console.log('4. Configure the relationships');
  console.log('5. Set appropriate permissions for each collection');
  console.log('6. Add sample products and tiers for testing\n');

  // Export the schema for reference
  const fs = require('fs');
  fs.writeFileSync(
    'directus-subscription-schema.json',
    JSON.stringify({ collections, userFields }, null, 2)
  );
  console.log('💾 Schema exported to: directus-subscription-schema.json');
}

// Sample data to insert after schema creation
const sampleData = {
  products: [
    {
      name: 'DrawDay Spinner',
      slug: 'spinner',
      description: 'Professional raffle spinner Chrome extension',
      category: 'extension',
      features: [
        'Unlimited raffles',
        'CSV import',
        'Custom themes',
        'Winner history'
      ],
      icon: 'casino',
      sort_order: 1,
      status: 'active'
    },
    {
      name: 'Streaming Services',
      slug: 'streaming',
      description: 'Professional live draw production services',
      category: 'streaming',
      features: [
        'Live streaming setup',
        'Custom overlays',
        'Multi-camera support',
        'Professional production'
      ],
      icon: 'live_tv',
      sort_order: 2,
      status: 'active'
    },
    {
      name: 'Custom Websites',
      slug: 'websites',
      description: 'Bespoke competition website development',
      category: 'website',
      features: [
        'Custom design',
        'Payment integration',
        'Admin dashboard',
        'Analytics'
      ],
      icon: 'web',
      sort_order: 3,
      status: 'active'
    }
  ],
  
  // Tiers for Spinner product
  spinnerTiers: [
    {
      name: 'Starter',
      slug: 'starter',
      price: 2900, // £29
      currency: 'gbp',
      billing_period: 'monthly',
      trial_days: 14,
      features: [
        'Up to 5,000 participants',
        'Basic themes',
        'Email support'
      ],
      limits: {
        participants: 5000,
        draws_per_month: 100
      },
      popular: false,
      sort_order: 1,
      status: 'active'
    },
    {
      name: 'Professional',
      slug: 'professional',
      price: 7900, // £79
      currency: 'gbp',
      billing_period: 'monthly',
      trial_days: 14,
      features: [
        'Up to 50,000 participants',
        'Advanced themes',
        'Priority support',
        'API access'
      ],
      limits: {
        participants: 50000,
        draws_per_month: 1000,
        api_calls: 10000
      },
      popular: true,
      sort_order: 2,
      status: 'active'
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      price: 19900, // £199
      currency: 'gbp',
      billing_period: 'monthly',
      trial_days: 14,
      features: [
        'Unlimited participants',
        'Custom branding',
        'Dedicated support',
        'White label option'
      ],
      limits: {
        participants: -1, // unlimited
        draws_per_month: -1,
        api_calls: -1
      },
      popular: false,
      sort_order: 3,
      status: 'active'
    }
  ]
};

console.log('\n📦 Sample data has been prepared and saved.\n');
console.log('After creating the schema, you can add this sample data to get started.');

setupDirectusSchema();