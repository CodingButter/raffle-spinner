/**
 * Analytics API Route
 * 
 * Fetches subscription metrics from Stripe for analytics dashboard
 */

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function GET() {
  try {
    const stripe = getStripe();
    
    // Get current date and date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Fetch all active subscriptions
    const activeSubscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer'],
    });
    
    // Fetch canceled subscriptions for churn calculation
    const canceledSubscriptions = await stripe.subscriptions.list({
      status: 'canceled',
      created: {
        gte: Math.floor(startOfMonth.getTime() / 1000),
      },
      limit: 100,
    });
    
    // Fetch trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      status: 'trialing',
      limit: 100,
    });
    
    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = activeSubscriptions.data.reduce((total, sub) => {
      const monthlyAmount = sub.items.data.reduce((sum, item) => {
        const amount = (item.price.unit_amount || 0) * (item.quantity || 1);
        // Convert to monthly if billing period is yearly
        const monthlyPrice = item.price.recurring?.interval === 'year' 
          ? amount / 12 
          : amount;
        return sum + monthlyPrice;
      }, 0);
      return total + monthlyAmount;
    }, 0) / 100; // Convert from cents to dollars
    
    // Calculate churn rate
    const totalActiveCount = activeSubscriptions.data.length;
    const canceledCount = canceledSubscriptions.data.length;
    const churnRate = totalActiveCount > 0 
      ? (canceledCount / (totalActiveCount + canceledCount)) * 100 
      : 0;
    
    // Calculate average revenue per user (ARPU) for CLV estimation
    const arpu = totalActiveCount > 0 ? mrr / totalActiveCount : 0;
    
    // Estimate CLV (using simple formula: ARPU / monthly churn rate)
    const monthlyChurnRate = churnRate / 100;
    const clv = monthlyChurnRate > 0 ? arpu / monthlyChurnRate : arpu * 12; // Default to 12 months if no churn
    
    // Analyze upgrade/downgrade patterns
    const upgrades: Array<{ date: string; from: number; to: number }> = [];
    const downgrades: Array<{ date: string; from: number; to: number }> = [];
    
    // Get subscription events for pattern analysis
    const events = await stripe.events.list({
      type: 'customer.subscription.updated',
      created: {
        gte: Math.floor(startOfLastMonth.getTime() / 1000),
      },
      limit: 100,
    });
    
    events.data.forEach((event: any) => {
      const previousSub = event.data.previous_attributes;
      const currentSub = event.data.object;
      
      if (previousSub?.items && currentSub?.items) {
        const prevPrice = previousSub.items.data[0]?.price?.unit_amount || 0;
        const currPrice = currentSub.items.data[0]?.price?.unit_amount || 0;
        
        if (currPrice > prevPrice) {
          upgrades.push({
            date: new Date(event.created * 1000).toISOString(),
            from: prevPrice / 100,
            to: currPrice / 100,
          });
        } else if (currPrice < prevPrice) {
          downgrades.push({
            date: new Date(event.created * 1000).toISOString(),
            from: prevPrice / 100,
            to: currPrice / 100,
          });
        }
      }
    });
    
    // Calculate trial to paid conversion rate
    const trialCount = trialingSubscriptions.data.length;
    const recentConversions = await stripe.events.list({
      type: 'customer.subscription.updated',
      created: {
        gte: Math.floor(startOfMonth.getTime() / 1000),
      },
      limit: 100,
    });
    
    const conversions = recentConversions.data.filter((event: any) => {
      const prev = event.data.previous_attributes;
      const curr = event.data.object;
      return prev?.status === 'trialing' && curr?.status === 'active';
    });
    
    const conversionRate = trialCount > 0 
      ? (conversions.length / (trialCount + conversions.length)) * 100 
      : 0;
    
    // Get payment failure data
    const failedCharges = await stripe.charges.list({
      created: {
        gte: Math.floor(startOfMonth.getTime() / 1000),
      },
      limit: 100,
    });
    
    const failedPayments = failedCharges.data.filter(charge => 
      charge.status === 'failed' && charge.payment_method_details
    );
    
    const totalPayments = failedCharges.data.length;
    const failureRate = totalPayments > 0 
      ? (failedPayments.length / totalPayments) * 100 
      : 0;
    
    // Prepare analytics response
    const analytics = {
      mrr: Math.round(mrr * 100) / 100,
      churnRate: Math.round(churnRate * 100) / 100,
      clv: Math.round(clv * 100) / 100,
      activeSubscriptions: totalActiveCount,
      trialSubscriptions: trialCount,
      conversionRate: Math.round(conversionRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
      upgrades: upgrades.length,
      downgrades: downgrades.length,
      recentUpgrades: upgrades.slice(0, 5),
      recentDowngrades: downgrades.slice(0, 5),
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}