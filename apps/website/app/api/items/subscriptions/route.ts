import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');

    if (!authorization) {
      return NextResponse.json(
        { errors: [{ message: 'No authorization token provided' }] },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Get the current user from the token - no need for userId parameter
    const userResponse = await fetch(`${DIRECTUS_URL}/users/me`, {
      method: 'GET',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      // Return empty data array for 403 or 404 (common for permissions issues)
      if (userResponse.status === 403 || userResponse.status === 404) {
        return NextResponse.json(
          { data: [] },
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }

      const data = await userResponse.json();
      return NextResponse.json(
        { errors: data.errors || [{ message: 'Failed to fetch subscriptions' }] },
        {
          status: userResponse.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const userData = await userResponse.json();
    const user = userData.data || userData;

    // Convert user subscription data to subscription format
    const subscriptions = [];
    if (user.stripe_subscription_id && user.subscription_status === 'active') {
      subscriptions.push({
        id: user.stripe_subscription_id,
        user: user.id, // Use the user ID from the fetched user data
        product: 'drawday',
        tier: user.subscription_tier || 'starter',
        status: user.subscription_status,
        stripe_subscription_id: user.stripe_subscription_id,
        stripe_customer_id: user.stripe_customer_id,
        current_period_end: user.subscription_current_period_end,
        cancel_at_period_end: user.subscription_cancel_at_period_end,
      });
    }

    // Return in Directus format
    return NextResponse.json(
      { data: subscriptions },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Subscriptions proxy error:', error);
    return NextResponse.json(
      { errors: [{ message: 'Internal server error' }] },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Add CORS headers for extension
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
