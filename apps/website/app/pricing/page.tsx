/**
 * Pricing Page with Stripe Checkout Integration
 */

'use client';

import { useState } from 'react';
import { Button } from '@drawday/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@drawday/auth';
import { useRouter } from 'next/navigation';
import { getStripe } from '@/lib/stripe-client';
import { PRODUCTS, ProductKey } from '@/lib/stripe';

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<ProductKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (productKey: ProductKey) => {
    setError(null);

    // If not logged in, redirect to register
    if (!isAuthenticated) {
      router.push('/register');
      return;
    }

    setLoading(productKey);

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productKey,
          userId: user?.id,
          email: user?.email,
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
            Start with a 14-day free trial. No credit card required. Cancel anytime.
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

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(PRODUCTS).map(([key, product]) => {
            const productKey = key as ProductKey;
            const isPopular = productKey === 'professional';
            const isLoading = loading === productKey;

            return (
              <Card
                key={productKey}
                className={`relative ${
                  isPopular
                    ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/40'
                    : 'bg-gray-900/50 border-gray-800'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {productKey === 'starter' && 'Perfect for small raffles'}
                    {productKey === 'professional' && 'For growing competitions'}
                    {productKey === 'enterprise' && 'For large organizations'}
                  </CardDescription>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-bold">£{product.price}</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="default"
                    className={`w-full min-h-[44px] ${
                      isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        : ''
                    }`}
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => handleCheckout(productKey)}
                    disabled={loading !== null}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
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
            All plans include 14-day free trial • No credit card required • Cancel anytime
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
                No credit card is required for the 14-day trial. You'll only be asked for payment
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
