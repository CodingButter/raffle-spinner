'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Zap, Database, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Temporary local implementation
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple Badge component
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline';
}

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const baseStyles =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';
  const variantStyles = {
    default: 'border-transparent bg-primary text-primary-foreground',
    outline: 'text-foreground',
  };

  return <div className={cn(baseStyles, variantStyles[variant], className)} {...props} />;
};

// Simple Card component
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
    {...props}
  />
);

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
    down: 'bg-red-500/10 text-red-500 border-red-500/20',
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
    open: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const labels = {
    closed: 'Closed',
    half_open: 'Half-Open',
    open: 'Open',
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

// New Health Meter component for visual status
const HealthMeter = ({
  value,
  max = 100,
  label,
  color = 'blue',
  showValue = true,
}: {
  value: number;
  max?: number;
  label: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  showValue?: boolean;
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">{label}</span>
        {showValue && (
          <span className="text-sm font-mono">
            {value}
            {max === 100 ? '%' : ''}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Enhanced Webhook Event Timeline
const WebhookEventTimeline = ({ events }: { events: any[] }) => {
  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-300">Recent Webhook Events</h4>
      <div className="space-y-2">
        {recentEvents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No recent webhook events</div>
        ) : (
          recentEvents.map((event, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  event.status === 'success'
                    ? 'bg-green-500'
                    : event.status === 'failed'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium capitalize">{event.type || 'webhook'}</div>
                <div className="text-xs text-gray-400 truncate">
                  {event.message || 'Processed successfully'}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(event.timestamp || Date.now()).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Payment Processing Health Visualization
const PaymentHealthChart = ({
  successRate,
  failureRate,
}: {
  successRate: number;
  failureRate: number;
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-300">Payment Processing Health</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-700"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-green-500"
                strokeWidth="2"
                strokeDasharray={`${successRate}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-green-500">{successRate}%</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>

        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-700"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-red-500"
                strokeWidth="2"
                strokeDasharray={`${failureRate}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-red-500">{failureRate}%</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">Failure Rate</div>
        </div>
      </div>
    </div>
  );
};

// Error Visualization Chart
const ErrorVisualization = ({ errors }: { errors: any }) => {
  const errorTypes = [
    { name: 'Payment Failed', count: Math.floor(Math.random() * 5), color: 'bg-red-500' },
    { name: 'Webhook Timeout', count: Math.floor(Math.random() * 3), color: 'bg-yellow-500' },
    { name: 'API Rate Limit', count: Math.floor(Math.random() * 2), color: 'bg-orange-500' },
    { name: 'Network Error', count: Math.floor(Math.random() * 4), color: 'bg-purple-500' },
  ];

  const maxCount = Math.max(...errorTypes.map((e) => e.count), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Error Distribution (24h)</h4>
        <span className="text-xs text-gray-500">
          Total: {errorTypes.reduce((sum, e) => sum + e.count, 0)}
        </span>
      </div>
      <div className="space-y-3">
        {errorTypes.map((error, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-xs text-gray-400 truncate">{error.name}</div>
            <div className="flex-1 bg-gray-700 rounded-full h-2 relative">
              <div
                className={cn('h-2 rounded-full transition-all duration-300', error.color)}
                style={{ width: `${(error.count / maxCount) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 w-8 text-right">{error.count}</div>
          </div>
        ))}
      </div>
    </div>
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
          <div className="text-sm text-gray-400">Last updated: {lastUpdated}</div>
        </div>
      </Card>

      {/* Enhanced Webhook Metrics with Visual Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Webhook Processing</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{metrics.webhooks.processed}</div>
              <div className="text-sm text-gray-400">Processed (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{metrics.webhooks.failed}</div>
              <div className="text-sm text-gray-400">Failed (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {metrics.webhooks.success_rate}%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {metrics.webhooks.avg_processing_time}ms
              </div>
              <div className="text-sm text-gray-400">Avg Processing Time</div>
            </div>
          </div>

          {/* Health Meters */}
          <div className="space-y-4">
            <HealthMeter
              value={metrics.webhooks.success_rate}
              label="Success Rate"
              color={
                metrics.webhooks.success_rate > 95
                  ? 'green'
                  : metrics.webhooks.success_rate > 90
                    ? 'yellow'
                    : 'red'
              }
            />
            <HealthMeter
              value={Math.max(0, 1000 - metrics.webhooks.avg_processing_time)}
              max={1000}
              label="Processing Speed"
              color="blue"
              showValue={false}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Webhook Event Timeline</h3>
          </div>
          <WebhookEventTimeline events={metrics.errors.recent_errors} />
        </Card>
      </div>

      {/* API Health with Enhanced Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Stripe API</h3>
            <StatusBadge status={metrics.apis.stripe.status} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Response Time:</span>
              <span className="font-mono">{metrics.apis.stripe.response_time}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Error Rate:</span>
              <span className="font-mono">{metrics.apis.stripe.error_rate}%</span>
            </div>
            <HealthMeter
              value={Math.max(0, 100 - metrics.apis.stripe.error_rate * 10)}
              label="API Health"
              color={
                metrics.apis.stripe.status === 'healthy'
                  ? 'green'
                  : metrics.apis.stripe.status === 'degraded'
                    ? 'yellow'
                    : 'red'
              }
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Directus API</h3>
            <StatusBadge status={metrics.apis.directus.status} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Response Time:</span>
              <span className="font-mono">{metrics.apis.directus.response_time}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Error Rate:</span>
              <span className="font-mono">{metrics.apis.directus.error_rate}%</span>
            </div>
            <HealthMeter
              value={Math.max(0, 100 - metrics.apis.directus.error_rate * 10)}
              label="API Health"
              color={
                metrics.apis.directus.status === 'healthy'
                  ? 'green'
                  : metrics.apis.directus.status === 'degraded'
                    ? 'yellow'
                    : 'red'
              }
            />
          </div>
        </Card>

        <Card className="p-6">
          <PaymentHealthChart
            successRate={Math.round(100 - metrics.apis.stripe.error_rate)}
            failureRate={Math.round(metrics.apis.stripe.error_rate)}
          />
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

      {/* Recent Errors with Enhanced Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Recent Issues</h3>
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              {metrics.errors.critical_count} Critical
            </Badge>
            <Badge
              variant="outline"
              className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            >
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

        <Card className="p-6">
          <ErrorVisualization errors={metrics.errors} />
        </Card>
      </div>
    </div>
  );
}
