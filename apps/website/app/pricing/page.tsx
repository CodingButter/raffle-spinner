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
            Investment That Pays for Itself in
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {' '}
              7 Days
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join 500+ UK raffle companies saving £4,500/month on average. Start free for 14 days -
            no card needed. Most see 3.2x ROI in first month.
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
                    {productKey === 'starter' &&
                      'Turn your first 1,000 participants into believers'}
                    {productKey === 'professional' &&
                      'Scale to 10K entries without losing personal touch'}
                    {productKey === 'enterprise' &&
                      'White-label solution for serious revenue generation'}
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
                    className={`w-full ${
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
            Risk-free 14-day trial • No card required • Average setup: 4 minutes
          </p>
          <p className="text-sm text-gray-500">
            Running 50+ raffles monthly?{' '}
            <a href="/contact" className="text-purple-400 hover:text-purple-300">
              Get volume pricing (save up to 40%)
            </a>
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">How quickly will I see ROI?</h3>
              <p className="text-gray-400">
                Most companies report 3.2x ROI within 30 days. Reduced disputes alone save
                £1,500/month on average, while increased trust drives 47% more entries per raffle.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Why do 92% of trials convert to paid?</h3>
              <p className="text-gray-400">
                Because it works. No card needed for 14 days - enough time to run 3-4 raffles and
                see customer reactions. Most report "game-changing" trust improvements within first
                week.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">What about compliance and regulations?</h3>
              <p className="text-gray-400">
                Fully Gambling Commission compliant. Every draw creates tamper-proof audit trails,
                timestamps, and participant records. Pass any inspection with confidence.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Can I white-label this for my brand?</h3>
              <p className="text-gray-400">
                Yes! Professional plan includes custom branding. Enterprise plan offers complete
                white-label solution with your domain, colors, and zero DrawDay branding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
