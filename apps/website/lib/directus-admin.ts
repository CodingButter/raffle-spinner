/**
 * Directus Admin SDK for server-side operations
 * This uses Directus admin credentials to perform privileged operations
 */

// Direct fetch-based client instead of SDK to avoid authentication issues
export function createAdminClient() {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.drawday.app';
  const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL;
  const adminPassword = process.env.DIRECTUS_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('Directus admin credentials not configured');
  }

  return {
    // Authenticate and get token
    async authenticate() {
      if (!adminEmail || !adminPassword) {
        throw new Error('Directus admin credentials not configured');
      }

      try {
        const response = await fetch(`${directusUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: adminEmail,
            password: adminPassword,
          }),
        });

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status}`);
        }

        const { data } = await response.json();
        return data.access_token;
      } catch (error) {
        console.error('Failed to authenticate with Directus:', error);
        throw error;
      }
    },

    // Update user subscription data by email
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
        const token = await this.authenticate();

        // Find user by email
        const usersResponse = await fetch(
          `${directusUrl}/users?filter[email][_eq]=${userEmail}&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!usersResponse.ok) {
          throw new Error(`Failed to fetch user: ${usersResponse.status}`);
        }

        const { data: users } = await usersResponse.json();

        if (!users || users.length === 0) {
          throw new Error(`User not found: ${userEmail}`);
        }

        const userId = users[0].id;

        // Update user with subscription data
        const updateResponse = await fetch(`${directusUrl}/users/${userId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionData),
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update user: ${updateResponse.status}`);
        }

        const updatedUser = await updateResponse.json();
        console.log(`Updated subscription for user ${userEmail}:`, subscriptionData);
        return updatedUser;
      } catch (error) {
        console.error('Failed to update user subscription:', error);
        throw error;
      }
    },

    // Update user subscription data by user ID
    async updateUserSubscriptionById(
      userId: string,
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
        const token = await this.authenticate();

        // Update user with subscription data directly by ID
        const updateResponse = await fetch(`${directusUrl}/users/${userId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionData),
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update user: ${updateResponse.status}`);
        }

        const updatedUser = await updateResponse.json();
        console.log(`Updated subscription for user ID ${userId}:`, subscriptionData);
        return updatedUser;
      } catch (error) {
        console.error(`Failed to update user subscription for ID ${userId}:`, error);
        throw error;
      }
    },

    // Get user by Stripe customer ID
    async getUserByStripeCustomerId(customerId: string) {
      try {
        const token = await this.authenticate();

        const usersResponse = await fetch(
          `${directusUrl}/users?filter[stripe_customer_id][_eq]=${customerId}&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!usersResponse.ok) {
          throw new Error(`Failed to fetch user by customer ID: ${usersResponse.status}`);
        }

        const { data: users } = await usersResponse.json();
        return users?.[0] || null;
      } catch (error) {
        console.error('Failed to get user by Stripe customer ID:', error);
        return null;
      }
    },

    // Create or update subscription record
    async createOrUpdateSubscription(data: {
      user_id: string;
      product_key: string;
      stripe_subscription_id: string;
      stripe_customer_id: string;
      status: string;
      current_period_end?: string;
      cancel_at_period_end?: boolean;
    }) {
      try {
        const token = await this.authenticate();

        // First, find the product by key
        const productsResponse = await fetch(
          `${directusUrl}/items/products?filter[key][_eq]=${data.product_key}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch product: ${productsResponse.status}`);
        }

        const { data: products } = await productsResponse.json();
        const product = products?.[0];

        if (!product) {
          throw new Error(`Product not found: ${data.product_key}`);
        }

        // Check if subscription already exists
        const existingSubResponse = await fetch(
          `${directusUrl}/items/subscriptions?filter[stripe_subscription_id][_eq]=${data.stripe_subscription_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!existingSubResponse.ok) {
          throw new Error(`Failed to check existing subscription: ${existingSubResponse.status}`);
        }

        const { data: existingSubs } = await existingSubResponse.json();
        const existingSub = existingSubs?.[0];

        const subscriptionData = {
          user: data.user_id,
          product: product.id,
          stripe_subscription_id: data.stripe_subscription_id,
          stripe_customer_id: data.stripe_customer_id,
          status: data.status,
          current_period_end: data.current_period_end,
          cancel_at_period_end: data.cancel_at_period_end || false,
        };

        if (existingSub) {
          // Update existing subscription
          const updateResponse = await fetch(
            `${directusUrl}/items/subscriptions/${existingSub.id}`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscriptionData),
            }
          );

          if (!updateResponse.ok) {
            throw new Error(`Failed to update subscription: ${updateResponse.status}`);
          }

          console.log(`Updated subscription ${data.stripe_subscription_id}`);
          return await updateResponse.json();
        } else {
          // Create new subscription
          const createResponse = await fetch(`${directusUrl}/items/subscriptions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionData),
          });

          if (!createResponse.ok) {
            throw new Error(`Failed to create subscription: ${createResponse.status}`);
          }

          console.log(`Created subscription ${data.stripe_subscription_id}`);
          return await createResponse.json();
        }
      } catch (error) {
        console.error('Failed to create/update subscription:', error);
        throw error;
      }
    },

    // Cancel subscription
    async cancelSubscription(stripeSubscriptionId: string) {
      try {
        const token = await this.authenticate();

        // Find the subscription
        const subResponse = await fetch(
          `${directusUrl}/items/subscriptions?filter[stripe_subscription_id][_eq]=${stripeSubscriptionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!subResponse.ok) {
          throw new Error(`Failed to find subscription: ${subResponse.status}`);
        }

        const { data: subs } = await subResponse.json();
        const subscription = subs?.[0];

        if (!subscription) {
          throw new Error(`Subscription not found: ${stripeSubscriptionId}`);
        }

        // Update subscription status to canceled
        const updateResponse = await fetch(
          `${directusUrl}/items/subscriptions/${subscription.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'canceled',
              cancel_at_period_end: true,
            }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error(`Failed to cancel subscription: ${updateResponse.status}`);
        }

        console.log(`Canceled subscription ${stripeSubscriptionId}`);
        return await updateResponse.json();
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
        throw error;
      }
    },
  };
}
