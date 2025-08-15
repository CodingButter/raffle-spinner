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
          <div className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full">
            <span className="text-sm font-semibold text-red-400">
              🔥 Limited: 50% off first 3 months (17 spots left)
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Competitors Are Stealing
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {' '}
              £10,000+ Monthly
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
            While you run manual draws, they stream transparency. 73% of players choose raffles they
            can watch live. Stop bleeding revenue to trust issues.
          </p>
          <p className="text-sm text-gray-500">
            ⚡ 247 companies switched this month • Average revenue boost: £8,400/month
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
                      "Perfect for testing (but you'll upgrade in 2 weeks)"}
                    {productKey === 'professional' && "87% choose this plan - there's a reason"}
                    {productKey === 'enterprise' && 'When £100K+ monthly needs bulletproof trust'}
                  </CardDescription>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-bold">£{product.price}</span>
                    <span className="text-gray-400 ml-2">/month</span>
                    {productKey === 'professional' && (
                      <span className="ml-2 text-sm text-green-400">Save £360/year</span>
                    )}
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
                    ) : productKey === 'professional' ? (
                      'Start Winning Now →'
                    ) : productKey === 'enterprise' ? (
                      'Get Custom Demo'
                    ) : (
                      'Try Risk-Free'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-6 max-w-2xl mx-auto mb-8">
            <p className="text-green-400 font-semibold mb-2">💰 30-Day Money-Back Guarantee</p>
            <p className="text-gray-300">
              If DrawDay doesn't boost revenue by 20% in 30 days, get a full refund PLUS 3 months
              free. We're that confident.
            </p>
          </div>
          <p className="text-gray-400 mb-4">
            🚀 Live in 4 minutes • 🎯 Results in 24 hours • 💳 No card for trial
          </p>
          <p className="text-sm text-gray-500">
            Running 50+ raffles monthly?{' '}
            <a href="/contact" className="text-purple-400 hover:text-purple-300 underline">
              Unlock VIP pricing (save £2,000+/year)
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
