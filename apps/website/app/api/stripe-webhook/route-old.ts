import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { processWebhookEvent } from '@/lib/stripe-webhooks';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('🚨 Webhook secret not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`📥 Webhook request received: ${requestId}`);

  try {
    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error(`❌ No signature provided: ${requestId}`);
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`✅ Signature verified for ${event.type}: ${event.id}`);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed: ${requestId}`, err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process webhook with idempotency and error handling
    const result = await processWebhookEvent(event);

    if (result.success) {
      console.log(`✅ Webhook processed successfully: ${event.type} (${event.id})`);
      return NextResponse.json({
        received: true,
        event_id: event.id,
        processed_at: result.processed_at,
      });
    } else {
      console.error(`❌ Webhook processing failed: ${event.type} (${event.id})`, result.error);

      // Return appropriate status based on whether retry is scheduled
      const status = result.retry_scheduled ? 500 : 400;
      return NextResponse.json(
        {
          error: 'Webhook processing failed',
          event_id: event.id,
          retryable: result.retry_scheduled,
          details: result.error?.message,
        },
        { status }
      );
    }
  } catch (error) {
    console.error(`💥 Critical webhook error: ${requestId}`, error);
    return NextResponse.json(
      {
        error: 'Critical webhook processing failure',
        request_id: requestId,
      },
      { status: 500 }
    );
  }
}
