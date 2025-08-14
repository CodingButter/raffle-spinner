#!/usr/bin/env node

/**
 * Setup Directus Subscription System via API
 * 
 * This script creates collections and inserts data using the Directus API
 * Run: node setup-directus-subscriptions.js
 */

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, 'apps/website/.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
  console.log('📋 Loaded environment variables from .env.local\n');
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.drawday.app';

// Get credentials from environment
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ Missing Directus admin credentials!');
  console.log('Please add DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD to apps/website/.env.local');
  process.exit(1);
}

async function setupDirectus() {
  console.log('🚀 Setting up Directus subscription system...\n');

  try {
    // Step 1: Authenticate
    console.log('🔐 Authenticating with Directus...');
    const authResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.statusText}`);
    }

    const { data: authData } = await authResponse.json();
    const accessToken = authData.access_token;
    console.log('✅ Authenticated successfully\n');

    // Helper function for API calls
    const apiCall = async (endpoint, method = 'GET', body = null) => {
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${DIRECTUS_URL}${endpoint}`, options);
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`API Error: ${JSON.stringify(data, null, 2)}`);
        throw new Error(`API call failed: ${endpoint}`);
      }
      
      return data;
    };

    // Step 2: Create Collections
    console.log('📦 Creating collections...\n');

    // Create Products Collection
    console.log('Creating products collection...');
    try {
      await apiCall('/collections', 'POST', {
        collection: 'products',
        meta: {
          collection: 'products',
          icon: 'shopping_bag',
          note: 'Available products and services',
          display_template: '{{name}}',
          color: '#6366F1'
        },
        schema: {
          name: 'products'
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
            },
            schema: {
              is_primary_key: true,
              has_auto_increment: false
            }
          },
          {
            field: 'name',
            type: 'string',
            meta: {
              interface: 'input',
              options: { placeholder: 'Product Name' },
              required: true
            },
            schema: {
              is_nullable: false
            }
          },
          {
            field: 'slug',
            type: 'string',
            meta: {
              interface: 'input',
              options: { placeholder: 'product-slug', font: 'monospace' },
              required: true
            },
            schema: {
              is_nullable: false,
              is_unique: true
            }
          },
          {
            field: 'description',
            type: 'text',
            meta: {
              interface: 'input-rich-text-md'
            },
            schema: {}
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
              required: true
            },
            schema: {}
          },
          {
            field: 'features',
            type: 'json',
            meta: {
              interface: 'list',
              options: { template: '{{feature}}' }
            },
            schema: {
              default_value: '[]'
            }
          },
          {
            field: 'icon',
            type: 'string',
            meta: {
              interface: 'select-icon'
            },
            schema: {}
          },
          {
            field: 'sort_order',
            type: 'integer',
            meta: {
              interface: 'input'
            },
            schema: {
              default_value: 0
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
              }
            },
            schema: {
              default_value: 'active'
            }
          }
        ]
      });
      console.log('✅ Products collection created');
    } catch (error) {
      console.log('⚠️  Products collection might already exist');
    }

    // Create Product Tiers Collection
    console.log('Creating product_tiers collection...');
    try {
      await apiCall('/collections', 'POST', {
        collection: 'product_tiers',
        meta: {
          collection: 'product_tiers',
          icon: 'layers',
          note: 'Pricing tiers for each product',
          display_template: '{{product_id.name}} - {{name}}',
          color: '#10B981'
        },
        schema: {
          name: 'product_tiers'
        },
        fields: [
          {
            field: 'id',
            type: 'uuid',
            meta: {
              hidden: true,
              readonly: true,
              special: ['uuid']
            },
            schema: {
              is_primary_key: true
            }
          },
          {
            field: 'product_id',
            type: 'uuid',
            meta: {
              interface: 'select-dropdown-m2o',
              special: ['m2o'],
              required: true
            },
            schema: {}
          },
          {
            field: 'name',
            type: 'string',
            meta: {
              interface: 'input',
              required: true
            },
            schema: {
              is_nullable: false
            }
          },
          {
            field: 'slug',
            type: 'string',
            meta: {
              interface: 'input',
              required: true
            },
            schema: {
              is_nullable: false
            }
          },
          {
            field: 'stripe_price_id',
            type: 'string',
            meta: {
              interface: 'input',
              options: { placeholder: 'price_xxxx', font: 'monospace' }
            },
            schema: {}
          },
          {
            field: 'price',
            type: 'integer',
            meta: {
              interface: 'input',
              note: 'Price in pence (2900 = £29.00)'
            },
            schema: {}
          },
          {
            field: 'currency',
            type: 'string',
            meta: {
              interface: 'input'
            },
            schema: {
              default_value: 'gbp'
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
              }
            },
            schema: {
              default_value: 'monthly'
            }
          },
          {
            field: 'trial_days',
            type: 'integer',
            meta: {
              interface: 'input'
            },
            schema: {
              default_value: 14
            }
          },
          {
            field: 'features',
            type: 'json',
            meta: {
              interface: 'list'
            },
            schema: {
              default_value: '[]'
            }
          },
          {
            field: 'limits',
            type: 'json',
            meta: {
              interface: 'input-code',
              options: { language: 'json' }
            },
            schema: {
              default_value: '{}'
            }
          },
          {
            field: 'popular',
            type: 'boolean',
            meta: {
              interface: 'boolean'
            },
            schema: {
              default_value: false
            }
          },
          {
            field: 'sort_order',
            type: 'integer',
            meta: {
              interface: 'input'
            },
            schema: {
              default_value: 0
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
              }
            },
            schema: {
              default_value: 'active'
            }
          }
        ]
      });
      console.log('✅ Product tiers collection created');
    } catch (error) {
      console.log('⚠️  Product tiers collection might already exist');
    }

    // Create User Subscriptions Collection
    console.log('Creating user_subscriptions collection...');
    try {
      await apiCall('/collections', 'POST', {
        collection: 'user_subscriptions',
        meta: {
          collection: 'user_subscriptions',
          icon: 'credit_card',
          note: 'Active user subscriptions',
          display_template: '{{user_id.email}} - {{product_id.name}}',
          color: '#EC4899'
        },
        schema: {
          name: 'user_subscriptions'
        },
        fields: [
          {
            field: 'id',
            type: 'uuid',
            meta: {
              hidden: true,
              readonly: true,
              special: ['uuid']
            },
            schema: {
              is_primary_key: true
            }
          },
          {
            field: 'user_id',
            type: 'uuid',
            meta: {
              interface: 'select-dropdown-m2o',
              special: ['m2o'],
              required: true
            },
            schema: {}
          },
          {
            field: 'product_id',
            type: 'uuid',
            meta: {
              interface: 'select-dropdown-m2o',
              special: ['m2o']
            },
            schema: {}
          },
          {
            field: 'tier_id',
            type: 'uuid',
            meta: {
              interface: 'select-dropdown-m2o',
              special: ['m2o']
            },
            schema: {}
          },
          {
            field: 'stripe_subscription_id',
            type: 'string',
            meta: {
              interface: 'input',
              options: { font: 'monospace' }
            },
            schema: {}
          },
          {
            field: 'stripe_customer_id',
            type: 'string',
            meta: {
              interface: 'input',
              options: { font: 'monospace' }
            },
            schema: {}
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
              }
            },
            schema: {}
          },
          {
            field: 'current_period_start',
            type: 'datetime',
            meta: {
              interface: 'datetime'
            },
            schema: {}
          },
          {
            field: 'current_period_end',
            type: 'datetime',
            meta: {
              interface: 'datetime'
            },
            schema: {}
          },
          {
            field: 'cancel_at_period_end',
            type: 'boolean',
            meta: {
              interface: 'boolean'
            },
            schema: {
              default_value: false
            }
          },
          {
            field: 'canceled_at',
            type: 'datetime',
            meta: {
              interface: 'datetime'
            },
            schema: {}
          },
          {
            field: 'trial_ends_at',
            type: 'datetime',
            meta: {
              interface: 'datetime'
            },
            schema: {}
          },
          {
            field: 'metadata',
            type: 'json',
            meta: {
              interface: 'input-code',
              options: { language: 'json' }
            },
            schema: {
              default_value: '{}'
            }
          }
        ]
      });
      console.log('✅ User subscriptions collection created');
    } catch (error) {
      console.log('⚠️  User subscriptions collection might already exist');
    }

    // Step 3: Add fields to directus_users
    console.log('\n📝 Adding fields to directus_users...');
    
    try {
      await apiCall('/fields/directus_users', 'POST', {
        field: 'stripe_customer_id',
        type: 'string',
        meta: {
          interface: 'input',
          options: { font: 'monospace' },
          note: 'Stripe Customer ID',
          readonly: true
        }
      });
      console.log('✅ Added stripe_customer_id to users');
    } catch (error) {
      console.log('⚠️  stripe_customer_id field might already exist');
    }

    // Step 4: Create relationships
    console.log('\n🔗 Creating relationships...');
    
    // Product Tiers -> Products
    try {
      await apiCall('/relations', 'POST', {
        collection: 'product_tiers',
        field: 'product_id',
        related_collection: 'products',
        meta: {
          many_collection: 'product_tiers',
          many_field: 'product_id',
          one_collection: 'products',
          one_field: null,
          junction_field: null
        }
      });
      console.log('✅ Created product_tiers -> products relationship');
    } catch (error) {
      console.log('⚠️  Relationship might already exist');
    }

    // User Subscriptions -> Users
    try {
      await apiCall('/relations', 'POST', {
        collection: 'user_subscriptions',
        field: 'user_id',
        related_collection: 'directus_users',
        meta: {
          many_collection: 'user_subscriptions',
          many_field: 'user_id',
          one_collection: 'directus_users',
          one_field: null
        }
      });
      console.log('✅ Created user_subscriptions -> users relationship');
    } catch (error) {
      console.log('⚠️  Relationship might already exist');
    }

    // User Subscriptions -> Products
    try {
      await apiCall('/relations', 'POST', {
        collection: 'user_subscriptions',
        field: 'product_id',
        related_collection: 'products'
      });
      console.log('✅ Created user_subscriptions -> products relationship');
    } catch (error) {
      console.log('⚠️  Relationship might already exist');
    }

    // User Subscriptions -> Product Tiers
    try {
      await apiCall('/relations', 'POST', {
        collection: 'user_subscriptions',
        field: 'tier_id',
        related_collection: 'product_tiers'
      });
      console.log('✅ Created user_subscriptions -> product_tiers relationship');
    } catch (error) {
      console.log('⚠️  Relationship might already exist');
    }

    // Step 5: Insert sample data
    console.log('\n📊 Inserting sample data...\n');

    // Insert Products
    const products = [
      {
        name: 'DrawDay Spinner',
        slug: 'spinner',
        description: 'Professional raffle spinner Chrome extension for live draws',
        category: 'extension',
        features: ['Unlimited raffles', 'CSV import', 'Custom themes', 'Winner history'],
        icon: 'casino',
        sort_order: 1,
        status: 'active'
      },
      {
        name: 'Streaming Services',
        slug: 'streaming',
        description: 'Professional live draw production services',
        category: 'streaming',
        features: ['Live streaming setup', 'Custom overlays', 'Multi-camera support'],
        icon: 'live_tv',
        sort_order: 2,
        status: 'active'
      },
      {
        name: 'Custom Websites',
        slug: 'websites',
        description: 'Bespoke competition website development',
        category: 'website',
        features: ['Custom design', 'Payment integration', 'Admin dashboard'],
        icon: 'web',
        sort_order: 3,
        status: 'active'
      }
    ];

    const createdProducts = [];
    for (const product of products) {
      try {
        const result = await apiCall('/items/products', 'POST', product);
        createdProducts.push(result.data);
        console.log(`✅ Created product: ${product.name}`);
      } catch (error) {
        console.log(`⚠️  Product ${product.name} might already exist`);
      }
    }

    // Insert Product Tiers (for Spinner)
    if (createdProducts.length > 0) {
      const spinnerId = createdProducts.find(p => p.slug === 'spinner')?.id;
      
      if (spinnerId) {
        const tiers = [
          {
            product_id: spinnerId,
            name: 'Starter',
            slug: 'starter',
            stripe_price_id: '', // Will be filled with actual Stripe price ID
            price: 2900,
            currency: 'gbp',
            billing_period: 'monthly',
            trial_days: 14,
            features: ['Up to 5,000 participants', 'Basic themes', 'Email support'],
            limits: { participants: 5000, draws_per_month: 100 },
            popular: false,
            sort_order: 1,
            status: 'active'
          },
          {
            product_id: spinnerId,
            name: 'Professional',
            slug: 'professional',
            stripe_price_id: '', // Will be filled with actual Stripe price ID
            price: 7900,
            currency: 'gbp',
            billing_period: 'monthly',
            trial_days: 14,
            features: ['Up to 50,000 participants', 'Advanced themes', 'Priority support'],
            limits: { participants: 50000, draws_per_month: 1000 },
            popular: true,
            sort_order: 2,
            status: 'active'
          },
          {
            product_id: spinnerId,
            name: 'Enterprise',
            slug: 'enterprise',
            stripe_price_id: '', // Will be filled with actual Stripe price ID
            price: 19900,
            currency: 'gbp',
            billing_period: 'monthly',
            trial_days: 14,
            features: ['Unlimited participants', 'Custom branding', 'Dedicated support'],
            limits: { participants: -1, draws_per_month: -1 },
            popular: false,
            sort_order: 3,
            status: 'active'
          }
        ];

        for (const tier of tiers) {
          try {
            await apiCall('/items/product_tiers', 'POST', tier);
            console.log(`✅ Created tier: ${tier.name}`);
          } catch (error) {
            console.log(`⚠️  Tier ${tier.name} might already exist`);
          }
        }
      }
    }

    // Step 6: Set up permissions (public read access for products)
    console.log('\n🔐 Setting up permissions...');
    try {
      // Get public role ID
      const rolesResponse = await apiCall('/roles?filter[name][_eq]=Public');
      if (rolesResponse.data && rolesResponse.data.length > 0) {
        const publicRoleId = rolesResponse.data[0].id;
        
        // Grant read access to products
        await apiCall('/permissions', 'POST', {
          role: publicRoleId,
          collection: 'products',
          action: 'read',
          permissions: {},
          fields: '*'
        });
        console.log('✅ Granted public read access to products');

        // Grant read access to product_tiers
        await apiCall('/permissions', 'POST', {
          role: publicRoleId,
          collection: 'product_tiers',
          action: 'read',
          permissions: {},
          fields: '*'
        });
        console.log('✅ Granted public read access to product_tiers');
      }
    } catch (error) {
      console.log('⚠️  Permissions might already be configured');
    }

    console.log('\n✨ Setup complete!\n');
    console.log('Next steps:');
    console.log('1. Go to your Stripe Dashboard and create the products');
    console.log('2. Update the stripe_price_id field in product_tiers with actual Stripe Price IDs');
    console.log('3. Configure the Stripe webhook endpoint in Directus');
    console.log('4. Test the subscription flow\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. Your admin credentials are correct');
    console.log('2. The Directus instance is accessible');
    console.log('3. You have admin permissions');
  }
}

// Run the setup
setupDirectus();