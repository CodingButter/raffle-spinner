# Production Webhook Setup for DrawDay

## Important Note
The webhook extension isn't loading properly in Directus 10.10 locally. This might be a version-specific issue. For production deployment to admin.drawday.app, follow these steps:

## Files to Deploy

Copy these files to your production server:

1. **Webhook Extension**: `extensions/endpoints/stripe-webhook.js`
2. **Package Dependencies**: `extensions/endpoints/stripe-webhook/package.json`

## Production Deployment Steps

### 1. SSH into Production Server

```bash
ssh your-server
cd /path/to/directus
```

### 2. Create Extension Files

Create the extension directory:
```bash
mkdir -p extensions/endpoints/stripe-webhook
```

Copy the webhook file:
```bash
# Copy stripe-webhook.js content to:
extensions/endpoints/stripe-webhook/index.js
```

Copy package.json:
```bash
# Copy package.json content to:
extensions/endpoints/stripe-webhook/package.json
```

### 3. Install Dependencies

```bash
cd extensions/endpoints/stripe-webhook
npm install
```

### 4. Add Environment Variables

Add to your production `.env`:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_Adxnon3Vj3KgTh9LQHIxtUIJ4XjTCVR4
```

### 5. Add User Fields

Run the setup script to add fields to directus_users:
```bash
node setup-directus-fields.js
```

Or manually add these fields via Directus Admin:
- `stripe_customer_id` (string)
- `stripe_subscription_id` (string)
- `subscription_status` (dropdown: free, trialing, active, past_due, canceled, unpaid)
- `subscription_tier` (dropdown: free, starter, professional, enterprise)
- `subscription_current_period_end` (datetime)
- `subscription_cancel_at_period_end` (boolean)

### 6. Restart Directus

```bash
# Using PM2
pm2 restart directus

# Or using systemctl
sudo systemctl restart directus

# Or using Docker
docker-compose restart directus
```

### 7. Test the Webhook

Test the health endpoint:
```bash
curl https://admin.drawday.app/stripe-webhook/health
```

Expected response:
```json
{
  "status": "ok",
  "webhook_configured": true,
  "stripe_configured": true,
  "stripe_initialized": true
}
```

### 8. Configure Stripe Dashboard

1. Go to [Stripe Test Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint URL: `https://admin.drawday.app/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Use signing secret: `whsec_Adxnon3Vj3KgTh9LQHIxtUIJ4XjTCVR4`

## Alternative: Use Existing Backend Infrastructure

If the Directus webhook extension continues to have issues, you can:

1. **Create a separate webhook service** on your server that receives Stripe webhooks
2. **Use the Directus API** to update user subscriptions from that service
3. **Deploy as a standalone Node.js service** alongside Directus

## Local Development Workaround

For local development, you can:

1. Use ngrok to expose your local webhook endpoint
2. Point directly to production Directus (https://admin.drawday.app)
3. Create a mock webhook endpoint for testing

## Troubleshooting

### Extension Not Loading
- Check Directus version compatibility
- Verify file permissions (should be readable by Directus user)
- Check Directus logs: `pm2 logs directus`
- Ensure `EXTENSIONS_AUTO_RELOAD=true` in environment

### Webhook Signature Failing
- Verify raw body is being used (not parsed JSON)
- Check that signing secret matches exactly
- Ensure no proxy is modifying the request body

### User Not Updating
- Verify user fields exist in directus_users
- Check that email addresses match between Stripe and Directus
- Review Directus logs for permission errors

## Next Steps

1. Deploy webhook to production
2. Test with real Stripe events
3. Monitor webhook logs
4. Set up production Stripe keys when ready