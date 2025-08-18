/**
 * Enhanced Directus Integration Service
 * Handles subscription data synchronization with Directus CMS
 * Implements retry logic, idempotency, and circuit breaker patterns
 */

import Stripe from 'stripe';
import { withRetry, withIdempotency, directusCircuitBreaker } from './retry-service';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app';
const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'Speed4Dayz1!';

// Enhanced token cache with refresh capability
let tokenCache: { 
  token: string; 
  expires: number; 
  refreshToken?: string;
} | null = null;

/**
 * Get authenticated admin token for Directus operations
 * Enhanced with retry logic and token refresh
 */
async function getAdminToken(): Promise<string> {
  return await directusCircuitBreaker.execute(async () => {
    return await withRetry(async () => {
      // Check cached token (with 1-minute buffer)
      if (tokenCache && tokenCache.expires > Date.now() + 60000) {
        return tokenCache.token;
      }

      // Try refresh if available and token not completely expired
      if (tokenCache?.refreshToken && tokenCache.expires > Date.now()) {
        try {
          return await refreshToken();
        } catch (error) {
          console.warn('Token refresh failed, falling back to login:', error);
          tokenCache = null;
        }
      }

      // Perform new authentication
      const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'DrawDay-Webhook-Handler/1.0'
        },
        body: JSON.stringify({
          email: DIRECTUS_ADMIN_EMAIL,
          password: DIRECTUS_ADMIN_PASSWORD,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to authenticate with Directus: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data?.data?.access_token) {
        throw new Error('Invalid authentication response: missing access token');
      }
      
      // Cache token for 14 minutes (tokens typically expire in 15 minutes)
      tokenCache = {
        token: data.data.access_token,
        expires: Date.now() + 14 * 60 * 1000,
        refreshToken: data.data.refresh_token,
      };

      return data.data.access_token;
    }, {
      maxRetries: 3,
      baseDelay: 1000,
      retryCondition: (error) => !error.message.includes('401') // Don't retry auth failures
    });
  });
}

/**
 * Refresh authentication token
 */
async function refreshToken(): Promise<string> {
  if (!tokenCache?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'User-Agent': 'DrawDay-Webhook-Handler/1.0'
    },
    body: JSON.stringify({
      refresh_token: tokenCache.refreshToken,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data?.data?.access_token) {
    throw new Error('Invalid refresh response: missing access token');
  }

  // Update cached token
  tokenCache = {
    token: data.data.access_token,
    expires: Date.now() + 14 * 60 * 1000,
    refreshToken: data.data.refresh_token || tokenCache.refreshToken,
  };

  console.log('Directus token refreshed successfully');
  return data.data.access_token;
}

/**
 * Create or update subscription in Directus collections
 * Enhanced with retry logic, idempotency, and better error handling
 */
export async function createOrUpdateSubscriptionInDirectus(
  userEmail: string,
  subscription: Stripe.Subscription,
  tier: string
): Promise<void> {
  const idempotencyKey = `subscription-${subscription.id}-${subscription.status}`;
  
  await withIdempotency(async () => {
    return await directusCircuitBreaker.execute(async () => {
      const token = await getAdminToken();

      // Get user with retry
      const user = await withRetry(async () => {
        const userResponse = await fetch(
          `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(userEmail)}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'User-Agent': 'DrawDay-Webhook-Handler/1.0'
            },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!userResponse.ok) {
          throw new Error(`Failed to find user: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        const foundUser = userData.data?.[0];
        if (!foundUser) {
          throw new Error(`User not found: ${userEmail}`);
        }
        return foundUser;
      });

      // Get subscription tier with retry
      const tierRecord = await withRetry(async () => {
        const tierResponse = await fetch(
          `${DIRECTUS_URL}/items/subscription_tiers?filter[tier_key][_eq]=${tier}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'User-Agent': 'DrawDay-Webhook-Handler/1.0'
            },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (!tierResponse.ok) {
          throw new Error(`Failed to find subscription tier: ${tierResponse.status}`);
        }

        const tierData = await tierResponse.json();
        const foundTier = tierData.data?.[0];
        if (!foundTier) {
          throw new Error(`Subscription tier not found: ${tier}`);
        }
        return foundTier;
      });

      const subscriptionData = {
        user: user.id,
        tier: tierRecord.id,
        product: 'spinner',
        status: subscription.status,
        starts_at: new Date(subscription.created * 1000).toISOString(),
        expires_at:
          subscription.status === 'active' && (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
            : null,
        stripe_subscription_id: subscription.id,
        raffle_count: 0, // Reset or preserve existing count
        last_updated: new Date().toISOString(),
      };

      // Check for existing subscription with retry (idempotency check)
      const existingSub = await withRetry(async () => {
        const existingResponse = await fetch(
          `${DIRECTUS_URL}/items/subscriptions?filter[stripe_subscription_id][_eq]=${subscription.id}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'User-Agent': 'DrawDay-Webhook-Handler/1.0'
            },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          return existingData.data?.[0] || null;
        }
        return null;
      });

      if (existingSub) {
        // Update existing subscription with retry
        await withRetry(async () => {
          const updateResponse = await fetch(
            `${DIRECTUS_URL}/items/subscriptions/${existingSub.id}`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'DrawDay-Webhook-Handler/1.0'
              },
              body: JSON.stringify(subscriptionData),
              signal: AbortSignal.timeout(5000),
            }
          );

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text().catch(() => 'Unknown error');
            throw new Error(`Failed to update subscription: ${updateResponse.status} - ${errorText}`);
          }

          console.log(`Updated subscription ${subscription.id} for ${userEmail}`);
        });
      } else {
        // Create new subscription with retry
        await withRetry(async () => {
          const createResponse = await fetch(`${DIRECTUS_URL}/items/subscriptions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'User-Agent': 'DrawDay-Webhook-Handler/1.0'
            },
            body: JSON.stringify(subscriptionData),
            signal: AbortSignal.timeout(5000),
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text().catch(() => 'Unknown error');
            throw new Error(`Failed to create subscription: ${createResponse.status} - ${errorText}`);
          }

          console.log(`Created subscription ${subscription.id} for ${userEmail}`);
        });
      }
    });
  }, idempotencyKey);
}

/**
 * Clear cached token (useful for testing or error recovery)
 */
export function clearTokenCache(): void {
  tokenCache = null;
}