/**
 * Directus Admin SDK for server-side operations
 * This uses Directus admin credentials to perform privileged operations
 */

import { createDirectus, rest, authentication } from '@directus/sdk';

// Extend the User type with subscription fields
interface DirectusUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  subscription_tier?: string;
  subscription_current_period_end?: string;
  subscription_cancel_at_period_end?: boolean;
}

interface DirectusSchema {
  directus_users: DirectusUser;
}

// Create admin client for server-side operations
export function createAdminClient() {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.drawday.app';
  const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL;
  const adminPassword = process.env.DIRECTUS_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('Directus admin credentials not configured');
  }

  const client = createDirectus<DirectusSchema>(directusUrl)
    .with(rest())
    .with(authentication('json'));

  return {
    client,

    // Authenticate as admin
    async authenticate() {
      if (!adminEmail || !adminPassword) {
        throw new Error('Directus admin credentials not configured');
      }

      try {
        await client.login(adminEmail, adminPassword);
        return true;
      } catch (error) {
        console.error('Failed to authenticate with Directus:', error);
        throw error;
      }
    },

    // Update user subscription data
    async updateUserSubscription(
      userEmail: string,
      subscriptionData: {
        stripe_customer_id: string;
        stripe_subscription_id: string;
        subscription_status: string;
        subscription_tier: string;
        subscription_current_period_end?: string;
        subscription_cancel_at_period_end?: boolean;
      }
    ) {
      try {
        // First authenticate
        await this.authenticate();

        // Find user by email
        const users = await client.request(
          client.items('directus_users').readByQuery({
            filter: {
              email: {
                _eq: userEmail,
              },
            },
            limit: 1,
          })
        );

        if (!users.data || users.data.length === 0) {
          throw new Error(`User not found: ${userEmail}`);
        }

        const userId = users.data[0].id;

        // Update user with subscription data
        const updatedUser = await client.request(
          client.items('directus_users').updateOne(userId, subscriptionData)
        );

        console.log(`Updated subscription for user ${userEmail}:`, subscriptionData);
        return updatedUser;
      } catch (error) {
        console.error('Failed to update user subscription:', error);
        throw error;
      }
    },

    // Get user by Stripe customer ID
    async getUserByStripeCustomerId(customerId: string) {
      try {
        await this.authenticate();

        const users = await client.request(
          client.items('directus_users').readByQuery({
            filter: {
              stripe_customer_id: {
                _eq: customerId,
              },
            },
            limit: 1,
          })
        );

        return users.data?.[0] || null;
      } catch (error) {
        console.error('Failed to get user by Stripe customer ID:', error);
        return null;
      }
    },
  };
}
