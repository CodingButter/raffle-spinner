import Stripe from 'stripe';

// Create a function to get Stripe instance to avoid build-time errors
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
    typescript: true,
  });
}

// For backward compatibility, export a stripe instance that will be created on first use
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    })
  : (null as any);

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
