# Stripe Payment Setup Guide

## Prerequisites

- Stripe account (create at https://stripe.com)
- Access to Stripe Dashboard

## Step 1: Get API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your keys:
   - **Publishable key**: `pk_test_...` (for client-side)
   - **Secret key**: `sk_test_...` (for server-side)

## Step 2: Create Products in Stripe

1. Go to https://dashboard.stripe.com/products
2. Create three products:

### Starter Plan

- **Name**: DrawDay Starter
- **Description**: Perfect for small raffles
- **Price**: £29/month
- **Billing**: Recurring monthly
- **Trial period**: 14 days

### Professional Plan

- **Name**: DrawDay Professional
- **Description**: For growing competitions
- **Price**: £79/month
- **Billing**: Recurring monthly
- **Trial period**: 14 days

### Enterprise Plan

- **Name**: DrawDay Enterprise
- **Description**: For large organizations
- **Price**: £199/month
- **Billing**: Recurring monthly
- **Trial period**: 14 days

3. After creating each product, copy the Price ID (looks like `price_1234...`)

## Step 3: Set Up Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL:
   - **Local testing**: Use ngrok or similar: `https://your-ngrok-url.ngrok.io/api/stripe-webhook`
   - **Production**: `https://drawday.app/api/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the Signing secret (starts with `whsec_...`)

## Step 4: Configure Environment Variables

Create or update `.env.local`:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Stripe Product Price IDs
STRIPE_PRICE_STARTER=price_starter_id_here
STRIPE_PRICE_PROFESSIONAL=price_professional_id_here
STRIPE_PRICE_ENTERPRISE=price_enterprise_id_here

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 5: Test Locally

### Using Stripe CLI (Recommended)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```
4. Copy the webhook signing secret shown and update `STRIPE_WEBHOOK_SECRET`

### Test Cards

Use these test card numbers:

- **Success**: 4242 4242 4242 4242
- **Requires authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 9995

Use any future date for expiration and any 3-digit CVC.

## Step 6: Test Checkout Flow

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Navigate to http://localhost:3000/pricing

3. Click "Start Free Trial" on any plan

4. Complete checkout with test card

5. Check webhook logs in Stripe Dashboard or CLI

## Step 7: Production Deployment

1. Update environment variables in Vercel:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all Stripe variables for Production environment
   - Use live keys (starts with `pk_live_` and `sk_live_`)

2. Update webhook endpoint in Stripe:
   - Create new webhook for `https://drawday.app/api/stripe-webhook`
   - Copy the production webhook secret

3. Enable live mode in Stripe Dashboard

## Troubleshooting

### "No such price" error

- Make sure you're using the Price ID, not Product ID
- Check that test/live modes match (test keys with test prices)

### Webhook signature verification failed

- Ensure `STRIPE_WEBHOOK_SECRET` matches the signing secret
- Check that raw body is being used for signature verification

### Checkout doesn't redirect

- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for errors
- Ensure Stripe.js is loaded

## Security Best Practices

1. **Never expose secret keys**: Only use `STRIPE_SECRET_KEY` on server-side
2. **Validate webhooks**: Always verify webhook signatures
3. **Use HTTPS**: Required for production
4. **Implement rate limiting**: Protect API endpoints
5. **Log everything**: Keep audit trails of all payment events

## Additional Features to Implement

- [ ] Customer portal for subscription management
- [ ] Invoice downloads
- [ ] Payment method updates
- [ ] Subscription pause/resume
- [ ] Usage-based billing for enterprise
- [ ] Coupon codes
- [ ] Tax handling (UK VAT)

## Support

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Test Dashboard**: https://dashboard.stripe.com/test
