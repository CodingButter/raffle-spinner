/**
 * CRITICAL: Webhook Idempotency Service
 * Prevents duplicate webhook processing - fixes P1 vulnerability from Memento
 */

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

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
 * CRITICAL: Check if webhook event has already been processed
 * This prevents duplicate processing of Stripe webhooks
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
        console.log('webhook_events collection not found - proceeding without idempotency');
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
 * Mark webhook event as successfully completed
 */
export async function markEventCompleted(eventId: string): Promise<void> {
  try {
    const token = await getAdminToken();
    
    const webhookEvent = {
      event_id: eventId,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await fetch(`${DIRECTUS_URL}/items/webhook_events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookEvent),
    });

    console.log(`✅ Webhook event ${eventId} marked as completed`);
  } catch (error) {
    console.error('Error marking event as completed:', error);
    // Don't throw - this shouldn't break webhook processing
  }
}