#!/usr/bin/env node

/**
 * Trigger Vercel Deployment from Directus Production
 *
 * This script triggers a Vercel deployment when content changes
 * in the production Directus at admin.drawday.app
 */

const DIRECTUS_URL = 'https://admin.drawday.app';
const VERCEL_DEPLOY_HOOK =
  process.env.VERCEL_DEPLOY_HOOK ||
  'https://api.vercel.com/v1/integrations/deploy/prj_REvWjwDl5e0h67CimJLOJuxgdVr3/3fGqa1dEXG';

// You can pass these as environment variables or command line args
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'drawday';

/**
 * Trigger a Vercel deployment
 */
async function triggerVercelDeploy(message = 'Content update from Directus') {
  try {
    console.log('🚀 Triggering Vercel deployment...');

    const response = await fetch(VERCEL_DEPLOY_HOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Optional: include metadata about the deployment
        deploymentMeta: {
          message,
          timestamp: new Date().toISOString(),
          source: 'directus-production',
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Deployment triggered successfully!');
      console.log('📦 Job ID:', data.job?.id);
      console.log(
        '🔗 Check deployment at: https://vercel.com/your-team/raffle-spinner/deployments'
      );
      return data;
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to trigger deployment: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Error triggering deployment:', error);
    throw error;
  }
}

/**
 * Authenticate with Directus and get access token
 */
async function authenticateDirectus() {
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
    console.error('❌ Directus authentication error:', error);
    throw error;
  }
}

/**
 * Check if content has been updated recently
 */
async function checkRecentUpdates(token) {
  try {
    // Check various singleton collections for recent updates
    const collections = [
      'homepage',
      'spinner_page',
      'pricing',
      'features',
      'company_info',
      'social_media',
      'footer_links',
    ];

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    for (const collection of collections) {
      try {
        const response = await fetch(`${DIRECTUS_URL}/items/${collection}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data?.date_updated) {
            const updatedDate = new Date(data.data.date_updated);
            if (updatedDate > fiveMinutesAgo) {
              console.log(`📝 Recent update detected in ${collection}`);
              return true;
            }
          }
        }
      } catch (err) {
        // Collection might not exist, continue checking others
        continue;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking updates:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--help' || command === '-h') {
    console.log(`
Usage: node trigger-deploy.js [command] [options]

Commands:
  deploy              Trigger deployment immediately
  check               Check for recent updates and deploy if found
  watch               Watch for changes and auto-deploy (polls every 5 minutes)

Options:
  --message "text"    Custom deployment message

Examples:
  node trigger-deploy.js deploy
  node trigger-deploy.js deploy --message "Updated homepage content"
  node trigger-deploy.js check
  node trigger-deploy.js watch
    `);
    return;
  }

  try {
    if (command === 'check') {
      // Check for recent updates first
      console.log('🔍 Checking for recent content updates...');
      const token = await authenticateDirectus();
      const hasUpdates = await checkRecentUpdates(token);

      if (hasUpdates) {
        console.log('📦 Recent updates found, triggering deployment...');
        await triggerVercelDeploy('Auto-deploy: Recent content updates detected');
      } else {
        console.log('✅ No recent updates found, skipping deployment');
      }
    } else if (command === 'watch') {
      // Watch mode - poll for changes
      console.log('👀 Watching for content changes (checking every 5 minutes)...');
      console.log('Press Ctrl+C to stop\n');

      let lastDeployTime = null;

      const checkAndDeploy = async () => {
        try {
          const token = await authenticateDirectus();
          const hasUpdates = await checkRecentUpdates(token);

          if (hasUpdates) {
            // Only deploy if we haven't deployed in the last 10 minutes
            const now = new Date();
            if (!lastDeployTime || now - lastDeployTime > 10 * 60 * 1000) {
              console.log(`[${now.toLocaleTimeString()}] Deploying due to content changes...`);
              await triggerVercelDeploy('Auto-deploy: Content changes detected');
              lastDeployTime = now;
            } else {
              console.log(
                `[${now.toLocaleTimeString()}] Changes detected but deployment throttled`
              );
            }
          } else {
            console.log(`[${new Date().toLocaleTimeString()}] No changes detected`);
          }
        } catch (error) {
          console.error(`[${new Date().toLocaleTimeString()}] Error:`, error.message);
        }
      };

      // Initial check
      await checkAndDeploy();

      // Set up interval
      setInterval(checkAndDeploy, 5 * 60 * 1000); // Check every 5 minutes
    } else {
      // Default: deploy immediately
      const messageIndex = args.indexOf('--message');
      const message =
        messageIndex !== -1 && args[messageIndex + 1]
          ? args[messageIndex + 1]
          : 'Manual deployment triggered';

      await triggerVercelDeploy(message);
    }
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  triggerVercelDeploy,
  authenticateDirectus,
  checkRecentUpdates,
};
