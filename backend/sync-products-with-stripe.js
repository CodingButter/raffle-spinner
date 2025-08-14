#!/usr/bin/env node

/**
 * Sync existing products with Stripe and create Stripe products/prices
 * This will create products in Stripe and update Directus with the IDs
 */

const Stripe = require('stripe');

// Initialize Stripe with test key
const stripe = new Stripe('sk_test_YOUR_STRIPE_SECRET_KEY', {
  apiVersion: '2024-12-18.acacia'
});

const API_URL = 'http://localhost:8055';
const EMAIL = 'admin@drawday.app';
const PASSWORD = 'Speed4Dayz1!';

async function syncProductsWithStripe() {
  try {
    // Authenticate with Directus
    console.log('🔐 Authenticating with Directus...');
    const authResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    const { data: authData } = await authResponse.json();
    const token = authData.access_token;
    console.log('✅ Authenticated\n');

    // Get products from Directus
    console.log('📦 Fetching products from Directus...');
    const productsResponse = await fetch(`${API_URL}/items/products?filter[status][_eq]=published`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const { data: products } = await productsResponse.json();
    console.log(`✅ Found ${products.length} products\n`);

    // Sync each product with Stripe
    for (const product of products) {
      console.log(`🔄 Syncing ${product.name}...`);
      
      try {
        let stripeProduct;
        let stripePrice;

        // Check if product already exists in Stripe
        if (product.stripe_product_id) {
          try {
            stripeProduct = await stripe.products.retrieve(product.stripe_product_id);
            console.log(`  ✅ Found existing Stripe product: ${stripeProduct.id}`);
            
            // Update product in Stripe if needed
            stripeProduct = await stripe.products.update(product.stripe_product_id, {
              name: `DrawDay ${product.name}`,
              description: product.description,
              metadata: {
                directus_product_id: product.id,
                product_key: product.key
              }
            });
            console.log(`  ✅ Updated Stripe product`);
          } catch (error) {
            console.log(`  ⚠️  Product not found in Stripe, creating new one...`);
            stripeProduct = null;
          }
        }

        // Create product in Stripe if it doesn't exist
        if (!stripeProduct) {
          stripeProduct = await stripe.products.create({
            name: `DrawDay ${product.name}`,
            description: product.description,
            metadata: {
              directus_product_id: product.id,
              product_key: product.key
            }
          });
          console.log(`  ✅ Created Stripe product: ${stripeProduct.id}`);
        }

        // Check if price already exists
        if (product.stripe_price_id) {
          try {
            stripePrice = await stripe.prices.retrieve(product.stripe_price_id);
            console.log(`  ✅ Found existing Stripe price: ${stripePrice.id}`);
            
            // If price amount changed, create a new price (prices are immutable)
            if (stripePrice.unit_amount !== Math.round(product.price * 100)) {
              console.log(`  ⚠️  Price changed, creating new price...`);
              stripePrice = await stripe.prices.create({
                product: stripeProduct.id,
                unit_amount: Math.round(product.price * 100), // Convert to pence
                currency: 'gbp',
                recurring: {
                  interval: 'month',
                  interval_count: 1
                },
                metadata: {
                  directus_product_id: product.id,
                  product_key: product.key
                }
              });
              console.log(`  ✅ Created new Stripe price: ${stripePrice.id}`);
            }
          } catch (error) {
            console.log(`  ⚠️  Price not found in Stripe, creating new one...`);
            stripePrice = null;
          }
        }

        // Create price in Stripe if it doesn't exist
        if (!stripePrice || !product.stripe_price_id) {
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(product.price * 100), // Convert to pence
            currency: 'gbp',
            recurring: {
              interval: 'month',
              interval_count: 1
            },
            metadata: {
              directus_product_id: product.id,
              product_key: product.key
            }
          });
          console.log(`  ✅ Created Stripe price: ${stripePrice.id}`);
        }

        // Update Directus with Stripe IDs
        const updateResponse = await fetch(`${API_URL}/items/products/${product.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePrice.id
          })
        });

        if (updateResponse.ok) {
          console.log(`  ✅ Updated Directus with Stripe IDs\n`);
        } else {
          const error = await updateResponse.text();
          console.log(`  ❌ Failed to update Directus: ${error}\n`);
        }

      } catch (error) {
        console.error(`  ❌ Error syncing ${product.name}:`, error.message, '\n');
      }
    }

    console.log('🎉 Product sync complete!\n');
    console.log('📊 Summary:');
    console.log('============');
    
    // Fetch updated products to show summary
    const updatedResponse = await fetch(`${API_URL}/items/products?filter[status][_eq]=published`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const { data: updatedProducts } = await updatedResponse.json();
    
    for (const product of updatedProducts) {
      console.log(`\n${product.name}:`);
      console.log(`  Key: ${product.key}`);
      console.log(`  Price: £${product.price}/month`);
      console.log(`  Stripe Product: ${product.stripe_product_id || 'Not set'}`);
      console.log(`  Stripe Price: ${product.stripe_price_id || 'Not set'}`);
    }

    console.log('\n✅ Products are now synced with Stripe!');
    console.log('The website can now use these products for checkout.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

syncProductsWithStripe();