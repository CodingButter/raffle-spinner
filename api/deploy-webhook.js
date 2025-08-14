/**
 * Vercel Serverless Function: Deploy Webhook
 *
 * This endpoint can be called from Directus Flows/Webhooks
 * to trigger a redeployment when content changes
 *
 * Deploy this as a Vercel serverless function
 */

const VERCEL_DEPLOY_HOOK =
  process.env.VERCEL_DEPLOY_HOOK ||
  'https://api.vercel.com/v1/integrations/deploy/prj_REvWjwDl5e0h67CimJLOJuxgdVr3/[DEPLOY_HOOK_ID]';
const WEBHOOK_SECRET = process.env.DEPLOY_WEBHOOK_SECRET; // Optional: Add security

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook secret if configured
    if (WEBHOOK_SECRET) {
      const providedSecret = req.headers['x-webhook-secret'] || req.headers['authorization'];
      if (providedSecret !== WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    // Extract data from Directus webhook
    const {
      event, // create, update, delete
      collection, // which collection was modified
      key, // item ID
      // payload,    // the actual data (unused)
      accountability, // user info
    } = req.body;

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
    return res.status(200).json({
      success: true,
      message: 'Deployment triggered successfully',
      deploymentId: deployData.job?.id,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: 'Failed to trigger deployment',
      message: error.message,
    });
  }
}
