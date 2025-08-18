import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
  handlePaymentSucceeded,
  handlePaymentFailed,
} from '@/lib/stripe-webhook-handlers';
import { isEventProcessed, markEventCompleted } from '@/lib/webhook-idempotency';

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

    // CRITICAL: Check idempotency - prevent duplicate processing
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`✅ Event ${event.id} already processed - skipping (idempotency)`);
      return NextResponse.json({ 
        received: true, 
        event_id: event.id,
        duplicate: true 
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Mark event as completed for idempotency
    await markEventCompleted(event.id);

    console.log(`✅ Webhook processed successfully: ${event.type} (${event.id})`);
    return NextResponse.json({ 
      received: true, 
      event_id: event.id,
      processed_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`💥 Critical webhook error: ${requestId}`, error);
    return NextResponse.json({ 
      error: 'Critical webhook processing failure',
      request_id: requestId 
    }, { status: 500 });
  }
}