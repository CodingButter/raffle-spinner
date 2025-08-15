/**
 * Analytics Dashboard Page
 * 
 * Displays subscription metrics and analytics
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Download,
  RefreshCw 
} from 'lucide-react';

interface AnalyticsData {
  mrr: number;
  churnRate: number;
  clv: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  conversionRate: number;
  failureRate: number;
  upgrades: number;
  downgrades: number;
  recentUpgrades: Array<{ date: string; from: number; to: number }>;
  recentDowngrades: Array<{ date: string; from: number; to: number }>;
  timestamp: string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const exportData = () => {
    if (!analytics) return;
    
    const csv = [
      ['Metric', 'Value'],
      ['Monthly Recurring Revenue (MRR)', `$${analytics.mrr}`],
      ['Churn Rate', `${analytics.churnRate}%`],
      ['Customer Lifetime Value (CLV)', `$${analytics.clv}`],
      ['Active Subscriptions', analytics.activeSubscriptions],
      ['Trial Subscriptions', analytics.trialSubscriptions],
      ['Trial Conversion Rate', `${analytics.conversionRate}%`],
      ['Payment Failure Rate', `${analytics.failureRate}%`],
      ['Upgrades This Month', analytics.upgrades],
      ['Downgrades This Month', analytics.downgrades],
      ['Report Generated', analytics.timestamp],
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 bg-red-900/20 border-red-800">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-300">{error}</p>
          <Button onClick={fetchAnalytics} className="mt-4" variant="outline">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription Analytics</h1>
          <p className="text-gray-400 mt-2">Track your subscription metrics and performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAnalytics} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`$${analytics.mrr.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          color="green"
        />
        <MetricCard
          title="Active Subscriptions"
          value={analytics.activeSubscriptions}
          icon={Users}
          trend="up"
          color="blue"
        />
        <MetricCard
          title="Churn Rate"
          value={`${analytics.churnRate}%`}
          icon={TrendingDown}
          trend={analytics.churnRate > 5 ? 'down' : 'neutral'}
          color="red"
        />
        <MetricCard
          title="Customer Lifetime Value"
          value={`$${analytics.clv.toLocaleString()}`}
          icon={Activity}
          trend="up"
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Trial Conversions</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{analytics.conversionRate}%</span>
            <span className="text-sm text-gray-500">
              ({analytics.trialSubscriptions} trials)
            </span>
          </div>
        </Card>
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Payment Failures</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{analytics.failureRate}%</span>
            <span className="text-sm text-yellow-500">failure rate</span>
          </div>
        </Card>
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Plan Changes</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-bold">{analytics.upgrades}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="font-bold">{analytics.downgrades}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Recent Upgrades</h3>
          {analytics.recentUpgrades.length > 0 ? (
            <div className="space-y-2">
              {analytics.recentUpgrades.map((upgrade, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-sm text-gray-400">
                    {new Date(upgrade.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium text-green-500">
                    ${upgrade.from} → ${upgrade.to}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent upgrades</p>
          )}
        </Card>

        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Recent Downgrades</h3>
          {analytics.recentDowngrades.length > 0 ? (
            <div className="space-y-2">
              {analytics.recentDowngrades.map((downgrade, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-sm text-gray-400">
                    {new Date(downgrade.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium text-red-500">
                    ${downgrade.from} → ${downgrade.to}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent downgrades</p>
          )}
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        Last updated: {new Date(analytics.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  color: 'green' | 'blue' | 'red' | 'purple';
}

function MetricCard({ title, value, icon: Icon, trend, color }: MetricCardProps) {
  const colorClasses = {
    green: 'text-green-500 bg-green-900/20',
    blue: 'text-blue-500 bg-blue-900/20',
    red: 'text-red-500 bg-red-900/20',
    purple: 'text-purple-500 bg-purple-900/20',
  };

  return (
    <Card className="p-6 bg-gray-900/50 border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 inline" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 inline" />}
        </div>
      )}
    </Card>
  );
}