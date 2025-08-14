/**
 * Dashboard Data Hook
 *
 * Fetches and manages products and user subscriptions
 */

import { useState, useEffect } from 'react';
// Remove unused import

export function useDashboardData(user: any, tokens: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [userSubscriptions, setUserSubscriptions] = useState<any>({
    spinner: [],
    website: [],
    streaming: [],
  });
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);

  // Fetch products from Directus
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Process user subscriptions from user object
  useEffect(() => {
    if (user?.subscriptions && Array.isArray(user.subscriptions)) {
      console.log('Dashboard: Using subscription data from user object');

      // Group subscriptions by product
      const grouped = {
        spinner: user.subscriptions.filter((s: any) => s.product === 'spinner'),
        website: user.subscriptions.filter((s: any) => s.product === 'website'),
        streaming: user.subscriptions.filter((s: any) => s.product === 'streaming'),
      };

      setUserSubscriptions(grouped);
      setSubscriptionsLoading(false);
    } else {
      // No subscription data
      setUserSubscriptions({ spinner: [], website: [], streaming: [] });
      setSubscriptionsLoading(false);
    }
  }, [user]);

  return {
    products,
    productsLoading,
    userSubscriptions,
    subscriptionsLoading,
  };
}
