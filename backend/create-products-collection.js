#!/usr/bin/env node

/**
 * Create Products collection in Directus with Stripe integration
 * Products will be synced with Stripe automatically
 */

const API_URL = 'http://localhost:8055';
const EMAIL = 'admin@drawday.app';
const PASSWORD = 'Speed4Dayz1!';

async function createProductsCollection() {
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

    // Create Products collection
    console.log('📦 Creating Products collection...');
    const collectionResponse = await fetch(`${API_URL}/collections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection: 'products',
        meta: {
          collection: 'products',
          icon: 'shopping_bag',
          note: 'Subscription products synced with Stripe',
          display_template: '{{name}} - £{{price}}/month',
          archive_field: 'status',
          archive_value: 'archived',
          unarchive_value: 'published',
          singleton: false,
          translations: null,
          sort_field: 'sort'
        },
        schema: {
          name: 'products',
          comment: 'Subscription products synced with Stripe'
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
          }
        ]
      })
    });

    if (!collectionResponse.ok) {
      const error = await collectionResponse.text();
      if (error.includes('already exists')) {
        console.log('⚠️  Products collection already exists, skipping creation\n');
      } else {
        throw new Error(`Failed to create collection: ${error}`);
      }
    } else {
      console.log('✅ Products collection created\n');
    }

    // Add fields to Products collection
    console.log('🔧 Adding fields to Products collection...');
    const fields = [
      {
        field: 'name',
        type: 'string',
        meta: {
          interface: 'input',
          options: { placeholder: 'e.g., Professional Plan' },
          display: 'formatted-value',
          display_options: { bold: true },
          required: true,
          translations: null
        },
        schema: {
          name: 'name',
          table: 'products',
          data_type: 'varchar',
          default_value: null,
          max_length: 255,
          is_nullable: false
        }
      },
      {
        field: 'key',
        type: 'string',
        meta: {
          interface: 'input',
          options: { 
            placeholder: 'e.g., professional',
            font: 'monospace'
          },
          note: 'Unique identifier used in code',
          required: true,
          unique: true
        },
        schema: {
          name: 'key',
          table: 'products',
          data_type: 'varchar',
          max_length: 50,
          is_nullable: false,
          is_unique: true
        }
      },
      {
        field: 'description',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          options: { placeholder: 'Product description for customers' }
        },
        schema: {
          name: 'description',
          table: 'products',
          data_type: 'text',
          is_nullable: true
        }
      },
      {
        field: 'price',
        type: 'decimal',
        meta: {
          interface: 'input',
          options: { 
            placeholder: '79.00',
            iconLeft: '£'
          },
          display: 'formatted-value',
          display_options: { 
            prefix: '£',
            suffix: '/month'
          },
          required: true
        },
        schema: {
          name: 'price',
          table: 'products',
          data_type: 'decimal',
          numeric_precision: 10,
          numeric_scale: 2,
          is_nullable: false
        }
      },
      {
        field: 'features',
        type: 'json',
        meta: {
          interface: 'list',
          options: {
            template: '{{feature}}',
            addLabel: 'Add Feature'
          },
          note: 'List of features included in this plan'
        },
        schema: {
          name: 'features',
          table: 'products',
          data_type: 'json',
          is_nullable: true
        }
      },
      {
        field: 'stripe_product_id',
        type: 'string',
        meta: {
          interface: 'input',
          options: { 
            font: 'monospace',
            placeholder: 'prod_ABC123...'
          },
          note: 'Automatically created when saved',
          readonly: true
        },
        schema: {
          name: 'stripe_product_id',
          table: 'products',
          data_type: 'varchar',
          max_length: 255,
          is_nullable: true
        }
      },
      {
        field: 'stripe_price_id',
        type: 'string',
        meta: {
          interface: 'input',
          options: { 
            font: 'monospace',
            placeholder: 'price_ABC123...'
          },
          note: 'Automatically created when saved',
          readonly: true
        },
        schema: {
          name: 'stripe_price_id',
          table: 'products',
          data_type: 'varchar',
          max_length: 255,
          is_nullable: true
        }
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Published', value: 'published' },
              { text: 'Draft', value: 'draft' },
              { text: 'Archived', value: 'archived' }
            ]
          },
          display: 'labels',
          display_options: {
            choices: [
              { text: 'Published', value: 'published', foreground: '#00C897', background: '#00C89720' },
              { text: 'Draft', value: 'draft', foreground: '#FFA500', background: '#FFA50020' },
              { text: 'Archived', value: 'archived', foreground: '#6C757D', background: '#6C757D20' }
            ]
          },
          required: true
        },
        schema: {
          name: 'status',
          table: 'products',
          data_type: 'varchar',
          default_value: 'draft',
          max_length: 20,
          is_nullable: false
        }
      },
      {
        field: 'sort',
        type: 'integer',
        meta: {
          interface: 'input',
          hidden: true
        },
        schema: {
          name: 'sort',
          table: 'products',
          data_type: 'integer',
          is_nullable: true
        }
      },
      {
        field: 'user_created',
        type: 'uuid',
        meta: {
          special: ['user-created'],
          interface: 'select-dropdown-m2o',
          options: {
            template: '{{avatar.$thumbnail}} {{first_name}} {{last_name}}'
          },
          display: 'user',
          readonly: true,
          hidden: true,
          width: 'half'
        },
        schema: {
          name: 'user_created',
          table: 'products',
          data_type: 'uuid',
          is_nullable: true
        }
      },
      {
        field: 'date_created',
        type: 'timestamp',
        meta: {
          special: ['date-created'],
          interface: 'datetime',
          readonly: true,
          hidden: true,
          width: 'half',
          display: 'datetime',
          display_options: {
            relative: true
          }
        },
        schema: {
          name: 'date_created',
          table: 'products',
          data_type: 'timestamp',
          is_nullable: true
        }
      },
      {
        field: 'user_updated',
        type: 'uuid',
        meta: {
          special: ['user-updated'],
          interface: 'select-dropdown-m2o',
          options: {
            template: '{{avatar.$thumbnail}} {{first_name}} {{last_name}}'
          },
          display: 'user',
          readonly: true,
          hidden: true,
          width: 'half'
        },
        schema: {
          name: 'user_updated',
          table: 'products',
          data_type: 'uuid',
          is_nullable: true
        }
      },
      {
        field: 'date_updated',
        type: 'timestamp',
        meta: {
          special: ['date-updated'],
          interface: 'datetime',
          readonly: true,
          hidden: true,
          width: 'half',
          display: 'datetime',
          display_options: {
            relative: true
          }
        },
        schema: {
          name: 'date_updated',
          table: 'products',
          data_type: 'timestamp',
          is_nullable: true
        }
      }
    ];

    for (const field of fields) {
      try {
        const fieldResponse = await fetch(`${API_URL}/fields/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(field)
        });

        if (!fieldResponse.ok) {
          const error = await fieldResponse.text();
          if (error.includes('already exists')) {
            console.log(`  ⚠️  Field ${field.field} already exists`);
          } else {
            console.log(`  ❌ Failed to create field ${field.field}: ${error}`);
          }
        } else {
          console.log(`  ✅ Field ${field.field} created`);
        }
      } catch (error) {
        console.log(`  ❌ Error creating field ${field.field}:`, error.message);
      }
    }

    console.log('\n📝 Creating default products...');
    const defaultProducts = [
      {
        name: 'Starter',
        key: 'starter',
        description: 'Perfect for small raffle companies just getting started',
        price: 29,
        features: [
          { feature: 'Up to 1,000 participants' },
          { feature: 'Basic spinner themes' },
          { feature: 'CSV import' },
          { feature: 'Email support' },
          { feature: '14-day free trial' }
        ],
        status: 'published',
        sort: 1
      },
      {
        name: 'Professional',
        key: 'professional',
        description: 'For growing raffle companies that need more features',
        price: 79,
        features: [
          { feature: 'Up to 10,000 participants' },
          { feature: 'Custom branding' },
          { feature: 'Priority support' },
          { feature: 'Advanced animations' },
          { feature: 'API access' },
          { feature: 'Multiple competitions' },
          { feature: '14-day free trial' }
        ],
        status: 'published',
        sort: 2
      },
      {
        name: 'Enterprise',
        key: 'enterprise',
        description: 'Custom solutions for large organizations',
        price: 199,
        features: [
          { feature: 'Unlimited participants' },
          { feature: 'White-label solution' },
          { feature: 'Dedicated support' },
          { feature: 'Custom features' },
          { feature: 'SLA guarantee' },
          { feature: 'Training included' },
          { feature: 'Custom contract' }
        ],
        status: 'published',
        sort: 3
      }
    ];

    for (const product of defaultProducts) {
      try {
        // Check if product already exists
        const existingResponse = await fetch(`${API_URL}/items/products?filter[key][_eq]=${product.key}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const { data: existing } = await existingResponse.json();
        
        if (existing && existing.length > 0) {
          console.log(`  ⚠️  Product ${product.name} already exists`);
          continue;
        }

        // Create product
        const productResponse = await fetch(`${API_URL}/items/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(product)
        });

        if (productResponse.ok) {
          console.log(`  ✅ Product ${product.name} created`);
        } else {
          const error = await productResponse.text();
          console.log(`  ❌ Failed to create product ${product.name}: ${error}`);
        }
      } catch (error) {
        console.log(`  ❌ Error creating product ${product.name}:`, error.message);
      }
    }

    console.log('\n🎉 Products collection setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Directus admin: http://localhost:8055');
    console.log('2. Navigate to Products collection');
    console.log('3. Products will automatically sync with Stripe when saved');
    console.log('4. The website will fetch products from Directus\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createProductsCollection();