# Stripe Configuration Guide

## Step 1: Update Environment Variables

Replace the placeholders in `.env.local` with your actual Stripe keys:

```env
# Replace with your actual Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
```

## Step 2: Create Products in Stripe Dashboard

1. Go to [Stripe Products](https://dashboard.stripe.com/products)
2. Click "Add product"
3. Create three products with these EXACT details:

### Product 1: DrawDay Starter

- **Name**: DrawDay Starter
- **Description**: Perfect for small raffles and community competitions
- **Pricing**:
  - Model: Recurring
  - Price: £29.00
  - Billing period: Monthly
- **Additional options**:
  - ✅ Include free trial period: 14 days
- After creating, copy the Price ID (looks like `price_1OxxxxxxxxxxxxxxxxxxxxYZ`)

### Product 2: DrawDay Professional

- **Name**: DrawDay Professional
- **Description**: For growing competitions with advanced features
- **Pricing**:
  - Model: Recurring
  - Price: £79.00
  - Billing period: Monthly
- **Additional options**:
  - ✅ Include free trial period: 14 days
- After creating, copy the Price ID

### Product 3: DrawDay Enterprise

- **Name**: DrawDay Enterprise
- **Description**: For large organizations with custom needs
- **Pricing**:
  - Model: Recurring
  - Price: £199.00
  - Billing period: Monthly
- **Additional options**:
  - ✅ Include free trial period: 14 days
- After creating, copy the Price ID

## Step 3: Update Price IDs in Environment

Add the Price IDs to your `.env.local`:

```env
STRIPE_PRICE_STARTER=price_YOUR_STARTER_PRICE_ID
STRIPE_PRICE_PROFESSIONAL=price_YOUR_PROFESSIONAL_PRICE_ID
STRIPE_PRICE_ENTERPRISE=price_YOUR_ENTERPRISE_PRICE_ID
```

## Step 4: Set Up Webhook for Local Testing

### Using Stripe CLI (Recommended for Development)

1. Install Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (using scoop)
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

2. Login to Stripe:

```bash
stripe login
```

3. Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

4. Copy the webhook signing secret shown (starts with `whsec_`) and add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

## Step 5: Configure Directus Admin Access

For the webhook to update user subscriptions in Directus, add admin credentials to `.env.local`:

```env
DIRECTUS_ADMIN_EMAIL=your_admin_email@example.com
DIRECTUS_ADMIN_PASSWORD=your_admin_password
```

## Step 6: Update Directus User Schema

The following fields need to be added to the Directus users table:

1. Log in to your Directus admin panel
2. Go to Settings → Data Model → System Collections → Directus Users
3. Add these fields:

| Field Name                        | Type     | Options                   |
| --------------------------------- | -------- | ------------------------- |
| stripe_customer_id                | String   | Optional                  |
| stripe_subscription_id            | String   | Optional                  |
| subscription_status               | String   | Optional, Default: 'free' |
| subscription_tier                 | String   | Optional, Default: 'free' |
| subscription_current_period_end   | DateTime | Optional                  |
| subscription_cancel_at_period_end | Boolean  | Default: false            |

## Step 7: Test the Integration

1. Restart your dev server to load new environment variables:

```bash
pnpm dev
```

2. In another terminal, ensure Stripe CLI is forwarding webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

3. Navigate to http://localhost:3000/pricing

4. Click "Start Free Trial" on any plan

5. Use test card details:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Name: Test User
   - Email: Use your registered user email

6. Complete the checkout

7. Check the terminal running Stripe CLI - you should see webhook events

8. Check the dev server console - you should see subscription update logs

9. Verify in Directus that the user's subscription fields were updated

## Troubleshooting

### "Invalid API Key" Error

- Ensure you're using the correct key format (test keys start with `pk_test_` and `sk_test_`)
- Check there are no extra spaces or line breaks in your `.env.local`

### "No such price" Error

- Make sure you created the products in Stripe
- Verify the Price IDs are copied correctly (not Product IDs)
- Ensure test/live mode matches your keys

### Webhook Not Receiving Events

- Check Stripe CLI is running and forwarding to the correct URL
- Verify the webhook secret is correct in `.env.local`
- Look for errors in the dev server console

### User Not Updated in Directus

- Check Directus admin credentials are correct
- Verify the user email matches between Stripe and Directus
- Check Directus user schema has the required fields
- Look for error logs in the webhook handler

## Production Setup

For production deployment:

1. Use live API keys (start with `pk_live_` and `sk_live_`)
2. Create products in live mode in Stripe
3. Set up production webhook endpoint:
   - Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://drawday.app/api/stripe-webhook`
   - Select all subscription and payment events
   - Copy the signing secret
4. Update production environment variables in Vercel

## Security Notes

- Never commit API keys to git
- Use environment variables for all sensitive data
- Ensure webhook signature verification is enabled
- Keep Directus admin credentials secure
- Use HTTPS in production
