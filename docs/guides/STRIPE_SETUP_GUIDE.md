# Stripe Payment Setup Guide

This guide covers everything you need to set up Stripe payments for DrawDay.

## Quick Start

### 1. Add Your Stripe Keys

Your Stripe test keys are already in `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RvyffF95B6bQVIO...
STRIPE_SECRET_KEY=sk_test_51RvyffF95B6bQVIO...
```

### 2. Create Products in Stripe

Go to [dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products) and create:

| Product                        | Price      | Trial   | Price ID to Copy |
| ------------------------------ | ---------- | ------- | ---------------- |
| DrawDay Spinner - Starter      | £29/month  | 14 days | `price_xxx`      |
| DrawDay Spinner - Professional | £79/month  | 14 days | `price_xxx`      |
| DrawDay Spinner - Enterprise   | £199/month | 14 days | `price_xxx`      |

### 3. Add Price IDs to Environment

```env
STRIPE_PRICE_STARTER=price_[YOUR_STARTER_ID]
STRIPE_PRICE_PROFESSIONAL=price_[YOUR_PROFESSIONAL_ID]
STRIPE_PRICE_ENTERPRISE=price_[YOUR_ENTERPRISE_ID]
```

### 4. Set Up Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks locally
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Add webhook secret to .env.local
STRIPE_WEBHOOK_SECRET=whsec_[SHOWN_IN_CLI]
```

### 5. Test Checkout

1. Restart dev server: `pnpm dev`
2. Visit http://localhost:3000/pricing
3. Click "Start Free Trial"
4. Use test card: `4242 4242 4242 4242`

## Production Setup

### Environment Variables (Vercel)

```env
# Live Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Live Price IDs
STRIPE_PRICE_STARTER=price_live_...
STRIPE_PRICE_PROFESSIONAL=price_live_...
STRIPE_PRICE_ENTERPRISE=price_live_...

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Directus Admin (for updating subscriptions)
DIRECTUS_ADMIN_EMAIL=admin@drawday.app
DIRECTUS_ADMIN_PASSWORD=your_password
```

### Configure Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://drawday.app/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.*`
   - `invoice.payment_*`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## How It Works

### User Flow

1. User selects plan on `/pricing`
2. Redirected to Stripe Checkout
3. Completes payment
4. Webhook updates user in Directus
5. User sees active subscription in dashboard

### Technical Flow

```
User → Pricing Page → Checkout Session API → Stripe Checkout
                                                    ↓
Dashboard ← Directus Update ← Webhook Handler ← Stripe Webhook
```

## Files Reference

| File                                        | Purpose                          |
| ------------------------------------------- | -------------------------------- |
| `/app/pricing/page.tsx`                     | Current pricing page (hardcoded) |
| `/app/pricing-new/page.tsx`                 | Dynamic pricing (Directus)       |
| `/app/api/create-checkout-session/route.ts` | Creates Stripe checkout          |
| `/app/api/stripe-webhook/route.ts`          | Handles Stripe webhooks          |
| `/lib/stripe.ts`                            | Stripe configuration             |
| `/lib/directus-admin.ts`                    | Updates user subscriptions       |

## Troubleshooting

### "Invalid API Key"

- Check for extra spaces in `.env.local`
- Ensure using test keys for test mode

### "No such price"

- Verify Price IDs (not Product IDs)
- Check test/live mode matches

### Webhook Not Working

- Check Stripe CLI is running
- Verify webhook secret is correct
- Check server logs for errors

### User Not Updated

- Verify Directus admin credentials
- Check user email matches
- Ensure webhook received (check Stripe dashboard)

## Test Cards

| Scenario      | Card Number           |
| ------------- | --------------------- |
| Success       | `4242 4242 4242 4242` |
| Requires Auth | `4000 0025 0000 3155` |
| Declined      | `4000 0000 0000 9995` |

Use any future expiry date and any 3-digit CVC.

## Support

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Test Dashboard](https://dashboard.stripe.com/test)
