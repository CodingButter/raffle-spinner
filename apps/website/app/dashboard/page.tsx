'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@raffle-spinner/ui';
import { Button } from '@raffle-spinner/ui';
import { useAuth, useUser, useSubscriptions, ProtectedRoute } from '@raffle-spinner/auth';
import { 
  User, 
  Mail, 
  Building, 
  Calendar, 
  Shield, 
  CreditCard, 
  Package,
  LogOut,
  Download,
  Sparkles,
  Check,
  X
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { logout } = useAuth();
  const user = useUser();
  const subscriptions = useSubscriptions();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const products = [
    {
      id: 'spinner',
      name: 'DrawDay Spinner',
      description: 'Professional live draw software',
      features: ['Custom branding', 'Unlimited participants', 'Advanced animations', 'CSV import'],
      hasAccess: subscriptions.some(s => (s.product === 'spinner' || s.product === 'all_access') && s.status === 'active'),
    },
    {
      id: 'streaming',
      name: 'Streaming Production',
      description: 'Professional streaming overlays and tools',
      features: ['OBS integration', 'Custom overlays', 'Animation packs', 'Multi-camera support'],
      hasAccess: subscriptions.some(s => (s.product === 'streaming' || s.product === 'all_access') && s.status === 'active'),
    },
    {
      id: 'websites',
      name: 'Custom Websites',
      description: 'Bespoke competition websites',
      features: ['Custom design', 'Payment integration', 'CMS access', 'Analytics'],
      hasAccess: subscriptions.some(s => (s.product === 'websites' || s.product === 'all_access') && s.status === 'active'),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.firstName}!</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* User Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                {user?.companyName && (
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{user.companyName}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium capitalize">
                      {user?.role === 'admin' ? (
                        <span className="text-purple-500">Admin</span>
                      ) : user?.role === 'pro' ? (
                        <span className="text-blue-500">Pro</span>
                      ) : (
                        <span>Free</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/spinner')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Spinner
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/billing')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/support')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Get Support
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className={product.hasAccess ? 'border-green-500/50' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    {product.hasAccess ? (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-500/20 text-gray-500 px-2 py-1 rounded">
                        Not Active
                      </span>
                    )}
                  </div>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm">
                        {product.hasAccess ? (
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 mr-2 text-gray-400" />
                        )}
                        <span className={product.hasAccess ? '' : 'text-gray-500'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {product.hasAccess ? (
                    <Button 
                      className="w-full" 
                      onClick={() => router.push(`/${product.id}`)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Access
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => router.push('/upgrade')}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Free Account Notice */}
        {user?.role === 'free' && (
          <Card className="mt-8 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Upgrade to Pro</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Unlock custom branding, unlimited participants, and advanced features across all our products.
                  </p>
                  <Button onClick={() => router.push('/upgrade')}>
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}