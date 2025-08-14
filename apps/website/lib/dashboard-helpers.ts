/**
 * Dashboard Helper Functions
 */

// Group products by category with user subscription status
export function groupProductsByCategory(products: any[], userSubscriptions: any) {
  return products.reduce((acc: any, product) => {
    const categoryKey = product.category?.key || 'spinner';
    if (!acc[categoryKey]) {
      acc[categoryKey] = {
        category: product.category,
        products: [],
      };
    }

    // Check if user has this specific product
    const userHasThisProduct = userSubscriptions[categoryKey]?.some(
      (sub: any) =>
        sub.product?.key === product.key && (sub.status === 'active' || sub.status === 'trialing')
    );

    acc[categoryKey].products.push({
      ...product,
      current: userHasThisProduct,
    });

    // Sort by tier order
    acc[categoryKey].products.sort((a: any, b: any) => {
      const tierOrder: Record<string, number> = { starter: 1, professional: 2, enterprise: 3 };
      const aOrder = tierOrder[a.tier?.key as string] || 999;
      const bOrder = tierOrder[b.tier?.key as string] || 999;
      return aOrder - bOrder;
    });

    return acc;
  }, {});
}

// Extract user data for dashboard display
export function extractUserData(user: any, activeSubscription: any) {
  const userTier = activeSubscription?.tier || 'free';
  return {
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
    email: user.email,
    company: 'Your Company', // TODO: Add company field to User type or get from separate API
    plan: userTier === 'free' ? 'Free Trial' : userTier.charAt(0).toUpperCase() + userTier.slice(1),
    trialEndsAt: activeSubscription?.current_period_end
      ? new Date(activeSubscription.current_period_end).toISOString().split('T')[0]
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usage: {
      draws: 0,
      participants: 0,
      lastDraw: 'Never',
    },
  };
}

// Get active subscription for a specific product
export function getActiveSubscription(user: any, product: string = 'spinner') {
  if (!user?.subscriptions || !Array.isArray(user.subscriptions)) {
    return null;
  }

  return user.subscriptions.find(
    (s: any) => s.product === product && (s.status === 'active' || s.status === 'trialing')
  );
}

// Find active spinner subscription
export function getActiveSpinnerSubscription(userSubscriptions: any) {
  return userSubscriptions.spinner?.find(
    (s: any) => s.status === 'active' || s.status === 'trialing'
  );
}
