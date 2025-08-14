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

    // Create Stripe checkout session
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
      metadata: {
        userId: userId || '',
        productKey,
      },
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        metadata: {
          userId: userId || '',
          productKey,
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
