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

    // Forward the request to Directus with subscription data
    const response = await fetch(
      `${DIRECTUS_URL}/users/me?fields=*,subscriptions.id,subscriptions.status,subscriptions.product,subscriptions.starts_at,subscriptions.expires_at,subscriptions.stripe_subscription_id,subscriptions.raffle_count,subscriptions.tier.name,subscriptions.tier.tier_key,subscriptions.tier.max_contestants,subscriptions.tier.max_raffles,subscriptions.tier.has_api_support,subscriptions.tier.has_branding,subscriptions.tier.has_customization`,
      {
        method: 'GET',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { errors: data.errors || [{ message: 'Failed to fetch user' }] },
        {
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const data = await response.json();

    // Transform user data to include subscriptions array
    const user = data.data || data;

    // Debug logging
    console.log('User subscriptions from Directus:', JSON.stringify(user.subscriptions, null, 2));

    // Build subscriptions array from new subscription collections
    const subscriptions = [];

    // Transform new subscription structure
    if (user && user.subscriptions && Array.isArray(user.subscriptions)) {
      user.subscriptions.forEach((sub: any) => {
        // Use tier from subscription if available, otherwise fallback to user's subscription_tier
        const tierKey = sub.tier?.tier_key || user.subscription_tier || 'starter';
        const isPro = tierKey === 'pro' || tierKey === 'professional';

        subscriptions.push({
          id: sub.id,
          product: sub.product,
          tier: tierKey,
          status: sub.status,
          starts_at: sub.starts_at,
          expires_at: sub.expires_at,
          stripe_subscription_id: sub.stripe_subscription_id,
          raffle_count: sub.raffle_count || 0,
          limits: {
            maxContestants: sub.tier?.max_contestants ?? (isPro ? null : 1000),
            maxRaffles: sub.tier?.max_raffles ?? (isPro ? null : 5),
            hasApiSupport: sub.tier?.has_api_support ?? (isPro ? true : false),
            hasBranding: sub.tier?.has_branding ?? true,
            hasCustomization: sub.tier?.has_customization ?? true,
          },
        });
      });
    }

    // Fallback: Check if user has subscription data in old format
    if (
      subscriptions.length === 0 &&
      user &&
      user.stripe_subscription_id &&
      user.subscription_status
    ) {
      // Map old fields to new subscription format
      subscriptions.push({
        id: user.stripe_subscription_id,
        product: 'spinner', // Default product for now
        tier: user.subscription_tier || 'starter',
        status: user.subscription_status,
        current_period_end: user.subscription_current_period_end,
        cancel_at_period_end: user.subscription_cancel_at_period_end,
        stripe_subscription_id: user.stripe_subscription_id,
        stripe_price_id: user.stripe_price_id,
      });
    }

    // Clean up user object - remove old subscription fields
    const cleanedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      stripe_customer_id: user.stripe_customer_id,
      subscriptions: subscriptions,
    };

    return NextResponse.json(
      { data: cleanedUser },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Me proxy error:', error);
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
