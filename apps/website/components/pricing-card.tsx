'use client';

import { Button } from '@drawday/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PricingCardProps {
  plan: {
    key: string;
    name: string;
    price: string | number;
    currency?: string;
    period?: string;
    description?: string;
    features: string[];
    popular?: boolean;
    current?: boolean;
    cta?: string;
    tier?: {
      key?: string;
      name?: string;
      popular?: boolean;
    };
  };
  onUpgrade?: (productKey: string) => void;
  onManage?: () => void;
  showCurrent?: boolean;
  className?: string;
}

export function PricingCard({
  plan,
  onUpgrade,
  onManage,
  showCurrent = true,
  className = '',
}: PricingCardProps) {
  const router = useRouter();

  // Determine if this is a popular plan
  const isPopular = plan.tier?.popular || plan.popular;

  // Determine the CTA text
  const ctaText =
    plan.cta ||
    (plan.current
      ? 'Current Plan'
      : plan.tier?.key === 'enterprise'
        ? 'Contact Sales'
        : 'Start Free Trial');

  // Parse price
  const displayPrice =
    typeof plan.price === 'string' && plan.price.includes('£')
      ? plan.price
      : plan.tier?.key === 'enterprise'
        ? 'Custom'
        : `£${typeof plan.price === 'number' ? plan.price : parseInt(plan.price as string)}`;

  const handleClick = () => {
    if (plan.current && onManage) {
      onManage();
    } else if (!plan.current) {
      if (plan.tier?.key === 'enterprise' || ctaText === 'Contact Sales') {
        router.push('/contact');
      } else if (onUpgrade) {
        onUpgrade(plan.key);
      } else {
        router.push('/register');
      }
    }
  };

  return (
    <div
      className={`relative rounded-xl p-6 flex flex-col ${
        plan.current && showCurrent
          ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/40'
          : isPopular
            ? 'bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-2 border-purple-500/30'
            : 'bg-gray-800/50 border border-gray-700'
      } ${className}`}
    >
      {/* Current Plan Badge */}
      {plan.current && showCurrent && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}

      {/* Popular Badge */}
      {isPopular && !plan.current && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-xl font-bold mb-2">{plan.tier?.name || plan.name || 'Plan'}</h3>

      {/* Description */}
      {plan.description && <p className="text-sm text-gray-400 mb-4">{plan.description}</p>}

      {/* Price */}
      <div className="mb-4">
        <span className="text-3xl font-bold">{displayPrice}</span>
        {plan.period && <span className="text-gray-400 ml-2">{plan.period}</span>}
        {!plan.period && plan.tier?.key !== 'enterprise' && (
          <span className="text-gray-400 ml-2">/month</span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6 flex-grow">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        className={`w-full transition-all cursor-pointer ${
          plan.current
            ? 'bg-gray-700 hover:bg-gray-600'
            : isPopular
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800'
        }`}
        variant={plan.current ? 'secondary' : isPopular ? 'default' : 'outline'}
        disabled={plan.current && !onManage}
        onClick={handleClick}
      >
        {ctaText}
      </Button>
    </div>
  );
}
