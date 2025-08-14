#!/usr/bin/env node

/**
 * Vercel Deployment Trigger Script
 * 
 * This script triggers a Vercel deployment using the deploy hook
 */

const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK || 'https://api.vercel.com/v1/integrations/deploy/prj_JD9u03ytkcnlv0emNH8eSgQCrMV5/74yHNbePmc';

/**
 * Trigger a Vercel deployment
 */
async function triggerDeploy(message = 'Manual deployment triggered') {
  try {
    console.log('🚀 Triggering Vercel deployment...');
    
    const response = await fetch(DEPLOY_HOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Optional: include metadata about the deployment
        deploymentMeta: {
          message,
          timestamp: new Date().toISOString(),
          source: 'directus-webhook'
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Deployment triggered successfully!');
      console.log('📦 Job ID:', data.job?.id);
      console.log('🔗 Check deployment at: https://vercel.com/deployments');
      return data;
    } else {
      throw new Error(`Failed to trigger deployment: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error triggering deployment:', error);
    throw error;
  }
}

/**
 * Trigger deployment with a delay (useful for batching changes)
 */
async function triggerDelayedDeploy(delaySeconds = 10, message = 'Delayed deployment') {
  console.log(`⏱️  Waiting ${delaySeconds} seconds before deploying...`);
  
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const result = await triggerDeploy(message);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delaySeconds * 1000);
  });
}

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const message = args[0] || 'Manual deployment from script';
  
  triggerDeploy(message)
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  triggerDeploy,
  triggerDelayedDeploy
};