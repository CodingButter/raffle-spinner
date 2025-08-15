import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { processWebhookEvent, HANDLED_EVENTS } from '@/lib/stripe-webhook-handlers-enhanced';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Rate limiting - track recent events
const recentEvents = new Map<string, number>();
const EVENT_WINDOW = 60 * 1000; // 1 minute window
const MAX_DUPLICATE_EVENTS = 3;

function isDuplicateEvent(eventId: string): boolean {
  const now = Date.now();
  
  // Clean old events
  for (const [id, timestamp] of recentEvents.entries()) {
    if (now - timestamp > EVENT_WINDOW) {
      recentEvents.delete(id);
    }
  }

  // Check if we've seen this event recently
  const lastSeen = recentEvents.get(eventId);
  if (lastSeen && now - lastSeen < EVENT_WINDOW) {
    return true;
  }

  recentEvents.set(eventId, now);
  return false;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Validate webhook secret
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature provided');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Check for duplicate events
    if (isDuplicateEvent(event.id)) {
      console.log(`⚠️ Duplicate event detected: ${event.id}, skipping`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Log received event
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📨 Webhook received: ${event.type}`);
    console.log(`   Event ID: ${event.id}`);
    console.log(`   Created: ${new Date(event.created * 1000).toISOString()}`);

    // Check if we handle this event type
    const isHandled = HANDLED_EVENTS.includes(event.type as any);
    
    if (!isHandled) {
      console.log(`ℹ️ Event type not handled: ${event.type}`);
      return NextResponse.json({ 
        received: true, 
        handled: false,
        message: `Event type ${event.type} not handled` 
      });
    }

    // Process the event
    try {
      await processWebhookEvent(event);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ Event processed successfully in ${processingTime}ms`);
      console.log(`${'='.repeat(60)}\n`);

      return NextResponse.json({ 
        received: true, 
        handled: true,
        processingTime 
      });
    } catch (processingError) {
      console.error('❌ Failed to process event:', processingError);
      console.error('   Event data:', JSON.stringify(event.data.object, null, 2));
      
      // Return 200 to prevent Stripe retries for non-critical errors
      // Only return error status for critical failures
      const isCritical = processingError.message?.includes('auth failed') ||
                        processingError.message?.includes('Directus');
      
      if (isCritical) {
        return NextResponse.json(
          { 
            error: 'Critical webhook processing error',
            message: processingError.message 
          },
          { status: 500 }
        );
      }

      // Non-critical error - acknowledge receipt but log error
      return NextResponse.json({ 
        received: true, 
        handled: false,
        error: processingError.message 
      });
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    console.error('   Stack:', error.stack);
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    webhook: 'stripe-webhook-enhanced',
    handledEvents: HANDLED_EVENTS,
    configured: !!webhookSecret,
    timestamp: new Date().toISOString(),
  });
}