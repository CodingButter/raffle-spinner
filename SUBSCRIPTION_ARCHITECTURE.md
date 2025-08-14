# DrawDay Subscription Architecture

## Overview

DrawDay offers multiple subscription services that customers can subscribe to independently:
- **Spinner Extension** - Chrome extension for raffle draws
- **Streaming Services** - Professional live draw production
- **Custom Websites** - Bespoke competition platforms

Customers should be able to:
- Subscribe to one or more services
- Manage each subscription independently
- View all subscriptions in one dashboard
- Upgrade/downgrade within each service category

## Database Schema (Directus Collections)

### 1. Products Collection
Stores all available products/services

```typescript
interface Product {
  id: string;
  name: string; // "DrawDay Spinner", "Streaming Services", etc.
  slug: string; // "spinner", "streaming", "websites"
  description: string;
  category: 'extension' | 'streaming' | 'website' | 'addon';
  status: 'active' | 'archived';
  features: string[]; // JSON array of features
  icon?: string; // Icon URL or name
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}
```

### 2. Product Tiers Collection
Different pricing tiers for each product

```typescript
interface ProductTier {
  id: string;
  product_id: string; // FK to Products
  name: string; // "Starter", "Professional", "Enterprise"
  slug: string; // "starter", "professional", "enterprise"
  stripe_price_id: string; // Stripe Price ID
  price: number; // In pence (2900 = £29.00)
  currency: string; // "gbp"
  billing_period: 'monthly' | 'yearly';
  trial_days: number; // 14
  features: string[]; // Tier-specific features
  limits: {
    participants?: number; // 5000, 10000, unlimited
    draws_per_month?: number;
    api_calls?: number;
    // ... other limits
  };
  popular: boolean; // Highlight this tier
  sort_order: number;
  status: 'active' | 'archived';
}
```

### 3. User Subscriptions Collection
Active subscriptions for each user

```typescript
interface UserSubscription {
  id: string;
  user_id: string; // FK to directus_users
  product_id: string; // FK to Products
  tier_id: string; // FK to Product Tiers
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  canceled_at?: Date;
  trial_ends_at?: Date;
  metadata: Record<string, any>; // Custom data
  created_at: Date;
  updated_at: Date;
}
```

### 4. Subscription Usage Collection
Track usage for limits and analytics

```typescript
interface SubscriptionUsage {
  id: string;
  subscription_id: string; // FK to User Subscriptions
  metric: string; // "participants_used", "draws_created", etc.
  value: number;
  period_start: Date;
  period_end: Date;
  created_at: Date;
}
```

### 5. Updated directus_users Fields

```typescript
interface DirectusUserExtension {
  // ... existing user fields
  stripe_customer_id?: string; // Single customer ID per user
  default_payment_method?: string;
  subscriptions?: UserSubscription[]; // Relation to User Subscriptions
}
```

## API Endpoints

### Directus Custom Endpoints

#### 1. GET /products
Fetch all available products with their tiers

```typescript
GET https://admin.drawday.app/products
Response: {
  data: Product[]
}
```

#### 2. GET /products/:slug/tiers
Get tiers for a specific product

```typescript
GET https://admin.drawday.app/products/spinner/tiers
Response: {
  data: ProductTier[]
}
```

#### 3. GET /users/me/subscriptions
Get current user's subscriptions

```typescript
GET https://admin.drawday.app/users/me/subscriptions
Headers: { Authorization: "Bearer TOKEN" }
Response: {
  data: UserSubscription[]
}
```

#### 4. POST /subscriptions/checkout
Create Stripe checkout session

```typescript
POST https://admin.drawday.app/subscriptions/checkout
Body: {
  tier_id: string;
  success_url: string;
  cancel_url: string;
}
Response: {
  checkout_url: string;
  session_id: string;
}
```

#### 5. POST /stripe/webhook
Stripe webhook endpoint (public, verified by signature)

```typescript
POST https://admin.drawday.app/stripe/webhook
Headers: { "stripe-signature": "..." }
Body: Stripe Event
```

## Implementation Plan

### Phase 1: Directus Setup
1. Create collections in Directus admin panel
2. Set up relationships between collections
3. Add sample products and tiers
4. Configure permissions

### Phase 2: Directus Extensions
1. Create custom endpoint for products API
2. Create Stripe webhook handler endpoint
3. Implement checkout session creation
4. Add subscription management logic

### Phase 3: Website Integration
1. Update pricing page to fetch from Directus
2. Create subscription management dashboard
3. Implement multi-subscription checkout
4. Add usage tracking

### Phase 4: Stripe Integration
1. Set up webhook endpoint on Directus
2. Map Stripe events to Directus updates
3. Handle subscription lifecycle events
4. Implement usage-based billing (if needed)

## Stripe Webhook Configuration

### For Production (admin.drawday.app)

1. **Create Directus Extension for Webhook**:
   ```javascript
   // extensions/endpoints/stripe-webhook/index.js
   module.exports = {
     id: 'stripe-webhook',
     handler: async (router, { services, exceptions }) => {
       const { ItemsService } = services;
       
       router.post('/', async (req, res) => {
         // Verify Stripe signature
         // Process webhook event
         // Update subscriptions in Directus
       });
     }
   };
   ```

2. **Configure Stripe Dashboard**:
   - Endpoint URL: `https://admin.drawday.app/stripe-webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

## Customer Portal Features

### Subscription Management Page
- View all active subscriptions
- See usage vs limits
- Upgrade/downgrade options
- Cancel subscription
- Update payment method
- Download invoices

### Multi-Subscription Support
- Subscribe to multiple products
- Bundle discounts (optional)
- Consolidated billing
- Individual subscription management

## Example User Flow

1. **Customer visits pricing page**
   - Page fetches products from Directus API
   - Displays all available services and tiers

2. **Customer selects "Spinner Professional + Website Starter"**
   - Creates checkout session with multiple line items
   - Redirects to Stripe Checkout

3. **After successful payment**
   - Stripe webhook updates Directus
   - Creates two subscription records
   - Links to user account

4. **Customer views dashboard**
   - Shows both active subscriptions
   - Display usage for each
   - Upgrade options available

## Benefits of This Architecture

1. **Flexibility**: Easy to add new products/services
2. **Scalability**: Supports unlimited products and tiers
3. **Management**: All pricing managed in Directus
4. **Analytics**: Usage tracking built-in
5. **Customer Experience**: Single dashboard for all services
6. **Billing**: Consolidated or separate billing options

## Migration from Current System

1. Move hardcoded prices to Directus
2. Create products and tiers collections
3. Update webhook to use Directus API
4. Migrate existing subscriptions
5. Update frontend to fetch from API

## Security Considerations

1. Webhook signature verification
2. Rate limiting on API endpoints
3. Secure storage of Stripe keys
4. Audit logging for subscription changes
5. PCI compliance for payment handling