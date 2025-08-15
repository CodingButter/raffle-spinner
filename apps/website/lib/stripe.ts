import Stripe from 'stripe';

// Re-export products from separate file to avoid importing Stripe SDK on client
export { PRODUCTS, type ProductKey } from './stripe-products';

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
