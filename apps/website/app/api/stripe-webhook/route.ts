import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCTS } from '@/lib/stripe';
import { createAdminClient } from '@/lib/directus-admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper function to determine tier from price ID
function getTierFromPriceId(priceId: string): string {
  const productEntries = Object.entries(PRODUCTS);
  for (const [key, product] of productEntries) {
    if (product.priceId === priceId) {
      return key; // 'starter', 'professional', or 'enterprise'
    }
  }
  return 'free';
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const directusAdmin = createAdminClient();

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('Checkout completed:', session.id);

        // Get the full session details with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'subscription'],
        });

        if (fullSession.subscription && fullSession.customer_email) {
          const subscription = fullSession.subscription as Stripe.Subscription;
          const priceId = subscription.items.data[0]?.price.id;
          const tier = getTierFromPriceId(priceId);

          // Update user subscription in Directus
          try {
            await directusAdmin.updateUserSubscription(fullSession.customer_email, {
              stripe_customer_id: fullSession.customer as string,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscription_tier: tier,
              subscription_current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              subscription_cancel_at_period_end: subscription.cancel_at_period_end,
            });

            console.log(`Updated subscription for ${fullSession.customer_email} to ${tier} tier`);
          } catch (error) {
            console.error('Failed to update user subscription in Directus:', error);
            // Don't fail the webhook, log the error for manual resolution
          }
        }

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        console.log('Subscription updated:', subscription.id);

        // Get customer details
        const customer = (await stripe.customers.retrieve(
          subscription.customer as string
        )) as Stripe.Customer;

        if (customer.email) {
          const priceId = subscription.items.data[0]?.price.id;
          const tier = getTierFromPriceId(priceId);

          try {
            await directusAdmin.updateUserSubscription(customer.email, {
              stripe_customer_id: customer.id,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscription_tier: tier,
              subscription_current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              subscription_cancel_at_period_end: subscription.cancel_at_period_end,
            });

            console.log(
              `Updated subscription status for ${customer.email}: ${subscription.status}`
            );
          } catch (error) {
            console.error('Failed to update subscription in Directus:', error);
          }
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        console.log('Subscription cancelled:', subscription.id);

        // Get customer details
        const customer = (await stripe.customers.retrieve(
          subscription.customer as string
        )) as Stripe.Customer;

        if (customer.email) {
          try {
            // Update user to free tier
            await directusAdmin.updateUserSubscription(customer.email, {
              stripe_customer_id: customer.id,
              stripe_subscription_id: '',
              subscription_status: 'canceled',
              subscription_tier: 'free',
              subscription_current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              subscription_cancel_at_period_end: false,
            });

            console.log(`Cancelled subscription for ${customer.email}, reverted to free tier`);
          } catch (error) {
            console.error('Failed to cancel subscription in Directus:', error);
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        console.log('Payment succeeded for invoice:', invoice.id);

        // Optional: Log successful payments for audit trail
        if (invoice.subscription && invoice.customer_email) {
          console.log(
            `Payment successful for ${invoice.customer_email}, amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`
          );
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        console.log('Payment failed for invoice:', invoice.id);

        // Update subscription status to past_due
        if (invoice.subscription && invoice.customer_email) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              invoice.subscription as string
            );

            await directusAdmin.updateUserSubscription(invoice.customer_email, {
              stripe_customer_id: invoice.customer as string,
              stripe_subscription_id: subscription.id,
              subscription_status: 'past_due',
              subscription_tier: getTierFromPriceId(subscription.items.data[0]?.price.id),
              subscription_current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              subscription_cancel_at_period_end: subscription.cancel_at_period_end,
            });

            console.log(
              `Payment failed for ${invoice.customer_email}, subscription marked as past_due`
            );

            // TODO: Send payment failed email to customer
          } catch (error) {
            console.error('Failed to update payment failed status:', error);
          }
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
