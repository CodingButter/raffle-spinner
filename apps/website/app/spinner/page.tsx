/**
 * DrawDay Spinner Product Page
 *
 * Showcases the Chrome extension with features, pricing, and installation guide
 */

import { Button } from '@drawday/ui/button';
import {
  CheckCircle2,
  Chrome,
  Sparkles,
  Zap,
  Shield,
  Trophy,
  ArrowRight,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import for SpinnerPricing - loaded when user scrolls to pricing section
const SpinnerPricing = dynamic(() => import('@/components/spinner-pricing').then(mod => ({ default: mod.SpinnerPricing })), {
  loading: () => (
    <div className="grid md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-[400px] bg-gray-800/50 rounded-xl animate-pulse" />
      ))}
    </div>
  ),
});

export const metadata = {
  title: 'DrawDay Spinner - Professional Live Draw Software',
  description:
    'The ultimate Chrome extension for UK raffle companies. Run fair, transparent, and exciting live draws with our professional spinner software.',
};

const features = [
  {
    icon: Sparkles,
    title: 'Stunning Animations',
    description:
      'Slot machine style spinner with smooth 60fps animations that captivate your audience',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Handles 5000+ participants without breaking a sweat. No lag, no delays.',
  },
  {
    icon: Shield,
    title: 'Completely Transparent',
    description: 'Pre-determined winners with cryptographic proof. Build trust with your audience.',
  },
  {
    icon: Trophy,
    title: 'Professional Results',
    description: 'Winner reveal animations, confetti effects, and customizable celebrations.',
  },
];

async function getSpinnerProducts() {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

  try {
    // Get all products and filter for spinner category in code
    const response = await fetch(
      `${directusUrl}/items/products?fields=*,category.*,tier.*&sort=price`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch products');
      return [];
    }

    const { data } = await response.json();
    // Filter for spinner products only
    const spinnerProducts = (data || []).filter(
      (product: any) => product.category?.key === 'spinner'
    );
    return spinnerProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function SpinnerPage() {
  const products = await getSpinnerProducts();
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
                <Chrome className="w-4 h-4" />
                Chrome Extension Available
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                DrawDay
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {' '}
                  Spinner
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8">
                The professional live draw software trusted by UK's leading raffle companies.
                Beautiful animations, complete transparency, and seamless streaming integration.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-gray-700">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  No credit card required
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/20 p-8">
                <div className="w-full h-full bg-gray-900/50 rounded-lg flex items-center justify-center">
                  <Play className="w-16 h-16 text-purple-400" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-500 rounded-full blur-[100px] opacity-30" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500 rounded-full blur-[100px] opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need for
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {' '}
                Professional Draws
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built from the ground up for UK competition companies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="relative bg-gradient-to-br from-purple-900/10 to-purple-900/5 border border-purple-500/20 rounded-xl p-6 h-full hover:border-purple-500/40 transition-all">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {' '}
                Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Choose the plan that fits your needs. Cancel anytime.
            </p>
          </div>

          <SpinnerPricing products={products} />
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-3xl p-12 border border-purple-500/20">
            <div className="max-w-3xl mx-auto text-center">
              <Chrome className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Live Draws?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Install the DrawDay Spinner Chrome extension and start running professional draws in
                minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="border-gray-700">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
