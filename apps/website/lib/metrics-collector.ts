/**
 * CRITICAL: Metrics Collection Service
 * Tracks webhook processing, API performance, and error patterns
 * Robert Wilson - Integration Health Dashboard
 */

import { createAdminClient } from './directus-admin';

interface WebhookMetric {
  event_id: string;
  event_type: string;
  processing_time: number;
  status: 'success' | 'failed' | 'timeout';
  error_message?: string;
  timestamp: string;
}

interface ApiMetric {
  service: 'stripe' | 'directus';
  endpoint: string;
  method: string;
  response_time: number;
  status_code: number;
  success: boolean;
  timestamp: string;
}

interface ErrorMetric {
  service: string;
  error_type: 'critical' | 'warning' | 'info';
  message: string;
  stack_trace?: string;
  timestamp: string;
  request_id?: string;
}

/**
 * Record webhook processing metrics for health dashboard
 */
export async function recordWebhookMetric(metric: WebhookMetric): Promise<void> {
  try {
    const directus = createAdminClient();
    
    await directus.items('webhook_metrics').createOne({
      event_id: metric.event_id,
      event_type: metric.event_type,
      processing_time: metric.processing_time,
      status: metric.status,
      error_message: metric.error_message,
      timestamp: metric.timestamp,
      created_at: new Date().toISOString()
    });

    console.log(`📊 Webhook metric recorded: ${metric.event_type} (${metric.processing_time}ms)`);
  } catch (error) {
    console.error('Failed to record webhook metric:', error);
    // Don't throw - metrics shouldn't break webhook processing
  }
}

/**
 * Record API performance metrics
 */
export async function recordApiMetric(metric: ApiMetric): Promise<void> {
  try {
    const directus = createAdminClient();
    
    await directus.items('api_metrics').createOne({
      service: metric.service,
      endpoint: metric.endpoint,
      method: metric.method,
      response_time: metric.response_time,
      status_code: metric.status_code,
      success: metric.success,
      timestamp: metric.timestamp,
      created_at: new Date().toISOString()
    });

    console.log(`📊 API metric recorded: ${metric.service} ${metric.endpoint} (${metric.response_time}ms)`);
  } catch (error) {
    console.error('Failed to record API metric:', error);
  }
}

/**
 * Record error for tracking and alerting
 */
export async function recordError(error: ErrorMetric): Promise<void> {
  try {
    const directus = createAdminClient();
    
    await directus.items('error_logs').createOne({
      service: error.service,
      error_type: error.error_type,
      message: error.message,
      stack_trace: error.stack_trace,
      timestamp: error.timestamp,
      request_id: error.request_id,
      created_at: new Date().toISOString()
    });

    console.log(`🚨 Error recorded: ${error.error_type} in ${error.service}`);
    
    // If critical error, trigger alert (would integrate with alerting system)
    if (error.error_type === 'critical') {
      await triggerAlert(error);
    }
  } catch (recordError) {
    console.error('Failed to record error metric:', recordError);
  }
}

/**
 * Trigger alert for critical issues
 */
async function triggerAlert(error: ErrorMetric): Promise<void> {
  try {
    // In production, this would integrate with:
    // - Slack/Discord webhooks
    // - Email notifications
    // - PagerDuty/OpsGenie
    
    console.log(`🚨 CRITICAL ALERT: ${error.message} in ${error.service}`);
    
    // For now, just log to console
    // TODO: Implement actual alerting system
  } catch (alertError) {
    console.error('Failed to trigger alert:', alertError);
  }
}

/**
 * Wrapper function to time API calls and record metrics
 */
export async function withApiMetrics<T>(
  service: 'stripe' | 'directus',
  endpoint: string,
  method: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    const result = await operation();
    const responseTime = Date.now() - startTime;
    
    await recordApiMetric({
      service,
      endpoint,
      method,
      response_time: responseTime,
      status_code: 200,
      success: true,
      timestamp
    });
    
    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    await recordApiMetric({
      service,
      endpoint,
      method,
      response_time: responseTime,
      status_code: 500,
      success: false,
      timestamp
    });
    
    await recordError({
      service,
      error_type: 'critical',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack_trace: error instanceof Error ? error.stack : undefined,
      timestamp
    });
    
    throw error;
  }
}

/**
 * Get health metrics for dashboard
 */
export async function getHealthMetrics() {
  try {
    const directus = createAdminClient();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Get webhook metrics
    const webhookMetrics = await directus.items('webhook_metrics').readByQuery({
      filter: {
        created_at: { _gte: twentyFourHoursAgo }
      },
      fields: ['status', 'processing_time', 'event_type']
    });
    
    // Get API metrics
    const apiMetrics = await directus.items('api_metrics').readByQuery({
      filter: {
        created_at: { _gte: twentyFourHoursAgo }
      },
      fields: ['service', 'response_time', 'success']
    });
    
    // Get error logs
    const errorLogs = await directus.items('error_logs').readByQuery({
      filter: {
        created_at: { _gte: twentyFourHoursAgo }
      },
      fields: ['error_type', 'service', 'message', 'timestamp']
    });
    
    return {
      webhooks: webhookMetrics.data || [],
      apis: apiMetrics.data || [],
      errors: errorLogs.data || []
    };
  } catch (error) {
    console.error('Failed to get health metrics:', error);
    return {
      webhooks: [],
      apis: [],
      errors: []
    };
  }
}