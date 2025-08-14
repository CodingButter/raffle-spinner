/**
 * Streaming Subscription Page
 *
 * Manage streaming product subscriptions
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@drawday/auth';
import { SubscriptionCards } from '@/components/dashboard/subscription/SubscriptionCards';
import { useDashboardData } from '@/hooks/useDashboardData';
import { groupProductsByCategory } from '@/lib/dashboard-helpers';

export default function StreamingSubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Fetch products and subscriptions using custom hook
  const { products, userSubscriptions } = useDashboardData(user, null);

  // User is guaranteed to exist because of layout protection
  if (!user) {
    return null;
  }

  // Group products by category
  const productsByCategory = groupProductsByCategory(products, userSubscriptions);
  const streamingCategory = productsByCategory.streaming;
  const streamingProducts = streamingCategory?.products || [];

  const handleUpgrade = async (productKey: string) => {
    // Find the product
    const product = products.find((p) => p.key === productKey);
    if (!product) {
      alert('Product not found');
      return;
    }

    // For enterprise tier, redirect to contact page
    if (product.tier?.key === 'enterprise') {
      router.push('/contact');
      return;
    }

    // Create checkout session for the selected plan
    try {
      const response = await fetch('/api/create-checkout-session-directus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productKey: productKey,
          email: user?.email,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        alert('Unable to create checkout session. Please try again.');
        console.error('Checkout error:', data.error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return <SubscriptionCards products={streamingProducts} user={user} onUpgrade={handleUpgrade} />;
}
