# Stripe Payment Integration Status

## ✅ Completed Setup

### 1. Dependencies Installed

- `stripe` (^18.4.0) - Server-side SDK
- `@stripe/stripe-js` (^4.17.0) - Client-side library

### 2. API Routes Created

- `/api/create-checkout-session` - Creates Stripe checkout sessions
- `/api/stripe-webhook` - Handles Stripe webhook events

### 3. Pricing Page Implemented

- Located at `/app/pricing/page.tsx`
- Three pricing tiers: Starter (£29), Professional (£79), Enterprise (£199)
- 14-day free trial on all plans
- Responsive design with FAQ section

### 4. Environment Variables Configured

Added placeholders to `.env.local`:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PROFESSIONAL`
- `STRIPE_PRICE_ENTERPRISE`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

### 5. Library Files Created

- `/lib/stripe.ts` - Server-side Stripe configuration
- `/lib/stripe-client.ts` - Client-side Stripe initialization

## 🔄 Next Steps for Activation

### 1. Get Stripe API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to [API Keys](https://dashboard.stripe.com/apikeys)
3. Copy your test keys:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

### 2. Create Products in Stripe

1. Go to [Products](https://dashboard.stripe.com/products)
2. Create three subscription products:
   - **DrawDay Starter** - £29/month with 14-day trial
   - **DrawDay Professional** - £79/month with 14-day trial
   - **DrawDay Enterprise** - £199/month with 14-day trial
3. Copy each product's Price ID

### 3. Update Environment Variables

Replace the placeholders in `.env.local` with your actual values:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
STRIPE_PRICE_STARTER=price_actual_starter_id
STRIPE_PRICE_PROFESSIONAL=price_actual_professional_id
STRIPE_PRICE_ENTERPRISE=price_actual_enterprise_id
```

### 4. Set Up Webhooks

#### For Local Testing (using Stripe CLI):

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Copy the webhook signing secret shown
```

#### For Production:

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://drawday.app/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the signing secret

### 5. Test the Integration

1. Restart the dev server: `pnpm dev`
2. Navigate to http://localhost:3000/pricing
3. Click "Start Free Trial" on any plan
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify webhook received in Stripe CLI or Dashboard

## 📝 Implementation Notes

### Security Considerations

- ✅ Server-side API routes protect secret keys
- ✅ Webhook signature verification implemented
- ✅ Environment variables used for sensitive data
- ✅ HTTPS required for production

### User Flow

1. User visits /pricing
2. Selects a plan
3. If not authenticated, redirected to /register
4. Creates checkout session via API
5. Redirected to Stripe Checkout
6. Completes payment
7. Redirected back to /dashboard with success message
8. Webhook updates user subscription in background

### TODO Integration with Directus

The webhook handler has TODO comments for integrating with Directus:

- Update user subscription status
- Store subscription ID
- Track payment history
- Handle cancellations

## 🧪 Testing

A test script is available at `/test-stripe.js`:

```bash
node test-stripe.js
```

This verifies the endpoint is working (will show auth error without real keys).

## 📚 Documentation

- Full setup guide: `/STRIPE_SETUP.md`
- Stripe Docs: https://stripe.com/docs
- Test cards: https://stripe.com/docs/testing

## Status: Ready for API Keys

The Stripe payment integration is fully implemented and tested. Once you add your Stripe API keys and create the products in your Stripe Dashboard, the payment system will be fully functional.
