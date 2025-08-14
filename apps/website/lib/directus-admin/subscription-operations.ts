/**
 * Subscription operations module for Directus Admin
 */

import { DirectusAuth } from './auth';

export interface SubscriptionData {
  user_id: string;
  product_key: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export class SubscriptionOperations {
  constructor(private auth: DirectusAuth) {}

  async createOrUpdateSubscription(data: SubscriptionData) {
    try {
      const token = await this.auth.getToken();
      const directusUrl = this.auth.getDirectusUrl();

      // First, find the product by key
      const product = await this.findProduct(data.product_key, token, directusUrl);
      if (!product) {
        throw new Error(`Product not found: ${data.product_key}`);
      }

      // Check if subscription already exists
      const existingSub = await this.findSubscription(
        data.stripe_subscription_id,
        token,
        directusUrl
      );

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
        return await this.updateSubscription(existingSub.id, subscriptionData, token, directusUrl);
      } else {
        return await this.createSubscription(subscriptionData, token, directusUrl);
      }
    } catch (error) {
      console.error('Failed to create/update subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    try {
      const token = await this.auth.getToken();
      const directusUrl = this.auth.getDirectusUrl();

      const subscription = await this.findSubscription(stripeSubscriptionId, token, directusUrl);
      if (!subscription) {
        throw new Error(`Subscription not found: ${stripeSubscriptionId}`);
      }

      // Update subscription status to canceled
      const updateResponse = await fetch(`${directusUrl}/items/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'canceled',
          cancel_at_period_end: true,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to cancel subscription: ${updateResponse.status}`);
      }

      console.log(`Canceled subscription ${stripeSubscriptionId}`);
      return await updateResponse.json();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  private async findProduct(productKey: string, token: string, directusUrl: string) {
    const response = await fetch(`${directusUrl}/items/products?filter[key][_eq]=${productKey}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const { data: products } = await response.json();
    return products?.[0] || null;
  }

  private async findSubscription(stripeSubscriptionId: string, token: string, directusUrl: string) {
    const response = await fetch(
      `${directusUrl}/items/subscriptions?filter[stripe_subscription_id][_eq]=${stripeSubscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check existing subscription: ${response.status}`);
    }

    const { data: subscriptions } = await response.json();
    return subscriptions?.[0] || null;
  }

  private async updateSubscription(id: string, data: any, token: string, directusUrl: string) {
    const response = await fetch(`${directusUrl}/items/subscriptions/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update subscription: ${response.status}`);
    }

    console.log(`Updated subscription ${data.stripe_subscription_id}`);
    return await response.json();
  }

  private async createSubscription(data: any, token: string, directusUrl: string) {
    const response = await fetch(`${directusUrl}/items/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create subscription: ${response.status}`);
    }

    console.log(`Created subscription ${data.stripe_subscription_id}`);
    return await response.json();
  }
}
