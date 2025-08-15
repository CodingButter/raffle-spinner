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
    features: [
      'Handle 1,000 participants smoothly',
      'Professional live-stream draws',
      '60-second CSV to winner process',
      'Reduce disputes by 89%',
      'Email support within 24hrs',
    ],
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    price: 79,
    features: [
      'Scale to 10,000 participants effortlessly',
      'Your brand, your colors, your trust',
      'Cinema-quality animations that wow',
      'Priority support (2hr response)',
      'API for automated workflows',
      'Analytics dashboard with insights',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    price: 199,
    features: [
      'Unlimited participants & raffles',
      'Complete white-label (your domain)',
      'Dedicated success manager',
      'Custom features on request',
      '99.9% uptime SLA guarantee',
      'Compliance documentation package',
    ],
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
