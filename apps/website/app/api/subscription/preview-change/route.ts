import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PRODUCTS, ProductKey } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const {
      subscriptionId,
      newProductKey,
      upgradeType = 'immediate',
    } = body as {
      subscriptionId: string;
      newProductKey: ProductKey;
      upgradeType: 'immediate' | 'end_of_period';
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
      return NextResponse.json({ error: 'Product price not configured' }, { status: 500 });
    }

    // Get current subscription details
    const subscription = (await stripe.subscriptions.retrieve(
      subscriptionId
    )) as Stripe.Subscription;
    const currentPriceId = subscription.items.data[0]?.price.id;
    const currentPrice = subscription.items.data[0]?.price;

    // Check if it's actually a change
    if (currentPriceId === newProduct.priceId) {
      return NextResponse.json(
        {
          error: 'You are already subscribed to this plan',
        },
        { status: 400 }
      );
    }

    // Determine change type
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

    const currentPlanKey = currentProduct[0] as ProductKey;
    const currentPlanPrice = currentProduct[1].price;
    const isUpgrade = newProduct.price > currentPlanPrice;

    // Calculate proration for immediate changes
    let prorationDetails = null;

    if (upgradeType === 'immediate') {
      // Create a preview of the proration
      const previewParams: Stripe.InvoiceCreatePreviewParams = {
        customer: subscription.customer as string,
        subscription: subscriptionId,
        subscription_details: {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newProduct.priceId,
            },
          ],
          proration_behavior: 'create_prorations',
        },
      };

      try {
        const preview = await stripe.invoices.createPreview(previewParams);

        // Calculate proration from preview
        const prorationItems = preview.lines.data.filter((item: any) => item.proration);
        const totalProration = prorationItems.reduce(
          (sum: number, item: any) => sum + item.amount,
          0
        );

        // Get unused time credit (negative amount)
        const unusedCredit = prorationItems
          .filter((item: any) => item.amount < 0)
          .reduce((sum: number, item: any) => sum + item.amount, 0);

        // Get new plan charges (positive amount)
        const newCharges = prorationItems
          .filter((item: any) => item.amount > 0)
          .reduce((sum: number, item: any) => sum + item.amount, 0);

        prorationDetails = {
          totalAmount: totalProration,
          unusedCredit: Math.abs(unusedCredit),
          newCharges: newCharges,
          currency: preview.currency,
          nextPaymentAmount: preview.total,
          immediateCharge: totalProration > 0 ? totalProration : 0,
          items: prorationItems.map((item) => ({
            description: item.description || '',
            amount: item.amount,
            period: {
              start: item.period?.start ? new Date(item.period.start * 1000).toISOString() : null,
              end: item.period?.end ? new Date(item.period.end * 1000).toISOString() : null,
            },
          })),
        };
      } catch (error) {
        console.error('Failed to create proration preview:', error);
        // Fallback to manual calculation
        const daysRemaining = Math.ceil(
          ((subscription as any).current_period_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
        );
        const dailyDifference = (newProduct.price - currentPlanPrice) / 30;
        const estimatedProration = Math.round(dailyDifference * daysRemaining * 100);

        prorationDetails = {
          totalAmount: estimatedProration,
          unusedCredit: isUpgrade ? 0 : Math.abs(estimatedProration),
          newCharges: isUpgrade ? estimatedProration : 0,
          currency: 'gbp',
          nextPaymentAmount: newProduct.price * 100,
          immediateCharge: estimatedProration > 0 ? estimatedProration : 0,
          items: [],
        };
      }
    }

    // Calculate timing information
    const currentPeriodEnd = (subscription as any).current_period_end;
    const daysRemaining = Math.ceil((currentPeriodEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      success: true,
      preview: {
        currentPlan: {
          key: currentPlanKey,
          name: currentProduct[1].name,
          price: currentPlanPrice,
        },
        newPlan: {
          key: newProductKey,
          name: newProduct.name,
          price: newProduct.price,
        },
        changeType: isUpgrade ? 'upgrade' : 'downgrade',
        upgradeType,
        currentPeriodEnd: currentPeriodEnd,
        daysRemaining,
        proration: prorationDetails,
        effectiveDate:
          upgradeType === 'immediate'
            ? new Date().toISOString()
            : new Date(currentPeriodEnd * 1000).toISOString(),
        summary:
          upgradeType === 'immediate'
            ? isUpgrade
              ? `You will be charged £${Math.abs(prorationDetails?.totalAmount || 0) / 100} today for the upgrade.`
              : `You will receive a credit of £${Math.abs(prorationDetails?.totalAmount || 0) / 100} for the downgrade.`
            : `Plan change will take effect on ${new Date(currentPeriodEnd * 1000).toLocaleDateString()}.`,
      },
    });
  } catch (error) {
    console.error('Preview error:', error);

    if (error instanceof Error) {
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
        error: 'Failed to preview subscription change',
      },
      { status: 500 }
    );
  }
}
