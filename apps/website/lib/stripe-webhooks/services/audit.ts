/**
 * Audit Service for Webhook Events
 * Comprehensive logging for compliance, debugging, and analytics
 */

import { AuditLogEntry } from '../types';
import { executeWithRetry } from './error-handling';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

/**
 * Get admin token for audit operations
 */
async function getAdminToken(): Promise<string> {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app',
      password: process.env.DIRECTUS_ADMIN_PASSWORD || 'Speed4Dayz1!',
    }),
  });

  if (!response.ok) {
    throw new Error(`Directus authentication failed for audit: ${response.status}`);
  }

  const data = await response.json();
  return data.data.access_token;
}

/**
 * Create audit log entry for webhook events
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await executeWithRetry(async () => {
      const token = await getAdminToken();

      const response = await fetch(`${DIRECTUS_URL}/items/audit_logs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        // If audit_logs collection doesn't exist, log to console
        if (response.status === 403 || response.status === 404) {
          console.log('📋 Audit log (collection not found):', entry);
          return;
        }
        throw new Error(`Failed to create audit log: ${response.status}`);
      }

      console.log('📋 Audit log created:', { action: entry.action, user: entry.user_email });
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Fallback to console logging for critical audit events
    console.log('📋 Audit log (fallback):', entry);
  }
}

/**
 * Log subscription plan changes for compliance
 */
export async function logPlanChange(
  userEmail: string,
  subscriptionId: string,
  changeType: string,
  fromTier: string,
  toTier: string,
  webhookEventId?: string
): Promise<void> {
  const auditEntry: AuditLogEntry = {
    user_email: userEmail,
    action: 'subscription_plan_change',
    details: {
      subscription_id: subscriptionId,
      change_type: changeType,
      from_tier: fromTier,
      to_tier: toTier,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    webhook_event_id: webhookEventId,
  };

  await createAuditLog(auditEntry);
}

/**
 * Log payment events for financial auditing
 */
export async function logPaymentEvent(
  userEmail: string,
  eventType: 'payment_succeeded' | 'payment_failed',
  details: {
    invoice_id: string;
    amount: number;
    currency: string;
    subscription_id?: string;
  },
  webhookEventId?: string
): Promise<void> {
  const auditEntry: AuditLogEntry = {
    user_email: userEmail,
    action: eventType,
    details: {
      ...details,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    webhook_event_id: webhookEventId,
  };

  await createAuditLog(auditEntry);
}

/**
 * Log subscription lifecycle events
 */
export async function logSubscriptionEvent(
  userEmail: string,
  eventType: 'subscription_created' | 'subscription_updated' | 'subscription_cancelled',
  details: {
    subscription_id: string;
    tier: string;
    status: string;
  },
  webhookEventId?: string
): Promise<void> {
  const auditEntry: AuditLogEntry = {
    user_email: userEmail,
    action: eventType,
    details: {
      ...details,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    webhook_event_id: webhookEventId,
  };

  await createAuditLog(auditEntry);
}

/**
 * Log webhook processing errors for debugging
 */
export async function logWebhookError(
  eventType: string,
  eventId: string,
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  },
  userEmail?: string
): Promise<void> {
  const auditEntry: AuditLogEntry = {
    user_email: userEmail || 'system',
    action: 'webhook_processing_error',
    details: {
      event_type: eventType,
      event_id: eventId,
      error_code: error.code,
      error_message: error.message,
      error_details: error.details,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    webhook_event_id: eventId,
  };

  await createAuditLog(auditEntry);
}

/**
 * Query audit logs for investigation and reporting
 */
export async function queryAuditLogs(filters: {
  user_email?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  webhook_event_id?: string;
}): Promise<AuditLogEntry[]> {
  try {
    const token = await getAdminToken();

    // Build filter query
    const filterParts: string[] = [];
    if (filters.user_email) {
      filterParts.push(`filter[user_email][_eq]=${encodeURIComponent(filters.user_email)}`);
    }
    if (filters.action) {
      filterParts.push(`filter[action][_eq]=${encodeURIComponent(filters.action)}`);
    }
    if (filters.start_date) {
      filterParts.push(`filter[timestamp][_gte]=${filters.start_date}`);
    }
    if (filters.end_date) {
      filterParts.push(`filter[timestamp][_lte]=${filters.end_date}`);
    }
    if (filters.webhook_event_id) {
      filterParts.push(`filter[webhook_event_id][_eq]=${filters.webhook_event_id}`);
    }

    const queryString = filterParts.length > 0 ? `?${filterParts.join('&')}` : '';

    const response = await fetch(
      `${DIRECTUS_URL}/items/audit_logs${queryString}&sort=-timestamp&limit=100`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to query audit logs: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to query audit logs:', error);
    return [];
  }
}
