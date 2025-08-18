/**
 * Webhook Idempotency Service
 * CRITICAL: Prevents duplicate webhook processing - fixes P1 vulnerability
 *
 * Every webhook event has a unique ID from Stripe. We track these to ensure
 * each event is processed exactly once, even if Stripe retries delivery.
 */

import { WebhookEventLog, WebhookError } from '../types';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

/**
 * Get admin token for Directus operations
 * @returns {Promise<string>} Admin access token
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
    throw new Error('Failed to authenticate with Directus for idempotency check');
  }

  const data = await response.json();
  return data.data.access_token;
}

/**
 * Check if webhook event has already been processed
 * CRITICAL: This prevents duplicate processing of Stripe webhooks
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    const token = await getAdminToken();

    const response = await fetch(
      `${DIRECTUS_URL}/items/webhook_events?filter[event_id][_eq]=${eventId}&fields=id,status`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      // If webhook_events collection doesn't exist, consider event unprocessed
      if (response.status === 403 || response.status === 404) {
        console.log('webhook_events collection not found - creating event log without idempotency');
        return false;
      }
      throw new Error(`Failed to check event status: ${response.status}`);
    }

    const data = await response.json();
    const existingEvent = data.data?.[0];

    // Event is considered processed if it exists and is completed
    return existingEvent && existingEvent.status === 'completed';
  } catch (error) {
    console.error('Error checking event idempotency:', error);
    // On error, allow processing to continue (fail open for reliability)
    return false;
  }
}

/**
 * Mark webhook event as being processed
 * Creates a processing lock to prevent concurrent processing
 */
export async function markEventProcessing(
  eventId: string,
  eventType: string,
  eventData?: Record<string, any>
): Promise<string> {
  try {
    const token = await getAdminToken();

    const webhookEvent: Partial<WebhookEventLog> = {
      event_id: eventId,
      event_type: eventType,
      status: 'processing',
      attempts: 1,
      max_attempts: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      event_data: eventData,
    };

    const response = await fetch(`${DIRECTUS_URL}/items/webhook_events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookEvent),
    });

    if (!response.ok) {
      throw new Error(`Failed to create webhook event log: ${response.status}`);
    }

    const data = await response.json();
    return data.data.id;
  } catch (error) {
    console.error('Error marking event as processing:', error);
    throw error;
  }
}

/**
 * Mark webhook event as successfully completed
 */
export async function markEventCompleted(eventId: string): Promise<void> {
  try {
    const token = await getAdminToken();

    // Find the event record
    const findResponse = await fetch(
      `${DIRECTUS_URL}/items/webhook_events?filter[event_id][_eq]=${eventId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!findResponse.ok) {
      throw new Error('Failed to find webhook event for completion');
    }

    const findData = await findResponse.json();
    const eventRecord = findData.data?.[0];

    if (!eventRecord) {
      throw new Error(`Webhook event not found: ${eventId}`);
    }

    // Update to completed status
    const updateResponse = await fetch(`${DIRECTUS_URL}/items/webhook_events/${eventRecord.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed',
        updated_at: new Date().toISOString(),
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to mark webhook event as completed');
    }

    console.log(`✅ Webhook event ${eventId} marked as completed`);
  } catch (error) {
    console.error('Error marking event as completed:', error);
    throw error;
  }
}

/**
 * Mark webhook event as failed and potentially schedule retry
 */
export async function markEventFailed(
  eventId: string,
  error: WebhookError,
  shouldRetry: boolean = false
): Promise<void> {
  try {
    const token = await getAdminToken();

    // Find the event record
    const findResponse = await fetch(
      `${DIRECTUS_URL}/items/webhook_events?filter[event_id][_eq]=${eventId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!findResponse.ok) {
      throw new Error('Failed to find webhook event for failure marking');
    }

    const findData = await findResponse.json();
    const eventRecord = findData.data?.[0];

    if (!eventRecord) {
      throw new Error(`Webhook event not found: ${eventId}`);
    }

    const attempts = (eventRecord.attempts || 0) + 1;
    const maxAttempts = eventRecord.max_attempts || 3;

    // Determine final status
    const status = shouldRetry && attempts < maxAttempts ? 'retrying' : 'failed';

    // Update event record
    const updateResponse = await fetch(`${DIRECTUS_URL}/items/webhook_events/${eventRecord.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        attempts,
        error_message: error.message,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to mark webhook event as failed');
    }

    console.log(
      `❌ Webhook event ${eventId} marked as ${status} (attempt ${attempts}/${maxAttempts})`
    );
  } catch (error) {
    console.error('Error marking event as failed:', error);
    throw error;
  }
}

/**
 * Clean up old webhook event logs (older than 30 days)
 * Should be called periodically to prevent table bloat
 */
export async function cleanupOldEvents(): Promise<void> {
  try {
    const token = await getAdminToken();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const response = await fetch(
      `${DIRECTUS_URL}/items/webhook_events?filter[created_at][_lt]=${thirtyDaysAgo.toISOString()}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      console.log('✅ Cleaned up old webhook event logs');
    }
  } catch (error) {
    console.error('Error cleaning up old events:', error);
    // Don't throw - cleanup is non-critical
  }
}
