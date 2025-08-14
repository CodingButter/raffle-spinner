/**
 * Next.js API Route: Deploy Webhook
 *
 * This endpoint can be called from Directus Flows/Webhooks
 * to trigger a redeployment when content changes
 */

import { NextRequest, NextResponse } from 'next/server';

const VERCEL_DEPLOY_HOOK =
  process.env.VERCEL_DEPLOY_HOOK ||
  'https://api.vercel.com/v1/integrations/deploy/prj_REvWjwDl5e0h67CimJLOJuxgdVr3/3fGqa1dEXG';
const WEBHOOK_SECRET = process.env.DEPLOY_WEBHOOK_SECRET; // Optional: Add security

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    if (WEBHOOK_SECRET) {
      const providedSecret =
        request.headers.get('x-webhook-secret') || request.headers.get('authorization');
      if (providedSecret !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Extract data from Directus webhook
    const body = await request.json();
    const {
      event, // create, update, delete
      collection, // which collection was modified
      key, // item ID
      accountability, // user info
    } = body;

    // Log webhook receipt (uncomment for debugging)
    // console.log(`Webhook received: ${event} on ${collection}`);

    // Trigger Vercel deployment
    const deployResponse = await fetch(VERCEL_DEPLOY_HOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deploymentMeta: {
          trigger: 'directus-webhook',
          event,
          collection,
          itemId: key,
          user: accountability?.user || 'system',
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!deployResponse.ok) {
      throw new Error(`Vercel API returned ${deployResponse.status}`);
    }

    const deployData = await deployResponse.json();

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Deployment triggered successfully',
      deploymentId: deployData.job?.id,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger deployment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
