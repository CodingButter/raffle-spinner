# Setting Up Stripe Webhook on Directus

This guide explains how to configure Stripe webhooks to update user subscriptions in your Directus instance at admin.drawday.app.

## Overview

When a customer subscribes through Stripe, we need to:
1. Receive webhook events from Stripe
2. Verify the webhook signature
3. Update the user's subscription in Directus

## Option 1: Using Directus Extensions (Recommended)

### Step 1: Create a Directus Extension

Create a custom endpoint extension in your Directus instance:

1. SSH into your Directus server or access the file system
2. Navigate to your Directus installation directory
3. Create the extension:

```bash
cd extensions
mkdir -p endpoints/stripe-webhook
```

4. Create `extensions/endpoints/stripe-webhook/index.js`:

```javascript
module.exports = {
  id: 'stripe-webhook',
  handler: (router, { services, exceptions, database }) => {
    const { ItemsService } = services;
    const { ServiceUnavailableException } = exceptions;
    
    // Import Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    router.post('/', async (req, res) => {
      const sig = req.headers['stripe-signature'];
      let event;
      
      try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
          req.rawBody || req.body,
          sig,
          endpointSecret
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      
      // Handle the event
      try {
        const usersService = new ItemsService('directus_users', {
          schema: req.schema,
          accountability: { admin: true }
        });
        
        const subscriptionsService = new ItemsService('user_subscriptions', {
          schema: req.schema,
          accountability: { admin: true }
        });
        
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object;
            
            // Get full session with line items
            const fullSession = await stripe.checkout.sessions.retrieve(
              session.id,
              { expand: ['line_items', 'subscription'] }
            );
            
            if (fullSession.customer_email && fullSession.subscription) {
              const subscription = fullSession.subscription;
              
              // Find user by email
              const users = await usersService.readByQuery({
                filter: { email: { _eq: fullSession.customer_email } },
                limit: 1
              });
              
              if (users && users.length > 0) {
                const userId = users[0].id;
                
                // Update user's stripe_customer_id
                await usersService.updateOne(userId, {
                  stripe_customer_id: fullSession.customer
                });
                
                // Create or update subscription record
                await subscriptionsService.createOne({
                  user_id: userId,
                  stripe_subscription_id: subscription.id,
                  stripe_customer_id: fullSession.customer,
                  status: subscription.status,
                  current_period_start: new Date(subscription.current_period_start * 1000),
                  current_period_end: new Date(subscription.current_period_end * 1000),
                  tier_id: session.metadata?.tierId || null,
                  product_id: session.metadata?.productId || null
                });
                
                console.log(`Subscription created for user ${fullSession.customer_email}`);
              }
            }
            break;
          }
          
          case 'customer.subscription.updated': {
            const subscription = event.data.object;
            
            // Update subscription record
            const subs = await subscriptionsService.readByQuery({
              filter: { stripe_subscription_id: { _eq: subscription.id } },
              limit: 1
            });
            
            if (subs && subs.length > 0) {
              await subscriptionsService.updateOne(subs[0].id, {
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000),
                cancel_at_period_end: subscription.cancel_at_period_end
              });
            }
            break;
          }
          
          case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            
            // Mark subscription as canceled
            const subs = await subscriptionsService.readByQuery({
              filter: { stripe_subscription_id: { _eq: subscription.id } },
              limit: 1
            });
            
            if (subs && subs.length > 0) {
              await subscriptionsService.updateOne(subs[0].id, {
                status: 'canceled',
                canceled_at: new Date()
              });
            }
            break;
          }
        }
        
        res.json({ received: true });
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    });
  }
};
```

### Step 2: Add Environment Variables to Directus

Add these to your Directus `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 3: Restart Directus

```bash
pm2 restart directus
# or
systemctl restart directus
# or
docker-compose restart
```

### Step 4: Configure Stripe Dashboard

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter endpoint URL: `https://admin.drawday.app/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the signing secret and add it to your Directus `.env` as `STRIPE_WEBHOOK_SECRET`

## Option 2: Using a Proxy Server (Alternative)

If you can't modify Directus directly, you can create a proxy server:

### Step 1: Create a Webhook Proxy

Deploy this Node.js app on a separate server or service like Vercel:

```javascript
// webhook-proxy.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch');

const app = express();
app.use(express.raw({ type: 'application/json' }));

app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Forward to Directus API
  try {
    // Authenticate with Directus
    const authResponse = await fetch('https://admin.drawday.app/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.DIRECTUS_ADMIN_EMAIL,
        password: process.env.DIRECTUS_ADMIN_PASSWORD
      })
    });
    
    const { data: { access_token } } = await authResponse.json();
    
    // Process webhook based on event type
    // ... (implement webhook processing logic)
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

app.listen(3000);
```

### Step 2: Deploy the Proxy

Deploy to Vercel, Heroku, or your own server, then point Stripe webhooks to this proxy URL.

## Option 3: Using Next.js Website as Proxy (Current Implementation)

Your current implementation in `/apps/website/app/api/stripe-webhook/route.ts` already handles webhooks and updates Directus. To use this:

### Step 1: Configure Stripe Dashboard

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://drawday.app/api/stripe-webhook` (or your production URL)
3. Select the required events
4. Copy the signing secret

### Step 2: Update Production Environment Variables

In Vercel or your hosting platform, add:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
DIRECTUS_ADMIN_EMAIL=admin@drawday.app
DIRECTUS_ADMIN_PASSWORD=your_password
```

## Testing the Webhook

### For Local Testing

Use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
```

### For Production Testing

1. Create a test subscription through your pricing page
2. Check Stripe Dashboard → Webhooks → View webhook attempts
3. Verify the webhook was received successfully
4. Check Directus to confirm user subscription was updated

## Troubleshooting

### Common Issues

1. **Signature Verification Failed**
   - Ensure you're using the correct webhook secret
   - Make sure you're using the raw request body for verification

2. **User Not Found**
   - Verify the email in Stripe matches the Directus user email
   - Check that the user exists in Directus before subscribing

3. **Permissions Error**
   - Ensure the Directus admin credentials have full access
   - Check that collections and fields exist

4. **Timeout Errors**
   - Webhook endpoints must respond within 20 seconds
   - Consider using background jobs for heavy processing

## Security Considerations

1. **Always verify webhook signatures** to ensure requests are from Stripe
2. **Use HTTPS** for all webhook endpoints
3. **Store secrets securely** in environment variables
4. **Implement idempotency** to handle duplicate webhook deliveries
5. **Log all webhook events** for debugging and audit trails

## Next Steps

After setting up the webhook:

1. Create your Stripe products and price IDs
2. Update the product_tiers in Directus with actual Stripe price IDs
3. Test the full subscription flow
4. Monitor webhook logs for any issues
5. Set up customer portal for subscription management