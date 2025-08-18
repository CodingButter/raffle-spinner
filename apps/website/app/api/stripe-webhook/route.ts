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
import {
  validateWebhookRequest,
  validateWebhookSignature,
  getSecurityHeaders,
  logSecurityEvent,
} from '@/lib/stripe-webhook-handlers/security-service';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // Apply security headers
  const securityHeaders = getSecurityHeaders();
  
  if (!webhookSecret) {
    logSecurityEvent('missing_webhook_secret', {}, 'high');
    return NextResponse.json(
      { error: 'Webhook secret not configured' }, 
      { 
        status: 500,
        headers: securityHeaders
      }
    );
  }

  try {
    // Security validation
    const validation = validateWebhookRequest(request);
    if (!validation.isValid) {
      const headers = { 
        ...securityHeaders,
        ...(validation.rateLimitInfo && {
          'X-RateLimit-Remaining': validation.rateLimitInfo.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(validation.rateLimitInfo.resetTime / 1000).toString()
        })
      };

      return NextResponse.json(
        { error: validation.error },
        { 
          status: validation.error === 'Rate limit exceeded' ? 429 : 400,
          headers
        }
      );
    }

    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logSecurityEvent('missing_signature', { contentLength: body.length }, 'high');
      return NextResponse.json(
        { error: 'No signature provided' }, 
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    // Verify webhook signature with enhanced validation
    if (!validateWebhookSignature(body, signature, webhookSecret)) {
      logSecurityEvent('invalid_signature', { 
        signaturePrefix: signature.substring(0, 20),
        contentLength: body.length 
      }, 'high');
      return NextResponse.json(
        { error: 'Invalid signature' }, 
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    // Construct and validate Stripe event
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      logSecurityEvent('stripe_verification_failed', { 
        error: err instanceof Error ? err.message : String(err)
      }, 'high');
      return NextResponse.json(
        { error: 'Invalid signature' }, 
        { 
          status: 400,
          headers: securityHeaders
        }
      );
    }

    // Log successful webhook receipt
    console.log(`Processing webhook: ${event.type} (${event.id})`);

    // Handle the event with proper error isolation
    try {
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
          console.log(`Unhandled event type: ${event.type}`);
          // Still return success for unhandled events
      }
    } catch (handlerError) {
      // Log handler errors but don't fail the webhook
      console.error(`Handler error for ${event.type}:`, handlerError);
      logSecurityEvent('handler_error', {
        eventType: event.type,
        eventId: event.id,
        error: handlerError instanceof Error ? handlerError.message : String(handlerError)
      }, 'medium');

      // Return success to Stripe to prevent retries for application errors
      // TODO: Implement dead letter queue for failed events
    }

    const processingTime = Date.now() - startTime;
    console.log(`Webhook ${event.type} processed in ${processingTime}ms`);

    // Add rate limit headers to successful responses
    const responseHeaders = {
      ...securityHeaders,
      ...(validation.rateLimitInfo && {
        'X-RateLimit-Remaining': validation.rateLimitInfo.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(validation.rateLimitInfo.resetTime / 1000).toString()
      }),
      'X-Processing-Time': processingTime.toString()
    };

    return NextResponse.json(
      { received: true, event_type: event.type },
      { 
        status: 200,
        headers: responseHeaders
      }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Webhook processing error:', error);
    
    logSecurityEvent('processing_error', {
      error: error instanceof Error ? error.message : String(error),
      processingTime
    }, 'high');

    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { 
        status: 500,
        headers: {
          ...securityHeaders,
          'X-Processing-Time': processingTime.toString()
        }
      }
    );
  }
}
