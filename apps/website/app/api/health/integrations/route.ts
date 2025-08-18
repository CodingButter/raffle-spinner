import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/directus-admin';
import { alertManager } from '@/lib/alert-system';

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
    const directus = await getDirectusAdmin();
    await directus.items('webhook_events').readByQuery({ limit: 1 });
    const responseTime = Date.now() - startTime;

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
  try {
    const directus = await getDirectusAdmin();

    // Get webhook events from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const events = await directus.items('webhook_events').readByQuery({
      filter: {
        created_at: {
          _gte: twentyFourHoursAgo,
        },
      },
      fields: ['status', 'created_at', 'processing_time'],
    });

    const total = events.data?.length || 0;
    const failed = events.data?.filter((e: any) => e.status === 'failed').length || 0;
    const processed = total;
    const success_rate = total > 0 ? ((total - failed) / total) * 100 : 100;

    // Calculate average processing time (mock for now - would need to add this field)
    const avg_processing_time = 250; // ms

    return {
      processed,
      failed,
      success_rate: Math.round(success_rate * 100) / 100,
      avg_processing_time,
      last_24h_count: total,
    };
  } catch (error) {
    console.error('Error fetching webhook metrics:', error);
    return {
      processed: 0,
      failed: 0,
      success_rate: 0,
      avg_processing_time: 0,
      last_24h_count: 0,
    };
  }
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
