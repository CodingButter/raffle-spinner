#!/usr/bin/env node

/**
 * Setup webhooks for triggering Vercel rebuilds
 * This will trigger a rebuild when content changes
 */

const axios = require('axios');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'drawday';
const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK || '';

let accessToken = null;

// Authenticate with Directus
async function authenticate() {
  try {
    const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    accessToken = response.data.data.access_token;
    console.log('✅ Authenticated with Directus');
    return accessToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Create webhook
async function createWebhook(webhook) {
  try {
    await axios.post(
      `${DIRECTUS_URL}/flows`,
      webhook,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`✅ Created webhook: ${webhook.name}`);
    return webhook;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`⚠️  Webhook already exists: ${webhook.name}`);
    } else {
      console.error(`❌ Failed to create webhook:`, error.response?.data || error.message);
    }
    return null;
  }
}

// Create operations for a flow
async function createOperation(flowId, operation) {
  try {
    const response = await axios.post(
      `${DIRECTUS_URL}/operations`,
      {
        ...operation,
        flow: flowId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`  ✅ Created operation: ${operation.name}`);
    return response.data.data;
  } catch (error) {
    console.error(`  ❌ Failed to create operation:`, error.response?.data || error.message);
    return null;
  }
}

async function setupWebhooks() {
  await authenticate();

  if (!VERCEL_DEPLOY_HOOK) {
    console.log('\n⚠️  VERCEL_DEPLOY_HOOK not set in environment variables');
    console.log('To enable automatic rebuilds:');
    console.log('1. Go to your Vercel project settings');
    console.log('2. Navigate to Git > Deploy Hooks');
    console.log('3. Create a new deploy hook');
    console.log('4. Add the URL to backend/.env as VERCEL_DEPLOY_HOOK');
    console.log('5. Run this script again\n');
    
    console.log('Setting up webhook flow without Vercel URL (you can update it later)...\n');
  }

  console.log('\n🪝 Setting up webhooks...');

  // Create flow for content changes
  const contentFlow = await createWebhook({
    name: 'Trigger Vercel Rebuild on Content Change',
    icon: 'webhook',
    color: '#000000',
    description: 'Triggers a Vercel rebuild when website content is updated',
    status: VERCEL_DEPLOY_HOOK ? 'active' : 'inactive',
    accountability: 'all',
    trigger: 'event',
    options: {
      type: 'action',
      scope: [
        'items.homepage.update',
        'items.features_page.update',
        'items.demo_page.update',
        'items.site_settings.update',
        'items.terms_of_service.create',
        'items.terms_of_service.update',
        'items.privacy_policy.create',
        'items.privacy_policy.update',
      ],
    },
  });

  if (contentFlow) {
    // Create webhook operation
    await createOperation(contentFlow.id, {
      name: 'Call Vercel Deploy Hook',
      key: 'webhook',
      type: 'request',
      position_x: 20,
      position_y: 20,
      options: {
        method: 'POST',
        url: VERCEL_DEPLOY_HOOK || 'https://api.vercel.com/v1/integrations/deploy/YOUR_DEPLOY_HOOK',
        headers: [
          {
            header: 'Content-Type',
            value: 'application/json',
          },
        ],
        body: JSON.stringify({
          triggered_by: 'directus_content_update',
          collection: '{{$trigger.collection}}',
          updated_at: '{{$trigger.timestamp}}',
        }),
      },
    });
  }

  console.log('\n✅ Webhook setup completed!');
  
  if (!VERCEL_DEPLOY_HOOK) {
    console.log('\n📝 Next Steps:');
    console.log('1. Get your Vercel deploy hook URL');
    console.log('2. Add it to backend/.env as VERCEL_DEPLOY_HOOK=<your-url>');
    console.log('3. Go to Directus Admin > Settings > Flows');
    console.log('4. Edit "Trigger Vercel Rebuild on Content Change"');
    console.log('5. Update the webhook URL and activate the flow');
  } else {
    console.log('\n✅ Vercel webhook is configured and active!');
    console.log('Content changes will now trigger automatic rebuilds.');
  }
}

// Run the setup
setupWebhooks().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});