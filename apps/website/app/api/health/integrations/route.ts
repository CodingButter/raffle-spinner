import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/directus-admin';
import { alertManager } from '@/lib/alert-system';

// Use createAdminClient instead of getDirectusAdmin
const getDirectusAdmin = createAdminClient;

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

async function checkDirectusHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  response_time: number;
}> {
  const startTime = Date.now();
  try {
    // Simple health check by calling Directus server endpoint
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    const response = await fetch(`${directusUrl}/server/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return { status: 'down', response_time: responseTime };
    }

    return {
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      response_time: responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      response_time: Date.now() - startTime,
    };
  }
}

async function checkStripeHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  response_time: number;
}> {
  const startTime = Date.now();
  try {
    // Simple Stripe API health check
    const response = await fetch('https://api.stripe.com/v1/charges?limit=1', {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return { status: 'down', response_time: responseTime };
    }

    return {
      status: responseTime < 2000 ? 'healthy' : 'degraded',
      response_time: responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      response_time: Date.now() - startTime,
    };
  }
}

async function getWebhookMetrics(): Promise<HealthMetrics['webhooks']> {
  // Return mock data for now since we don't have a proper webhook_events table connection
  // In a real implementation, this would query the webhook metrics from Directus
  return {
    processed: 450,
    failed: 12,
    success_rate: 97.33,
    avg_processing_time: 285,
    last_24h_count: 450,
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('🏥 Health check requested for integrations');

    // Run health checks in parallel for better performance
    const [directusHealth, stripeHealth, webhookMetrics] = await Promise.all([
      checkDirectusHealth(),
      checkStripeHealth(),
      getWebhookMetrics(),
    ]);

    // Check thresholds and trigger alerts if needed
    await alertManager.checkWebhookHealth({
      success_rate: webhookMetrics.success_rate,
      avg_processing_time: webhookMetrics.avg_processing_time,
      failed_count: webhookMetrics.failed,
    });

    await alertManager.checkApiHealth('stripe', {
      response_time: stripeHealth.response_time,
      error_rate: 0.1, // Mock error rate
      status: stripeHealth.status,
    });

    await alertManager.checkApiHealth('directus', {
      response_time: directusHealth.response_time,
      error_rate: 0.05, // Mock error rate
      status: directusHealth.status,
    });

    // Mock circuit breaker status (would be implemented with actual circuit breaker library)
    const circuit_breakers = {
      stripe_webhook: 'closed' as const,
      payment_processing: 'closed' as const,
      directus_sync: 'closed' as const,
    };

    // Mock recent errors (would come from error tracking system)
    const errors = {
      critical_count: 0,
      warning_count: 2,
      recent_errors: [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'warning',
          message: 'Stripe webhook processing took longer than expected',
          service: 'stripe',
        },
      ],
    };

    const healthMetrics: HealthMetrics = {
      webhooks: webhookMetrics,
      apis: {
        stripe: {
          ...stripeHealth,
          error_rate: 0.1, // Mock error rate
        },
        directus: {
          ...directusHealth,
          error_rate: 0.05, // Mock error rate
        },
      },
      circuit_breakers,
      errors,
    };

    // Determine overall health status
    const isHealthy =
      directusHealth.status === 'healthy' &&
      stripeHealth.status === 'healthy' &&
      webhookMetrics.success_rate > 95;

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      metrics: healthMetrics,
    });
  } catch (error) {
    console.error('💥 Health check failed:', error);
    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
