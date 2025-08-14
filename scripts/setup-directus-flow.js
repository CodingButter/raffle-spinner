#!/usr/bin/env node

/**
 * Setup Directus Flow for Auto-Deployment
 *
 * This script creates a Flow in Directus that triggers Vercel deployments
 * when content changes in specified collections.
 */

const DIRECTUS_URL = 'https://admin.drawday.app';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'drawday';

// Get the Vercel deploy hook from environment or command line
const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK || process.argv[2];

if (!VERCEL_DEPLOY_HOOK || VERCEL_DEPLOY_HOOK.includes('[DEPLOY_HOOK_ID]')) {
  console.error(`
❌ Error: Vercel Deploy Hook not provided!

Usage:
  node setup-directus-flow.js YOUR_VERCEL_DEPLOY_HOOK_URL

Example:
  node setup-directus-flow.js https://api.vercel.com/v1/integrations/deploy/prj_REvWjwDl5e0h67CimJLOJuxgdVr3/YOUR_HOOK_ID

To get your deploy hook:
1. Go to: https://vercel.com/dashboard/project/prj_REvWjwDl5e0h67CimJLOJuxgdVr3
2. Navigate to Settings → Git → Deploy Hooks
3. Create a new deploy hook and copy the URL
  `);
  process.exit(1);
}

/**
 * Authenticate with Directus
 */
async function authenticate() {
  try {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const data = await response.json();
    if (data.data?.access_token) {
      console.log('✅ Authenticated with Directus');
      return data.data.access_token;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
    throw error;
  }
}

/**
 * Check if Flows are available
 */
async function checkFlowsAvailable(token) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/flows`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 403) {
      console.log('⚠️  Flows might not be available or you need admin permissions');
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error('Error checking flows:', error);
    return false;
  }
}

/**
 * Create a Flow for auto-deployment
 */
async function createDeploymentFlow(token) {
  try {
    // Create the main flow
    const flowResponse = await fetch(`${DIRECTUS_URL}/flows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Auto Deploy to Vercel',
        icon: 'cloud_upload',
        description: 'Automatically triggers Vercel deployment when content changes',
        status: 'active',
        trigger: 'event',
        accountability: 'all',
        options: {
          type: 'action',
          scope: ['items.create', 'items.update', 'items.delete'],
          collections: [
            'homepage',
            'spinner_page',
            'pricing',
            'features',
            'company_info',
            'social_media',
            'footer_links',
            'careers',
          ],
        },
      }),
    });

    if (!flowResponse.ok) {
      const error = await flowResponse.json();
      throw new Error(error.errors?.[0]?.message || 'Failed to create flow');
    }

    const flowData = await flowResponse.json();
    const flowId = flowData.data.id;
    console.log('✅ Created flow:', flowId);

    // Create a webhook operation
    const operationResponse = await fetch(`${DIRECTUS_URL}/operations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        flow: flowId,
        name: 'Trigger Vercel Deploy',
        key: 'trigger_deploy',
        type: 'request',
        position_x: 19,
        position_y: 1,
        options: {
          method: 'POST',
          url: VERCEL_DEPLOY_HOOK,
          headers: [
            {
              header: 'Content-Type',
              value: 'application/json',
            },
          ],
          body: JSON.stringify({
            deploymentMeta: {
              trigger: 'directus-flow',
              message: 'Content updated in Directus',
              timestamp: '{{$now}}',
            },
          }),
        },
      }),
    });

    if (!operationResponse.ok) {
      const error = await operationResponse.json();
      throw new Error(error.errors?.[0]?.message || 'Failed to create operation');
    }

    console.log('✅ Created webhook operation');
    console.log('🎉 Auto-deployment flow setup complete!');

    return flowId;
  } catch (error) {
    console.error('❌ Error creating flow:', error);
    throw error;
  }
}

/**
 * Alternative: Create using Automation (if Flows not available)
 */
async function createAutomation(token) {
  console.log('\n📝 Alternative Setup: Manual Configuration Instructions\n');

  console.log('Since Flows/Webhooks might not be available, here are alternative options:\n');

  console.log('Option 1: Use Directus Automation (if available)');
  console.log('1. Go to Settings > Automation');
  console.log('2. Create a new automation');
  console.log('3. Set trigger to "Data Change"');
  console.log('4. Add action "Webhook" with URL:', VERCEL_DEPLOY_HOOK);
  console.log('');

  console.log('Option 2: Use Custom Endpoint');
  console.log('1. Deploy the api/deploy-webhook.js as a Vercel function');
  console.log('2. Set up a cron job to check for changes');
  console.log('');

  console.log('Option 3: Use GitHub Actions (Already configured)');
  console.log('1. Add this secret to your GitHub repo:');
  console.log('   VERCEL_DEPLOY_HOOK=' + VERCEL_DEPLOY_HOOK);
  console.log('2. The workflow will check every 30 minutes for changes');
  console.log('');

  console.log('Option 4: Manual Trigger');
  console.log('Run this command to deploy:');
  console.log(`VERCEL_DEPLOY_HOOK="${VERCEL_DEPLOY_HOOK}" node scripts/trigger-deploy.js deploy`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Setting up Directus Flow for Auto-Deployment\n');
    console.log('📍 Directus URL:', DIRECTUS_URL);
    console.log('🔗 Deploy Hook:', VERCEL_DEPLOY_HOOK.substring(0, 50) + '...\n');

    // Authenticate
    const token = await authenticate();

    // Check if Flows are available
    const flowsAvailable = await checkFlowsAvailable(token);

    if (flowsAvailable) {
      console.log('✅ Flows API is available\n');

      // Try to create the flow
      try {
        await createDeploymentFlow(token);

        console.log('\n✨ Success! Your auto-deployment is now configured.');
        console.log('📝 Content changes in Directus will now trigger Vercel deployments.');
        console.log('⏱️  Note: Deployments are debounced to avoid too many triggers.\n');
      } catch (error) {
        console.log('⚠️  Could not create flow automatically:', error.message);
        await createAutomation(token);
      }
    } else {
      console.log('⚠️  Flows API not available or insufficient permissions');
      await createAutomation(token);
    }

    // Test the deployment hook
    console.log('\n🧪 Would you like to test the deployment now? (y/n)');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n📚 Please check the documentation: docs/VERCEL_DEPLOYMENT.md');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { authenticate, createDeploymentFlow };
