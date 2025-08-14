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
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@drawday/auth';

const subscriptionPlans = [
  {
    name: 'Starter',
    price: 29,
    current: false,
    features: ['1,000 participants', 'Basic themes', 'Email support'],
  },
  {
    name: 'Professional',
    price: 79,
    current: true,
    features: ['10,000 participants', 'Custom branding', 'Priority support', 'API access'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    current: false,
    features: ['Unlimited participants', 'White-label', 'Dedicated support', 'Custom features'],
  },
];

export default function DashboardPage() {
  // Protect route - redirect to login if not authenticated
  useRequireAuth();

  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);

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

  // Extract user data
  const userData = {
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
    email: user.email,
    company: user.description?.replace('Company: ', '') || 'Your Company',
    plan: 'Free Trial', // TODO: Get from subscription
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setShowUpgradeConfirm(true);
  };

  const confirmUpgrade = () => {
    // TODO: Implement actual upgrade logic
    alert(`Upgrading to ${selectedPlan} plan...`);
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

        {/* Trial Banner */}
        <Card className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="font-bold text-lg">Free Trial Active</h3>
                  <p className="text-sm text-gray-400">
                    Your trial ends on {new Date(userData.trialEndsAt).toLocaleDateString()}.
                    Upgrade now to keep all your features.
                  </p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Upgrade Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

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
                  <CardDescription>{userData.plan} - Trial</CardDescription>
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
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Choose the plan that fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`relative rounded-xl p-6 ${
                        plan.current
                          ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/40'
                          : 'bg-gray-800/50 border border-gray-700'
                      }`}
                    >
                      {plan.current && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                            Current Plan
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold">
                          {typeof plan.price === 'number' ? `£${plan.price}` : plan.price}
                        </span>
                        {typeof plan.price === 'number' && (
                          <span className="text-gray-400 ml-2">/month</span>
                        )}
                      </div>

                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${plan.current ? 'bg-gray-700' : ''}`}
                        variant={plan.current ? 'secondary' : 'outline'}
                        disabled={plan.current}
                        onClick={() => {
                          if (!plan.current) {
                            if (plan.name === 'Enterprise') {
                              router.push('/contact');
                            } else {
                              handleUpgrade(plan.name);
                            }
                          }
                        }}
                      >
                        {plan.current
                          ? 'Current Plan'
                          : plan.name === 'Enterprise'
                            ? 'Contact Sales'
                            : 'Upgrade'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-400">Expires 12/24</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400">
                        Update
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-gray-700">
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Your payment history and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No billing history yet</p>
                  <p className="text-sm">
                    Your first invoice will appear here after your trial ends
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
                  £{subscriptionPlans.find((p) => p.name === selectedPlan)?.price}/mo
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
