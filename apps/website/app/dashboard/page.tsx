/**
 * Dashboard Page
 *
 * Main dashboard for managing subscription, viewing usage, and downloading extension
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@drawday/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import {
  Chrome,
  Download,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  Activity,
  Dices,
  Globe,
  Radio,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@drawday/auth';
import { PricingCard } from '@/components/pricing-card';

// Icon mapping for category icons
const categoryIcons: Record<string, React.ReactNode> = {
  spinner: <Dices className="w-5 h-5" />,
  website: <Globe className="w-5 h-5" />,
  streaming: <Radio className="w-5 h-5" />,
};

export default function DashboardPage() {
  // Protect route - redirect to login if not authenticated
  useRequireAuth();

  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
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

  // Fetch user subscriptions
  useEffect(() => {
    async function fetchUserSubscriptions() {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/user-subscriptions?userId=${user.id}`);
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
  }, [user?.id]);

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, show nothing (useRequireAuth will redirect)
  if (!user) {
    return null;
  }

  // Check if user has any active subscriptions
  const hasActiveSubscriptions = Object.values(userSubscriptions).some((subs: any) =>
    Array.isArray(subs)
      ? subs.some((s: any) => s.status === 'active' || s.status === 'trialing')
      : false
  );

  // Get user's active spinner subscription (for backward compatibility)
  const activeSpinnerSub = userSubscriptions.spinner?.find(
    (s: any) => s.status === 'active' || s.status === 'trialing'
  );
  const userTier = activeSpinnerSub?.product?.tier?.key || 'free';

  // Group products by category
  const productsByCategory = products.reduce((acc: any, product) => {
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

    return acc;
  }, {});

  // Sort products within each category by tier order
  Object.values(productsByCategory).forEach((cat: any) => {
    cat.products.sort((a: any, b: any) => {
      const tierOrder: Record<string, number> = { starter: 1, professional: 2, enterprise: 3 };
      const aOrder = tierOrder[a.tier?.key as string] || 999;
      const bOrder = tierOrder[b.tier?.key as string] || 999;
      return aOrder - bOrder;
    });
  });

  // Extract user data
  const userData = {
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
      // Create checkout session using Directus products
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
        // Redirect to Stripe Checkout
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

  const confirmUpgrade = () => {
    // This function is no longer needed since we're using direct checkout
    if (selectedPlan) {
      handleUpgrade(selectedPlan);
    }
    setShowUpgradeConfirm(false);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.svg" alt="DrawDay" className="w-8 h-8" />
                <span className="text-xl font-bold">DrawDay</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`text-sm ${activeTab === 'overview' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`text-sm ${activeTab === 'subscription' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Subscription
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`text-sm ${activeTab === 'usage' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Usage
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`text-sm ${activeTab === 'settings' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Settings
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{userData.email}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

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
          <Card className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="font-bold text-lg">Free Trial Active</h3>
                    <p className="text-sm text-gray-400">
                      Your trial ends on {new Date(userData.trialEndsAt).toLocaleDateString()}.
                      Upgrade now to unlock all features.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveTab('subscription')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Upgrade Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Chrome className="w-5 h-5 text-purple-400" />
                    Chrome Extension
                  </CardTitle>
                  <CardDescription>Download and install the DrawDay Spinner</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleDownloadExtension}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Download className="mr-2 w-4 h-4" />
                    Download Extension
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">Version 1.2.0</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your last draw was {userData.usage.lastDraw}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Draws</span>
                      <span className="font-bold">{userData.usage.draws}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Participants</span>
                      <span className="font-bold">
                        {userData.usage.participants.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    {userData.plan}
                    {userTier === 'free' && user.subscription_status === 'trialing' && ' - Trial'}
                    {user.subscription_status === 'active' && userTier !== 'free' && ' - Active'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700"
                    onClick={() => setActiveTab('subscription')}
                  >
                    Manage Subscription
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Next billing: {userData.trialEndsAt}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Active Subscriptions */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Your Active Subscriptions</CardTitle>
                <CardDescription>
                  Products and services you're currently subscribed to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Spinner Subscriptions */}
                    {userSubscriptions.spinner?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-purple-400 mb-2">
                          Spinner Services
                        </h4>
                        {userSubscriptions.spinner.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg mb-2"
                          >
                            <div>
                              <p className="font-medium">{sub.product.name}</p>
                              <p className="text-xs text-gray-400">
                                Status:{' '}
                                <span
                                  className={
                                    sub.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                                  }
                                >
                                  {sub.status}
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">£{sub.product.price}/mo</p>
                              {sub.current_period_end && (
                                <p className="text-xs text-gray-400">
                                  Renews: {new Date(sub.current_period_end).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Website Subscriptions */}
                    {userSubscriptions.website?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-blue-400 mb-2">
                          Website Services
                        </h4>
                        {userSubscriptions.website.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg mb-2"
                          >
                            <div>
                              <p className="font-medium">{sub.product.name}</p>
                              <p className="text-xs text-gray-400">
                                Status:{' '}
                                <span
                                  className={
                                    sub.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                                  }
                                >
                                  {sub.status}
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">£{sub.product.price}/mo</p>
                              {sub.current_period_end && (
                                <p className="text-xs text-gray-400">
                                  Renews: {new Date(sub.current_period_end).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Streaming Subscriptions */}
                    {userSubscriptions.streaming?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-2">
                          Streaming Services
                        </h4>
                        {userSubscriptions.streaming.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg mb-2"
                          >
                            <div>
                              <p className="font-medium">{sub.product.name}</p>
                              <p className="text-xs text-gray-400">
                                Status:{' '}
                                <span
                                  className={
                                    sub.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                                  }
                                >
                                  {sub.status}
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">£{sub.product.price}/mo</p>
                              {sub.current_period_end && (
                                <p className="text-xs text-gray-400">
                                  Renews: {new Date(sub.current_period_end).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Subscriptions */}
                    {!userSubscriptions.spinner?.length &&
                      !userSubscriptions.website?.length &&
                      !userSubscriptions.streaming?.length && (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p>No active subscriptions</p>
                          <Button
                            onClick={() => setActiveTab('subscription')}
                            variant="outline"
                            size="sm"
                            className="mt-4 border-gray-700"
                          >
                            Browse Plans
                          </Button>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Your DrawDay Spinner usage this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-16 h-16 opacity-20" />
                  <span className="ml-4">Usage charts coming soon</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-8">
            {/* Category Selector */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Choose Your Products</h2>
              <div className="flex gap-4 flex-wrap">
                {Object.entries(productsByCategory).map(([key, data]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-6 py-3 rounded-lg border transition-all ${
                      selectedCategory === key
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white'
                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {categoryIcons[key] || <Sparkles className="w-5 h-5" />}
                      <span className="font-semibold">{data.category?.name || key}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>
                  {productsByCategory[selectedCategory]?.category?.name || selectedCategory} Plans
                </CardTitle>
                <CardDescription>
                  {productsByCategory[selectedCategory]?.category?.description ||
                    'Choose the perfect plan for your needs'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {productsByCategory[selectedCategory]?.products.map((plan: any) => (
                    <PricingCard
                      key={plan.key}
                      plan={{
                        ...plan,
                        cta: plan.current
                          ? user?.stripe_customer_id
                            ? 'Manage Plan'
                            : 'Current Plan'
                          : plan.tier?.key === 'enterprise'
                            ? 'Contact Sales'
                            : 'Upgrade',
                      }}
                      onUpgrade={handleUpgrade}
                      onManage={async () => {
                        if (user?.stripe_customer_id) {
                          try {
                            const response = await fetch('/api/create-portal-session', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                customerId: user.stripe_customer_id,
                                returnUrl: window.location.href,
                              }),
                            });

                            const data = await response.json();
                            if (data.url) {
                              window.location.href = data.url;
                            }
                          } catch (error) {
                            console.error('Error:', error);
                            alert('Unable to open billing portal.');
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {user?.stripe_customer_id && (
              <Card className="bg-blue-900/20 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="text-blue-300 font-medium mb-1">Managing Your Subscription</p>
                      <p className="text-gray-400">
                        Click "Manage Plan" on your current subscription to change plans, update
                        payment methods, or cancel your subscription. All changes are handled
                        securely through Stripe.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Payment & Billing</CardTitle>
                <CardDescription>Manage your payment methods and billing details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium">Billing Portal</p>
                        <p className="text-sm text-gray-400">
                          Manage payment methods, download invoices, and update billing info
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700"
                    onClick={async () => {
                      // TODO: Get actual Stripe customer ID from user data
                      const customerId = user?.stripe_customer_id;
                      if (!customerId) {
                        alert('No active subscription found. Please upgrade to a paid plan first.');
                        return;
                      }

                      try {
                        const response = await fetch('/api/create-portal-session', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            customerId,
                            returnUrl: window.location.href,
                          }),
                        });

                        const data = await response.json();
                        if (data.url) {
                          window.location.href = data.url;
                        } else {
                          alert('Unable to open billing portal. Please try again.');
                        }
                      } catch (error) {
                        console.error('Error opening billing portal:', error);
                        alert('An error occurred. Please try again.');
                      }
                    }}
                  >
                    <CreditCard className="mr-2 w-4 h-4" />
                    Manage Billing in Stripe
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    You'll be redirected to Stripe's secure customer portal
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="mb-4">Access your complete billing history</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700"
                    onClick={async () => {
                      const customerId = user?.stripe_customer_id;
                      if (!customerId) {
                        alert('No billing history available yet.');
                        return;
                      }

                      try {
                        const response = await fetch('/api/create-portal-session', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            customerId,
                            returnUrl: window.location.href,
                          }),
                        });

                        const data = await response.json();
                        if (data.url) {
                          window.location.href = data.url;
                        }
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    }}
                  >
                    View Invoices in Stripe
                  </Button>
                  <p className="text-xs mt-2">
                    Download invoices and receipts from Stripe's portal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-2">
                  <CardDescription>Total Draws</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{userData.usage.draws}</div>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-2">
                  <CardDescription>Total Participants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {userData.usage.participants.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-2">
                  <CardDescription>Average per Draw</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(userData.usage.participants / userData.usage.draws)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Participants</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-2">
                  <CardDescription>Last Draw</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{userData.usage.lastDraw}</div>
                  <p className="text-xs text-gray-500 mt-1">Most recent</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Recent Draws</CardTitle>
                <CardDescription>Your last 10 draws</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Draw history coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-400">Company Name</Label>
                  <p className="font-medium">{userData.company}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-400">Full Name</Label>
                  <p className="font-medium">{userData.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-400">Email</Label>
                  <p className="font-medium">{userData.email}</p>
                </div>
                <Button variant="outline" className="border-gray-700">
                  <Settings className="mr-2 w-4 h-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Manage your API keys for integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>API access available on Professional and Enterprise plans</p>
                  <Button variant="outline" className="mt-4 border-gray-700">
                    Upgrade to Access API
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirm Upgrade</h3>
            <p className="text-gray-400 mb-6">
              You're about to upgrade to the{' '}
              <span className="font-semibold text-white">{selectedPlan}</span> plan. Your card will
              be charged after the trial period ends.
            </p>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">New Plan:</span>
                <span className="font-semibold">{selectedPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Price:</span>
                <span className="font-semibold">
                  £{products.find((p: any) => p.tier?.name === selectedPlan)?.price || 0}/mo
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-700"
                onClick={() => {
                  setShowUpgradeConfirm(false);
                  setSelectedPlan(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={confirmUpgrade}
              >
                Confirm Upgrade
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add missing Label component if not exported from ui/label
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
