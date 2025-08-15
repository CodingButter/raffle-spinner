import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe inside the function to avoid build-time errors
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    });
    const body = await request.json();
    const { productKey, userId, email } = body;

    if (!productKey) {
      return NextResponse.json({ error: 'Product key is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for subscription' }, { status: 400 });
    }

    // Fetch product from Directus using admin credentials
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

    // First authenticate to get admin token
    const authResponse = await fetch(`${directusUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@drawday.app',
        password: 'Speed4Dayz1!',
      }),
    });

    if (!authResponse.ok) {
      console.error('Failed to authenticate with Directus');
      return NextResponse.json(
        { error: 'Failed to authenticate with product database' },
        { status: 500 }
      );
    }

    const { data: authData } = await authResponse.json();
    const token = authData.access_token;

    // Now fetch product with authentication
    const productsResponse = await fetch(
      `${directusUrl}/items/products?filter[key][_eq]=${productKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!productsResponse.ok) {
      console.error('Failed to fetch product from Directus');
      return NextResponse.json({ error: 'Failed to fetch product information' }, { status: 500 });
    }

    const { data: products } = await productsResponse.json();

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    if (!product.stripe_price_id) {
      console.error('Product does not have Stripe price ID:', product);
      return NextResponse.json(
        { error: 'Product is not properly configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session using the price ID from Directus
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
      customer_email: email,
      // Pass Directus user ID in checkout metadata
      metadata: {
        directus_user_id: userId,
        product_key: productKey,
        product_name: product.name,
      },
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        // This metadata will be attached to the subscription
        metadata: {
          directus_user_id: userId,
          product_key: productKey,
          product_name: product.name,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
