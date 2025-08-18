/**
 * Directus Admin Client for server-side operations
 * This uses Directus admin credentials to perform privileged operations
 */

import { DirectusAuth } from './auth';
import { UserOperations, type UserSubscriptionData } from './user-operations';
import { SubscriptionOperations, type SubscriptionData } from './subscription-operations';

export { type UserSubscriptionData, type SubscriptionData };

export function createAdminClient() {
  const auth = new DirectusAuth();
  const userOps = new UserOperations(auth);
  const subscriptionOps = new SubscriptionOperations(auth);

  return {
    // Authentication
    authenticate: () => auth.getToken(),

    // User operations
    updateUserSubscription: (email: string, data: UserSubscriptionData) =>
      userOps.updateUserSubscription(email, data),

    updateUserSubscriptionById: (userId: string, data: UserSubscriptionData) =>
      userOps.updateUserSubscriptionById(userId, data),

    getUserByStripeCustomerId: (customerId: string) =>
      userOps.getUserByStripeCustomerId(customerId),

    // Subscription operations
    createOrUpdateSubscription: (data: SubscriptionData) =>
      subscriptionOps.createOrUpdateSubscription(data),

    cancelSubscription: (stripeSubscriptionId: string) =>
      subscriptionOps.cancelSubscription(stripeSubscriptionId),
  };
}
