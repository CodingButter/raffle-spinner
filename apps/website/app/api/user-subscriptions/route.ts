import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

  // Get user ID from query params
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Fetch user's subscriptions with product details including category and tier
    const response = await fetch(
      `${directusUrl}/items/subscriptions?filter[user][_eq]=${userId}&fields=*,product.*,product.category.*,product.tier.*`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.status}`);
    }

    const { data: subscriptions } = await response.json();

    // Group subscriptions by product type
    const grouped = {
      spinner: [],
      website: [],
      streaming: [],
    } as Record<string, any[]>;

    subscriptions?.forEach((sub: any) => {
      const categoryKey = sub.product?.category?.key || 'spinner';
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = [];
      }
      grouped[categoryKey].push({
        id: sub.id,
        product: {
          name: sub.product?.name,
          key: sub.product?.key,
          price: sub.product?.price,
          currency: sub.product?.currency,
          features: sub.product?.features,
          category: sub.product?.category,
          tier: sub.product?.tier,
        },
        status: sub.status,
        stripe_subscription_id: sub.stripe_subscription_id,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        created_at: sub.created_at,
      });
    });

    return NextResponse.json({
      subscriptions: grouped,
      total: subscriptions?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
