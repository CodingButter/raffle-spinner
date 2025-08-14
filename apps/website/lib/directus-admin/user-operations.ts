/**
 * User operations module for Directus Admin
 */

import { DirectusAuth } from './auth';

export interface UserSubscriptionData {
  stripe_customer_id: string;
  stripe_subscription_id: string;
  subscription_status: string;
  subscription_tier: string;
  subscription_current_period_end?: string;
  subscription_cancel_at_period_end?: boolean;
}

export class UserOperations {
  constructor(private auth: DirectusAuth) {}

  async updateUserSubscription(userEmail: string, subscriptionData: UserSubscriptionData) {
    try {
      const token = await this.auth.getToken();
      const directusUrl = this.auth.getDirectusUrl();

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
  }

  async updateUserSubscriptionById(userId: string, subscriptionData: UserSubscriptionData) {
    try {
      const token = await this.auth.getToken();
      const directusUrl = this.auth.getDirectusUrl();

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
  }

  async getUserByStripeCustomerId(customerId: string) {
    try {
      const token = await this.auth.getToken();
      const directusUrl = this.auth.getDirectusUrl();

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
  }
}
