/**
 * Dashboard Page
 *
 * Main dashboard for managing subscription, viewing usage, and downloading extension
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@drawday/auth';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TrialBanner } from '@/components/dashboard/shared/TrialBanner';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { SubscriptionTab } from '@/components/dashboard/tabs/SubscriptionTab';
import { UsageTab } from '@/components/dashboard/tabs/UsageTab';
import { SettingsTab } from '@/components/dashboard/tabs/SettingsTab';

export default function DashboardPage() {
  // Protect route - redirect to login if not authenticated
  useRequireAuth();

  const router = useRouter();
  const { user, logout, isLoading, tokens } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('spinner');
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

  // Fetch user subscriptions OR use user data directly
  useEffect(() => {
    // The subscription data is stored on the user object itself
    if (user?.stripe_subscription_id && user?.subscription_status) {
      console.log('Dashboard: Using subscription data from user object');

      // Create subscription object from user data
      const subscription = {
        id: user.stripe_subscription_id,
        product: {
          key: `spinner_${user.subscription_tier || 'starter'}`,
          tier: {
            key: user.subscription_tier || 'starter',
          },
        },
        status: user.subscription_status,
        stripe_subscription_id: user.stripe_subscription_id,
        current_period_end: user.subscription_current_period_end,
        cancel_at_period_end: user.subscription_cancel_at_period_end,
      };

      setUserSubscriptions({
        spinner: [subscription],
        website: [],
        streaming: [],
      });
      setSubscriptionsLoading(false);
    } else if (user?.id && tokens?.access_token) {
      // Try to fetch from API if we have tokens
      console.log('Dashboard: Fetching subscriptions from API');

      async function fetchUserSubscriptions() {
        try {
          const response = await fetch(`/api/user-subscriptions?userId=${user!.id}`, {
            headers: {
              Authorization: `Bearer ${tokens!.access_token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUserSubscriptions(data.subscriptions || { spinner: [], website: [], streaming: [] });
          } else {
            console.error('Failed to fetch user subscriptions');
          }
        } catch (error) {
          console.error('Error fetching user subscriptions:', error);
        } finally {
          setSubscriptionsLoading(false);
        }
      }

      fetchUserSubscriptions();
    } else {
      // No subscription data
      setSubscriptionsLoading(false);
    }
  }, [user, tokens?.access_token]);

  // Loading state while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If no user, show nothing (useRequireAuth will redirect)
  if (!user) {
    return null;
  }

  // Get user's active spinner subscription
  const activeSpinnerSub = userSubscriptions.spinner?.find(
    (s: any) => s.status === 'active' || s.status === 'trialing'
  );
  const userTier = activeSpinnerSub?.product?.tier?.key || 'free';

  // Group products by category
  const productsByCategory = groupProductsByCategory(products, userSubscriptions);

  // Extract user data
  const userData = extractUserData(user, userTier);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleDownloadExtension = () => {
    // TODO: Implement actual download
    window.open('https://chrome.google.com/webstore', '_blank');
  };

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <DashboardHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={userData.email}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userData.name}</h1>
          <p className="text-gray-400">
            Manage your DrawDay subscription and download the Chrome extension
          </p>
        </div>

        {/* Trial Banner - Only show for free tier users */}
        {userTier === 'free' && (
          <TrialBanner
            trialEndsAt={userData.trialEndsAt}
            onUpgradeClick={() => setActiveTab('subscription')}
          />
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            userData={userData}
            userTier={userTier}
            userSubscriptions={userSubscriptions}
            subscriptionsLoading={subscriptionsLoading}
            onTabChange={setActiveTab}
            onDownloadExtension={handleDownloadExtension}
          />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionTab
            productsByCategory={productsByCategory}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            user={user}
            onUpgrade={handleUpgrade}
          />
        )}

        {activeTab === 'usage' && <UsageTab userData={userData} />}

        {activeTab === 'settings' && (
          <SettingsTab userData={userData} userTier={userTier} onTabChange={setActiveTab} />
        )}
      </main>
    </div>
  );
}

// Helper functions
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function groupProductsByCategory(products: any[], userSubscriptions: any) {
  return products.reduce((acc: any, product) => {
    const categoryKey = product.category?.key || 'spinner';
    if (!acc[categoryKey]) {
      acc[categoryKey] = {
        category: product.category,
        products: [],
      };
    }

    // Check if user has this specific product
    const userHasThisProduct = userSubscriptions[categoryKey]?.some(
      (sub: any) =>
        sub.product?.key === product.key && (sub.status === 'active' || sub.status === 'trialing')
    );

    acc[categoryKey].products.push({
      ...product,
      current: userHasThisProduct,
    });

    // Sort by tier order
    acc[categoryKey].products.sort((a: any, b: any) => {
      const tierOrder: Record<string, number> = { starter: 1, professional: 2, enterprise: 3 };
      const aOrder = tierOrder[a.tier?.key as string] || 999;
      const bOrder = tierOrder[b.tier?.key as string] || 999;
      return aOrder - bOrder;
    });

    return acc;
  }, {});
}

function extractUserData(user: any, userTier: string) {
  return {
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
    email: user.email,
    company: 'Your Company', // TODO: Add company field to User type or get from separate API
    plan: userTier === 'free' ? 'Free Trial' : userTier.charAt(0).toUpperCase() + userTier.slice(1),
    trialEndsAt: user.subscription_current_period_end
      ? new Date(user.subscription_current_period_end).toISOString().split('T')[0]
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage: {
      draws: 0,
      participants: 0,
      lastDraw: 'Never',
    },
  };
}
