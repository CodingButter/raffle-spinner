/**
 * Audit and Notification Service
 * Handles logging and notifications for subscription changes
 */

import Stripe from 'stripe';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app';
const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Speed4Dayz1!';

/**
 * Get admin token for audit operations
 */
async function getAdminToken(): Promise<string> {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: DIRECTUS_ADMIN_EMAIL,
      password: DIRECTUS_ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Directus');
  }

  const data = await response.json();
  return data.data.access_token;
}

/**
 * Log plan changes for audit trail
 * Creates audit record for subscription modifications
 */
export async function logPlanChange(
  userEmail: string,
  subscription: Stripe.Subscription,
  changeType: string,
  newTier: string
): Promise<void> {
  try {
    const token = await getAdminToken();

    const auditData = {
      user_email: userEmail,
      action: 'subscription_plan_change',
      details: {
        subscription_id: subscription.id,
        change_type: changeType,
        new_tier: newTier,
        change_timestamp: subscription.metadata?.change_timestamp,
        scheduled_change: subscription.metadata?.scheduled_change === 'true',
      },
      timestamp: new Date().toISOString(),
    };

    // Note: This assumes an audit_logs collection exists
    await fetch(`${DIRECTUS_URL}/items/audit_logs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData),
    });

    console.log(`Logged ${changeType} for ${userEmail} to ${newTier}`);
  } catch (error) {
    console.log('Note: Could not create audit log (collection may not exist):', 
      error instanceof Error ? error.message : String(error));
  }
}

/**
 * Send plan change notifications
 * TODO: Implement email notification system integration
 */
export async function sendPlanChangeNotification(
  userEmail: string, 
  changeType: string, 
  newTier: string
): Promise<void> {
  try {
    // TODO: Implement email notification system
    // This could integrate with your email service (SendGrid, Mailgun, etc.)
    console.log(`Plan change notification needed: ${changeType} to ${newTier} for ${userEmail}`);

    // For now, just log the notification
    // In a production system, you would:
    // 1. Send email notification to user
    // 2. Create in-app notification
    // 3. Update user's notification preferences
  } catch (error) {
    console.error('Failed to send plan change notification:', error);
  }
}