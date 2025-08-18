import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

  // Get user ID from query params
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Get authorization header from request
  const authHeader = request.headers.get('authorization');
  console.log('Auth header present:', !!authHeader);

  try {
    // The subscription data is stored on the user object itself, not in a separate collection
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // If we have an auth token, include it
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('Using auth token for request');
    }

    // Fetch the user data which contains subscription info
    // Use /users/me if we have auth, otherwise try direct user ID (will likely fail without auth)
    const endpoint = authHeader ? '/users/me' : `/users/${userId}`;
    const response = await fetch(`${directusUrl}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      // For now, return empty subscriptions if we get a 403 (permissions issue)
      if (response.status === 403) {
        console.log('User data not accessible without authentication - returning empty');
        return NextResponse.json({
          subscriptions: {
            spinner: [],
            website: [],
            streaming: [],
          },
          total: 0,
        });
      }
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    const { data: userData } = await response.json();

    // Convert the user's subscription data to the expected format
    // Since subscriptions are stored on the user object, we need to transform it
    const grouped = {
      spinner: [],
      website: [],
      streaming: [],
    } as Record<string, any[]>;

    // If the user has an active subscription, add it to the spinner category
    if (userData?.stripe_subscription_id && userData?.subscription_status) {
      // Find the product based on the tier
      const tierToProductKey: Record<string, string> = {
        starter: 'spinner_starter',
        professional: 'spinner_professional',
        enterprise: 'spinner_enterprise',
      };

      const productKey = tierToProductKey[userData.subscription_tier] || 'spinner_starter';

      // Create a subscription object from the user data
      const subscription = {
        id: userData.stripe_subscription_id,
        product: {
          key: productKey,
          tier: {
            key: userData.subscription_tier || 'starter',
          },
        },
        status: userData.subscription_status,
        stripe_subscription_id: userData.stripe_subscription_id,
        current_period_end: userData.subscription_current_period_end,
        cancel_at_period_end: userData.subscription_cancel_at_period_end,
      };

      grouped.spinner.push(subscription);
    }

    return NextResponse.json({
      subscriptions: grouped,
      total: grouped.spinner.length + grouped.website.length + grouped.streaming.length,
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
