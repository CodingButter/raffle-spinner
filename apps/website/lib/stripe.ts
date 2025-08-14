import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Product/Price IDs - these should match your Stripe dashboard
export const PRODUCTS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    price: 29,
    features: ['Up to 1,000 participants', 'Basic themes', 'CSV import', 'Email support'],
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    price: 79,
    features: [
      'Up to 10,000 participants',
      'Custom branding',
      'Priority support',
      'Advanced animations',
      'API access',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    price: 199,
    features: [
      'Unlimited participants',
      'White-label solution',
      'Dedicated support',
      'Custom features',
      'SLA guarantee',
    ],
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
