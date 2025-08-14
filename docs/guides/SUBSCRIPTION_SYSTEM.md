# Subscription System Architecture

## Overview

DrawDay uses a flexible subscription system that supports multiple products and tiers, managed through Directus CMS and processed via Stripe.

## System Design

### Products & Tiers

```
Products (in Directus)
├── DrawDay Spinner
│   ├── Starter (£29/mo)
│   ├── Professional (£79/mo)
│   └── Enterprise (£199/mo)
├── Streaming Services (future)
└── Custom Websites (future)
```

### Database Schema

**Products Collection**

- `id`, `name`, `slug`, `category`, `features`, `status`

**Product Tiers Collection**

- `id`, `product_id`, `name`, `stripe_price_id`, `price`, `features`, `limits`

**User Subscriptions Collection**

- `id`, `user_id`, `product_id`, `tier_id`, `stripe_subscription_id`, `status`

## Implementation

### Dynamic Pricing Page

The new pricing page (`/pricing-new`) fetches products from Directus:

```typescript
// Fetches from Directus or uses fallback
const tiers = await getProductTiers('spinner');
```

### Webhook Flow

1. Stripe sends webhook to `/api/stripe-webhook`
2. Webhook verifies signature
3. Updates user subscription in Directus
4. User sees updated status

## Setting Up Directus Collections

Run the setup script to create collections via API:

```bash
node setup-directus-subscriptions.js
```

This creates:

- Products collection
- Product tiers collection
- User subscriptions collection
- Adds stripe_customer_id to users

## Multi-Product Support

Customers can subscribe to multiple products:

- Each subscription tracked separately
- Consolidated billing through Stripe
- Individual management in dashboard

## Future Enhancements

- Usage-based billing
- Bundle discounts
- Annual billing options
- Customer portal for self-service
