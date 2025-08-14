/**
 * Directus Products Service
 * Fetches products and pricing from Directus
 */

import { createDirectus, rest, readItems } from '@directus/sdk';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  features: string[];
  icon?: string;
  sort_order: number;
  status: string;
  tiers?: ProductTier[];
}

interface ProductTier {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  stripe_price_id: string;
  price: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';
  trial_days: number;
  features: string[];
  limits: Record<string, any>;
  popular: boolean;
  sort_order: number;
  status: string;
}

interface DirectusSchema {
  products: Product[];
  product_tiers: ProductTier[];
}

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.drawday.app';

const client = createDirectus<DirectusSchema>(directusUrl).with(rest());

export async function getProducts() {
  try {
    const products = await client.request(
      readItems('products', {
        filter: {
          status: {
            _eq: 'active',
          },
        },
        sort: ['sort_order'],
      })
    );
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Return fallback data if Directus is not configured yet
    return getFallbackProducts();
  }
}

export async function getProductTiers(productSlug: string) {
  try {
    // First get the product
    const products = await client.request(
      readItems('products', {
        filter: {
          slug: {
            _eq: productSlug,
          },
        },
        limit: 1,
      })
    );

    if (!products || products.length === 0) {
      return getFallbackTiers(productSlug);
    }

    const productId = products[0].id;

    // Then get its tiers
    const tiers = await client.request(
      readItems('product_tiers', {
        filter: {
          product_id: {
            _eq: productId,
          },
          status: {
            _eq: 'active',
          },
        },
        sort: ['sort_order'],
      })
    );

    return tiers;
  } catch (error) {
    console.error('Failed to fetch product tiers:', error);
    return getFallbackTiers(productSlug);
  }
}

// Fallback data when Directus is not configured
function getFallbackProducts(): Product[] {
  return [
    {
      id: '1',
      name: 'DrawDay Spinner',
      slug: 'spinner',
      description: 'Professional raffle spinner Chrome extension',
      category: 'extension',
      features: ['Unlimited raffles', 'CSV import', 'Custom themes', 'Winner history'],
      icon: 'casino',
      sort_order: 1,
      status: 'active',
    },
    {
      id: '2',
      name: 'Streaming Services',
      slug: 'streaming',
      description: 'Professional live draw production',
      category: 'streaming',
      features: ['Live streaming', 'Custom overlays', 'Multi-camera'],
      icon: 'live_tv',
      sort_order: 2,
      status: 'active',
    },
    {
      id: '3',
      name: 'Custom Websites',
      slug: 'websites',
      description: 'Bespoke competition websites',
      category: 'website',
      features: ['Custom design', 'Payment integration', 'Admin dashboard'],
      icon: 'web',
      sort_order: 3,
      status: 'active',
    },
  ];
}

function getFallbackTiers(productSlug: string): ProductTier[] {
  if (productSlug !== 'spinner') return [];

  // Use actual Stripe price IDs from environment if available
  const starterPriceId = process.env.STRIPE_PRICE_STARTER || '';
  const professionalPriceId = process.env.STRIPE_PRICE_PROFESSIONAL || '';
  const enterprisePriceId = process.env.STRIPE_PRICE_ENTERPRISE || '';

  return [
    {
      id: '1',
      product_id: '1',
      name: 'Starter',
      slug: 'starter',
      stripe_price_id: starterPriceId,
      price: 2900,
      currency: 'gbp',
      billing_period: 'monthly',
      trial_days: 14,
      features: ['Up to 5,000 participants', 'Basic themes', 'Email support'],
      limits: { participants: 5000 },
      popular: false,
      sort_order: 1,
      status: 'active',
    },
    {
      id: '2',
      product_id: '1',
      name: 'Professional',
      slug: 'professional',
      stripe_price_id: professionalPriceId,
      price: 7900,
      currency: 'gbp',
      billing_period: 'monthly',
      trial_days: 14,
      features: ['Up to 50,000 participants', 'Advanced themes', 'Priority support', 'API access'],
      limits: { participants: 50000 },
      popular: true,
      sort_order: 2,
      status: 'active',
    },
    {
      id: '3',
      product_id: '1',
      name: 'Enterprise',
      slug: 'enterprise',
      stripe_price_id: enterprisePriceId,
      price: 19900,
      currency: 'gbp',
      billing_period: 'monthly',
      trial_days: 14,
      features: ['Unlimited participants', 'Custom branding', 'Dedicated support', 'White label'],
      limits: { participants: -1 },
      popular: false,
      sort_order: 3,
      status: 'active',
    },
  ];
}

export type { Product, ProductTier };