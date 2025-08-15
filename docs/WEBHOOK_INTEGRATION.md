# Stripe Webhook Integration Documentation

## Overview

The DrawDay platform uses Stripe webhooks to keep subscription data synchronized between Stripe and our Directus database. This ensures accurate subscription status, tier information, and payment tracking.

## Architecture

### Webhook Endpoints

1. **Production Endpoint**: `/api/stripe-webhook`
   - Main webhook handler for production use
   - Basic event handling for critical events

2. **Enhanced Endpoint**: `/api/stripe-webhook-enhanced`
   - Advanced webhook handler with comprehensive error handling
   - Duplicate event detection
   - Detailed logging and monitoring
   - Health check endpoint at GET request

### Handled Events

The system processes the following Stripe events:

#### Subscription Events
- `checkout.session.completed` - New subscription via checkout
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription modified (tier change, etc.)
- `customer.subscription.deleted` - Subscription canceled
- `customer.subscription.paused` - Subscription paused
- `customer.subscription.resumed` - Subscription resumed
- `customer.subscription.trial_will_end` - Trial ending notification

#### Payment Events
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment
- `invoice.upcoming` - Upcoming invoice notification

#### Additional Events (Enhanced Handler)
- `payment_method.attached` - Payment method added
- `payment_method.detached` - Payment method removed
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed
- `charge.dispute.created` - Dispute initiated
- `charge.refunded` - Refund processed

## Database Integration

### Collections Used

1. **subscription_tiers**
   - Stores available subscription tiers (starter, pro, enterprise)
   - Fields: tier_key, name, max_contestants, max_raffles, features

2. **subscriptions**
   - Stores user subscription records
   - Links users to tiers and products
   - Tracks Stripe subscription IDs and status

3. **products**
   - Product catalog with Stripe product/price IDs
   - Categories: spinner, streaming, website

4. **users** (directus_users)
   - Extended with subscription fields for backward compatibility
   - Fields: stripe_customer_id, stripe_subscription_id, subscription_status, etc.

### Data Flow

1. Stripe sends webhook event to our endpoint
2. Webhook signature is verified using STRIPE_WEBHOOK_SECRET
3. Event is processed based on type
4. Customer email is retrieved from Stripe
5. User is looked up in Directus by email
6. Subscription tier is determined from price ID
7. Subscription record is created/updated in database
8. User fields are updated for backward compatibility

## Configuration

### Environment Variables

Required environment variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Directus Configuration
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_ADMIN_EMAIL=admin@drawday.app
DIRECTUS_ADMIN_PASSWORD=your_password
```

### Stripe Dashboard Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook-enhanced`
3. Select events to listen for (see Handled Events above)
4. Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET

## Error Handling

### Enhanced Features

1. **Duplicate Event Detection**
   - Prevents processing the same event multiple times
   - 1-minute window for duplicate detection

2. **Admin Token Caching**
   - Reduces Directus API calls
   - 14-minute cache (tokens expire at 15)

3. **Fallback Mechanisms**
   - Customer email retrieval with fallbacks
   - Tier detection from multiple sources
   - Graceful handling of missing data

4. **Error Logging**
   - Detailed console logging with emojis for clarity
   - Optional webhook_errors collection for persistent logging
   - Processing time tracking

### Error Recovery

- Non-critical errors return 200 to prevent Stripe retries
- Critical errors (auth failures) return 500 for retry
- All errors are logged with full context

## Testing

### Test Scripts

1. **Webhook Test** (`__tests__/test-stripe-webhook.ts`)
   - Simulates all webhook event types
   - Verifies endpoint connectivity
   - Tests signature validation

2. **Database Integration Test** (`__tests__/test-webhook-db-integration.ts`)
   - Verifies database structure
   - Checks required collections and fields
   - Tests authentication and permissions

3. **Tier Management** (`__tests__/add-enterprise-tier.ts`)
   - Adds missing subscription tiers
   - Verifies tier configuration

### Running Tests

```bash
# Install dependencies
pnpm add -D dotenv

# Run webhook tests
npx tsx __tests__/test-stripe-webhook.ts

# Run database integration tests
npx tsx __tests__/test-webhook-db-integration.ts

# Add missing tiers
npx tsx __tests__/add-enterprise-tier.ts
```

## Monitoring

### Health Check

GET request to `/api/stripe-webhook-enhanced` returns:

```json
{
  "status": "ok",
  "webhook": "stripe-webhook-enhanced",
  "handledEvents": [...],
  "configured": true,
  "timestamp": "2025-08-15T..."
}
```

### Logging

All webhook events are logged with:
- Event type and ID
- Processing time
- Success/failure status
- Error details if failed

Example log output:
```
============================================================
📨 Webhook received: customer.subscription.updated
   Event ID: evt_1234567890
   Created: 2025-08-15T10:30:00.000Z
🔄 Processing customer.subscription.updated: sub_ABC123
📊 Plan upgrade: user@example.com → pro
✅ Subscription updated for user@example.com
✅ Successfully processed customer.subscription.updated
✅ Event processed successfully in 245ms
============================================================
```

## Troubleshooting

### Common Issues

1. **"No signature provided"**
   - Ensure Stripe is sending the stripe-signature header
   - Check webhook configuration in Stripe Dashboard

2. **"Invalid signature"**
   - Verify STRIPE_WEBHOOK_SECRET matches Dashboard
   - Check for proxy modifications to request body

3. **"Failed to authenticate with Directus"**
   - Verify DIRECTUS_ADMIN_EMAIL and PASSWORD
   - Ensure Directus is running

4. **"User not found"**
   - User must exist in Directus before subscription
   - Consider implementing user auto-creation

5. **"Tier not found"**
   - Run tier setup script to add missing tiers
   - Verify price ID mappings

### Debug Mode

Enable detailed logging by checking console output. The enhanced handler provides:
- Emoji-prefixed status messages
- Processing time measurements
- Full error stack traces
- Event data dumps on failure

## Security Considerations

1. **Webhook Signature Validation**
   - All requests are validated using Stripe's signature
   - Prevents replay attacks and forgery

2. **Admin Token Security**
   - Tokens are cached in memory only
   - Auto-refresh before expiration
   - Never exposed in responses

3. **Rate Limiting**
   - Duplicate event detection prevents spam
   - Non-critical errors don't trigger retries

4. **Data Sanitization**
   - All user input is properly escaped
   - SQL injection prevention via Directus API

## Future Improvements

1. **Email Notifications**
   - Send emails for subscription changes
   - Payment failure notifications
   - Trial ending reminders

2. **Audit Logging**
   - Create audit_logs collection
   - Track all subscription changes
   - Compliance reporting

3. **Metrics Collection**
   - Track webhook processing times
   - Monitor failure rates
   - Alert on anomalies

4. **User Auto-Creation**
   - Automatically create users on first subscription
   - Sync user data from Stripe

5. **Retry Queue**
   - Implement retry logic for failed updates
   - Dead letter queue for persistent failures