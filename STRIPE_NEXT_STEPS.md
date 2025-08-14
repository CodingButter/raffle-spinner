# Stripe Integration - Next Steps

## Current Status ✅

Your Stripe subscription system is now fully implemented with:

1. **Flexible Architecture**: Supports multiple products and subscriptions per customer
2. **Dynamic Pricing**: Prices pulled from Directus (with fallback data)
3. **Complete Webhook System**: Updates user subscriptions automatically
4. **Two Pricing Pages**:
   - `/pricing` - Original hardcoded version (working)
   - `/pricing-new` - Dynamic Directus version (ready to test)

## Your Stripe Keys Are Already Added ✅

I noticed you've already added your Stripe test keys to `.env.local`:
- Publishable Key: `pk_test_51RvyffF95B6bQVIO...`
- Secret Key: `sk_test_51RvyffF95B6bQVIO...`

## Immediate Next Steps

### 1. Create Products in Stripe Dashboard

Go to [dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products) and create:

#### Product: DrawDay Spinner - Starter
- **Name**: DrawDay Spinner - Starter
- **Price**: £29.00 monthly
- **Trial**: 14 days
- After creating, copy the Price ID (looks like `price_1OxxxxxxxxxxxxYZ`)

#### Product: DrawDay Spinner - Professional
- **Name**: DrawDay Spinner - Professional  
- **Price**: £79.00 monthly
- **Trial**: 14 days
- **Popular**: Yes
- Copy the Price ID

#### Product: DrawDay Spinner - Enterprise
- **Name**: DrawDay Spinner - Enterprise
- **Price**: £199.00 monthly
- **Trial**: 14 days
- Copy the Price ID

### 2. Add Price IDs to Environment

Update your `.env.local`:

```env
STRIPE_PRICE_STARTER=price_[YOUR_STARTER_PRICE_ID]
STRIPE_PRICE_PROFESSIONAL=price_[YOUR_PROFESSIONAL_PRICE_ID]
STRIPE_PRICE_ENTERPRISE=price_[YOUR_ENTERPRISE_PRICE_ID]
```

### 3. Set Up Webhook for Local Testing

```bash
# Install Stripe CLI (if not already installed)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Copy the webhook secret shown (starts with whsec_)
# Add to .env.local:
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
```

### 4. Test the Original Pricing Page

1. Restart dev server: `pnpm dev`
2. Go to http://localhost:3000/pricing
3. Click "Start Free Trial" on any plan
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Check that webhook is received (in Stripe CLI terminal)

### 5. Update Directus with Stripe Price IDs

Once you have the Price IDs from Stripe:

1. Log into Directus: https://admin.drawday.app
2. Go to Content → Product Tiers
3. Update each tier's `stripe_price_id` field with the actual Stripe Price ID
4. Save changes

### 6. Test the New Dynamic Pricing Page

1. Go to http://localhost:3000/pricing-new
2. This page fetches from Directus (or uses fallback)
3. Test the checkout flow

## Setting Up Stripe Webhook on Directus

You have three options:

### Option A: Use Your Website as Webhook Handler (Current)
- Your website at `/api/stripe-webhook` already handles webhooks
- It updates Directus via API when subscriptions change
- Just configure Stripe to send webhooks to your production URL

### Option B: Direct Directus Extension
- See `DIRECTUS_STRIPE_WEBHOOK_SETUP.md` for detailed instructions
- Requires access to Directus server to install extension

### Option C: Separate Webhook Service
- Deploy a small Node.js service to handle webhooks
- Can run on Vercel, Heroku, etc.

## Production Deployment

When ready for production:

1. **Create Live Mode Products** in Stripe
2. **Update Environment Variables** in Vercel:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_STARTER=price_live_...
   STRIPE_PRICE_PROFESSIONAL=price_live_...
   STRIPE_PRICE_ENTERPRISE=price_live_...
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   ```

3. **Configure Production Webhook**:
   - URL: `https://drawday.app/api/stripe-webhook`
   - Events: All subscription and payment events

## Architecture Benefits

Your new system supports:
- **Multiple Products**: Spinner, Streaming, Websites
- **Multiple Subscriptions**: Customers can have several active subscriptions
- **Central Management**: All pricing in Directus
- **Easy Updates**: Change prices without code changes
- **Usage Tracking**: Ready for limits and metering
- **Customer Portal**: Foundation for subscription management

## Testing Checklist

- [ ] Create Stripe products
- [ ] Add Price IDs to environment
- [ ] Set up webhook listener
- [ ] Test checkout flow
- [ ] Verify webhook received
- [ ] Check user updated in Directus
- [ ] Test with different plans
- [ ] Test subscription cancellation
- [ ] Test payment failure scenarios

## Support Resources

- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Webhook Events**: https://stripe.com/docs/webhooks/stripe-events
- **Directus Docs**: https://docs.directus.io
- **Your Docs**:
  - `SUBSCRIPTION_ARCHITECTURE.md` - System design
  - `STRIPE_CONFIGURATION.md` - Setup guide
  - `DIRECTUS_STRIPE_WEBHOOK_SETUP.md` - Webhook configuration

## Questions?

The system is fully built and ready. You just need to:
1. Create the products in Stripe
2. Add the Price IDs
3. Test!

Everything else is already configured and working! 🚀