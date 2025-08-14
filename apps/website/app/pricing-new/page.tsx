/**
 * Dynamic Pricing Page - Fetches from Directus
 */

import { getProductTiers } from '@/lib/directus-products';
import PricingClient from './pricing-client';

export default async function PricingPage() {
  // Fetch spinner tiers from Directus (or use fallback)
  const tiers = await getProductTiers('spinner');

  return <PricingClient tiers={tiers} />;
}