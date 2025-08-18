'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Clock, Zap, Database, Activity } from 'lucide-react';

interface HealthMetrics {
  webhooks: {
    processed: number;
    failed: number;
    success_rate: number;
    avg_processing_time: number;
    last_24h_count: number;
  };
  apis: {
    stripe: {
      status: 'healthy' | 'degraded' | 'down';
      response_time: number;
      error_rate: number;
    };
    directus: {
      status: 'healthy' | 'degraded' | 'down';
      response_time: number;
      error_rate: number;
    };
  };
  circuit_breakers: {
    stripe_webhook: 'closed' | 'open' | 'half_open';
    payment_processing: 'closed' | 'open' | 'half_open';
    directus_sync: 'closed' | 'open' | 'half_open';
  };
  errors: {
    critical_count: number;
    warning_count: number;
    recent_errors: Array<{
      timestamp: string;
      type: string;
      message: string;
      service: string;
    }>;
  };
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  metrics: HealthMetrics;
  error?: string;
}

const StatusIcon = ({ status }: { status: 'healthy' | 'degraded' | 'down' }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'down':
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
};

const StatusBadge = ({ status }: { status: 'healthy' | 'degraded' | 'down' }) => {
  const variants = {
    healthy: 'bg-green-500/10 text-green-500 border-green-500/20',
    degraded: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    down: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const CircuitBreakerBadge = ({ status }: { status: 'closed' | 'open' | 'half_open' }) => {
  const variants = {
    closed: 'bg-green-500/10 text-green-500 border-green-500/20',
    half_open: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    open: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  const labels = {
    closed: 'Closed',
    half_open: 'Half-Open',
    open: 'Open'
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

export function IntegrationHealthDashboard() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health/integrations');
      const data: HealthResponse = await response.json();
      setHealthData(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-4"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-400">Failed to load health data</p>
      </div>
    );
  }

  const { metrics } = healthData;

  return (
    <div className="space-y-6">
      {/* Header with overall status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon status={healthData.status} />
            <h2 className="text-xl font-semibold">System Status</h2>
            <StatusBadge status={healthData.status} />
          </div>
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated}
          </div>
        </div>
      </Card>

      {/* Webhook Metrics */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Webhook Processing</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{metrics.webhooks.processed}</div>
            <div className="text-sm text-gray-400">Processed (24h)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{metrics.webhooks.failed}</div>
            <div className="text-sm text-gray-400">Failed (24h)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{metrics.webhooks.success_rate}%</div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{metrics.webhooks.avg_processing_time}ms</div>
            <div className="text-sm text-gray-400">Avg Processing Time</div>
          </div>
        </div>
      </Card>

      {/* API Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Stripe API</h3>
            <StatusBadge status={metrics.apis.stripe.status} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Response Time:</span>
              <span className="font-mono">{metrics.apis.stripe.response_time}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Error Rate:</span>
              <span className="font-mono">{metrics.apis.stripe.error_rate}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Directus API</h3>
            <StatusBadge status={metrics.apis.directus.status} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Response Time:</span>
              <span className="font-mono">{metrics.apis.directus.response_time}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Error Rate:</span>
              <span className="font-mono">{metrics.apis.directus.error_rate}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Circuit Breakers */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Circuit Breakers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span className="text-sm font-medium">Stripe Webhook</span>
            <CircuitBreakerBadge status={metrics.circuit_breakers.stripe_webhook} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span className="text-sm font-medium">Payment Processing</span>
            <CircuitBreakerBadge status={metrics.circuit_breakers.payment_processing} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span className="text-sm font-medium">Directus Sync</span>
            <CircuitBreakerBadge status={metrics.circuit_breakers.directus_sync} />
          </div>
        </div>
      </Card>

      {/* Recent Errors */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">Recent Issues</h3>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            {metrics.errors.critical_count} Critical
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            {metrics.errors.warning_count} Warnings
          </Badge>
        </div>
        
        {metrics.errors.recent_errors.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            No recent errors - systems running smoothly!
          </div>
        ) : (
          <div className="space-y-2">
            {metrics.errors.recent_errors.map((error, index) => (
              <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{error.service}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(error.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-300">{error.message}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}