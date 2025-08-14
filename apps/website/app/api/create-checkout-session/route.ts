import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCTS, ProductKey } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productKey, userId, email } = body as {
      productKey: ProductKey;
      userId?: string;
      email?: string;
    };

    if (!productKey || !PRODUCTS[productKey]) {
      return NextResponse.json({ error: 'Invalid product selected' }, { status: 400 });
    }

    const product = PRODUCTS[productKey];

    if (!product.priceId) {
      return NextResponse.json(
        { error: 'Product price not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // IMPORTANT: We need the Directus user ID to link accounts
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for subscription' }, { status: 400 });
    }

    // Create Stripe checkout session with user metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      customer_email: email,
      // Pass Directus user ID in checkout metadata
      metadata: {
        directus_user_id: userId, // This links Stripe to Directus
        productKey,
      },
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        // This metadata will be attached to the subscription
        metadata: {
          directus_user_id: userId, // Critical: Links subscription to Directus user
          productKey,
        },
      },
      // Also set customer metadata if creating new customer
      customer_creation: 'always',
      payment_intent_data: {
        metadata: {
          directus_user_id: userId,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
