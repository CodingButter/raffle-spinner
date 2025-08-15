import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PRODUCTS, ProductKey } from '@/lib/stripe';
import { createAdminClient } from '@/lib/directus-admin';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const {
      subscriptionId,
      newProductKey,
      upgradeType = 'immediate',
      userId,
      userEmail,
    } = body as {
      subscriptionId: string;
      newProductKey: ProductKey;
      upgradeType: 'immediate' | 'end_of_period';
      userId?: string;
      userEmail?: string;
    };

    // Validate inputs
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    if (!newProductKey || !PRODUCTS[newProductKey]) {
      return NextResponse.json({ error: 'Invalid product selected' }, { status: 400 });
    }

    const newProduct = PRODUCTS[newProductKey];
    if (!newProduct.priceId) {
      return NextResponse.json(
        { error: 'Product price not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Get current subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPriceId = subscription.items.data[0]?.price.id;

    // Check if it's actually a change
    if (currentPriceId === newProduct.priceId) {
      return NextResponse.json(
        {
          error: 'You are already subscribed to this plan',
        },
        { status: 400 }
      );
    }

    // Determine if this is an upgrade or downgrade
    const currentProduct = Object.entries(PRODUCTS).find(
      ([, product]) => product.priceId === currentPriceId
    );

    if (!currentProduct) {
      return NextResponse.json(
        {
          error: 'Current subscription plan not recognized',
        },
        { status: 400 }
      );
    }

    const currentPrice = currentProduct[1].price;
    const newPrice = newProduct.price;
    const isUpgrade = newPrice > currentPrice;

    let updatedSubscription;

    if (upgradeType === 'immediate') {
      // Immediate upgrade/downgrade with proration
      updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newProduct.priceId,
          },
        ],
        proration_behavior: isUpgrade ? 'create_prorations' : 'create_prorations',
        payment_behavior: 'allow_incomplete',
        metadata: {
          ...subscription.metadata,
          product_key: newProductKey,
          change_type: isUpgrade ? 'upgrade' : 'downgrade',
          change_timestamp: new Date().toISOString(),
        },
      });
    } else {
      // Schedule change for end of current period
      updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newProduct.priceId,
          },
        ],
        proration_behavior: 'none',
        payment_behavior: 'allow_incomplete',
        metadata: {
          ...subscription.metadata,
          product_key: newProductKey,
          change_type: isUpgrade ? 'upgrade' : 'downgrade',
          change_timestamp: new Date().toISOString(),
          scheduled_change: 'true',
        },
      });
    }

    // Update subscription in Directus
    if (userId || userEmail) {
      try {
        const directusAdmin = createAdminClient();

        // Get tier key for Directus
        const tierKey = newProductKey === 'professional' ? 'pro' : newProductKey;

        if (userEmail) {
          await directusAdmin.updateUserSubscription(userEmail, {
            subscription_tier: tierKey,
            subscription_status: updatedSubscription.status,
            subscription_current_period_end: new Date(
              updatedSubscription.current_period_end * 1000
            ).toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to update subscription in Directus:', error);
        // Don't fail the API call for Directus errors
      }
    }

    // Calculate proration details for response
    let prorationInfo = null;
    if (upgradeType === 'immediate') {
      // Fetch the latest invoice to get proration details
      const invoices = await stripe.invoices.list({
        subscription: subscriptionId,
        limit: 1,
      });

      if (invoices.data.length > 0) {
        const latestInvoice = invoices.data[0];
        const prorationItems = latestInvoice.lines.data.filter((item) => item.proration);

        if (prorationItems.length > 0) {
          prorationInfo = {
            amount: prorationItems.reduce((sum, item) => sum + item.amount, 0),
            currency: latestInvoice.currency,
            description: isUpgrade
              ? 'Prorated charge for immediate upgrade'
              : 'Prorated credit for immediate downgrade',
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        current_period_end: updatedSubscription.current_period_end,
        plan: newProductKey,
      },
      change_type: isUpgrade ? 'upgrade' : 'downgrade',
      effective: upgradeType === 'immediate' ? 'immediate' : 'end_of_period',
      proration: prorationInfo,
      message:
        upgradeType === 'immediate'
          ? `Plan ${isUpgrade ? 'upgraded' : 'downgraded'} successfully. ${isUpgrade ? 'Prorated charges' : 'Credits'} will appear on your next invoice.`
          : `Plan change scheduled for end of current billing period.`,
    });
  } catch (error) {
    console.error('Subscription update error:', error);

    if (error instanceof Error) {
      // Handle specific Stripe errors
      if (error.message.includes('payment_method')) {
        return NextResponse.json(
          {
            error: 'Payment method required for upgrade. Please update your payment method.',
          },
          { status: 402 }
        );
      }

      if (error.message.includes('subscription')) {
        return NextResponse.json(
          {
            error: 'Subscription not found or inactive',
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to update subscription plan',
      },
      { status: 500 }
    );
  }
}
