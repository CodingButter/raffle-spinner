'use client';

import { useState } from 'react';
import { Button } from '@drawday/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@drawday/auth';
import { useRouter } from 'next/navigation';
import { getStripe } from '@/lib/stripe-client';
import type { ProductTier } from '@/lib/directus-products';

interface PricingClientProps {
  tiers: ProductTier[];
}

export default function PricingClient({ tiers }: PricingClientProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (tier: ProductTier) => {
    setError(null);

    // Check if Stripe price ID is configured
    if (!tier.stripe_price_id) {
      setError('This plan is not yet available. Please contact support.');
      return;
    }

    // If not logged in, redirect to register
    if (!isAuthenticated) {
      router.push('/register');
      return;
    }

    setLoading(tier.id);

    try {
      // Create checkout session with tier information
      const response = await fetch('/api/create-checkout-session-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId: tier.id,
          priceId: tier.stripe_price_id,
          userId: user?.id,
          email: user?.email,
          metadata: {
            tier_name: tier.name,
            tier_slug: tier.slug,
            product: 'spinner'
          }
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  return (
    <div className="min-h-screen bg-black text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {' '}
              Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start with a {tiers[0]?.trial_days || 14}-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* No Tiers Message */}
        {tiers.length === 0 && (
          <div className="text-center">
            <p className="text-gray-400">No pricing plans available at the moment.</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => {
            const isLoading = loading === tier.id;

            return (
              <Card
                key={tier.id}
                className={`relative ${
                  tier.popular
                    ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/40'
                    : 'bg-gray-900/50 border-gray-800'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {tier.features[0]}
                  </CardDescription>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-bold">{formatPrice(tier.price)}</span>
                    <span className="text-gray-400 ml-2">/{tier.billing_period}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                    {tier.limits?.participants && (
                      <li className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">
                          {tier.limits.participants === -1
                            ? 'Unlimited participants'
                            : `Up to ${tier.limits.participants.toLocaleString()} participants`}
                        </span>
                      </li>
                    )}
                  </ul>

                  <Button
                    className={`w-full ${
                      tier.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        : ''
                    }`}
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => handleCheckout(tier)}
                    disabled={loading !== null || !tier.stripe_price_id}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : !tier.stripe_price_id ? (
                      'Coming Soon'
                    ) : (
                      'Start Free Trial'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            All plans include {tiers[0]?.trial_days || 14}-day free trial • No credit card required • Cancel anytime
          </p>
          <p className="text-sm text-gray-500">
            Need a custom plan?{' '}
            <a href="/contact" className="text-purple-400 hover:text-purple-300">
              Contact our sales team
            </a>
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-400">
                Yes! You can cancel your subscription at any time from your dashboard. You'll
                continue to have access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Do I need to enter payment details for the trial?
              </h3>
              <p className="text-gray-400">
                No credit card is required for the {tiers[0]?.trial_days || 14}-day trial. You'll only be asked for payment
                details when you decide to continue after the trial.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-gray-400">
                Absolutely! You can upgrade or downgrade your plan at any time from your account
                settings. Changes take effect at the next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Is there a setup fee?</h3>
              <p className="text-gray-400">
                No, there are no setup fees or hidden charges. You only pay the monthly subscription
                price shown above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}