'use client';

import { PricingCard } from '@/components/pricing-card';

interface SpinnerPricingProps {
  products: any[];
}

export function SpinnerPricing({ products }: SpinnerPricingProps) {
  // Transform products to match the pricing format
  const pricing = products.map((product: any) => ({
    key: product.key,
    name: product.tier?.name || 'Plan',
    price: product.tier?.key === 'enterprise' ? 'Custom' : `£${parseInt(product.price)}`,
    period: product.tier?.key === 'enterprise' ? '' : '/month',
    description: product.description || '',
    features: product.features?.map((f: any) => f.feature) || [],
    cta: product.tier?.key === 'enterprise' ? 'Contact Sales' : 'Start Free Trial',
    popular: product.tier?.popular || false,
    tier: product.tier,
    productKey: product.key,
  }));

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {pricing.map((plan) => (
        <PricingCard key={plan.key} plan={plan} showCurrent={false} />
      ))}
    </div>
  );
}
