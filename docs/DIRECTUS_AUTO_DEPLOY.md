# Setting Up Auto-Deployment from Directus to Vercel

Since Directus webhooks might not be directly available in the UI, here are multiple ways to set up automatic deployments when content changes.

## Prerequisites

1. **Get your Vercel Deploy Hook:**
   - Go to: https://vercel.com/dashboard/project/prj_REvWjwDl5e0h67CimJLOJuxgdVr3
   - Navigate to **Settings** → **Git** → **Deploy Hooks**
   - Create a new deploy hook (name: "Directus Auto Deploy", branch: "main")
   - Copy the complete URL

2. **Set the environment variable:**
   ```bash
   export VERCEL_DEPLOY_HOOK="https://api.vercel.com/v1/integrations/deploy/prj_REvWjwDl5e0h67CimJLOJuxgdVr3/YOUR_HOOK_ID"
   ```

## Method 1: Directus Flows (If Available)

Check if Flows are available in your Directus:

1. Log into https://admin.drawday.app
2. Look for **Settings** → **Flows** or **Automation**

If available, run the setup script:

```bash
node scripts/setup-directus-flow.js YOUR_VERCEL_DEPLOY_HOOK_URL
```

Or manually create a flow:

1. Create new Flow
2. Name: "Auto Deploy to Vercel"
3. Trigger: Event Hook - Items
4. Collections: Select your content collections
5. Add Operation: Request/Webhook
6. URL: Your Vercel deploy hook
7. Method: POST

## Method 2: Custom Directus Extension

If you have access to the Directus server files, you can add a custom hook:

1. The hook is already created at: `backend/extensions/hooks/auto-deploy/index.js`
2. Add your deploy hook to Directus environment variables
3. Restart Directus

## Method 3: Scheduled Script (Recommended if no Directus access)

### Option A: Using Node.js Script

Run the monitoring script that checks for changes and deploys:

```bash
# Check once and deploy if needed
VERCEL_DEPLOY_HOOK="your-hook-url" node scripts/trigger-deploy.js check

# Watch mode - checks every 5 minutes
VERCEL_DEPLOY_HOOK="your-hook-url" node scripts/trigger-deploy.js watch
```

### Option B: Using Shell Script

```bash
# Make the script executable
chmod +x scripts/auto-deploy.sh

# Run once
VERCEL_DEPLOY_HOOK="your-hook-url" ./scripts/auto-deploy.sh once

# Run continuously (checks every 5 minutes)
VERCEL_DEPLOY_HOOK="your-hook-url" ./scripts/auto-deploy.sh
```

### Option C: Set up as a Cron Job

Add to your crontab (`crontab -e`):

```bash
# Check every 5 minutes
*/5 * * * * VERCEL_DEPLOY_HOOK="your-hook-url" /path/to/scripts/trigger-deploy.js check
```

## Method 4: GitHub Actions (Already Configured)

The easiest method if you don't have Directus admin access:

1. Go to your GitHub repository settings
2. Add these secrets:
   - `VERCEL_DEPLOY_HOOK`: Your deploy hook URL
   - `DIRECTUS_ADMIN_EMAIL`: admin@drawday.app
   - `DIRECTUS_ADMIN_PASSWORD`: Your password

3. The workflow at `.github/workflows/deploy-on-content-change.yml` will:
   - Check for updates every 30 minutes
   - Deploy if content has changed
   - Allow manual triggers

4. Trigger manually from GitHub:
   - Go to Actions tab
   - Select "Deploy on Content Change"
   - Click "Run workflow"

## Method 5: Manual Deployment Button

Create a simple deployment dashboard:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Deploy to Vercel</title>
  </head>
  <body>
    <h1>Manual Deployment</h1>
    <button onclick="deploy()">Deploy Now</button>

    <script>
      const DEPLOY_HOOK = 'YOUR_VERCEL_DEPLOY_HOOK';

      async function deploy() {
        try {
          const response = await fetch(DEPLOY_HOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deploymentMeta: {
                trigger: 'manual-button',
                timestamp: new Date().toISOString(),
              },
            }),
          });

          if (response.ok) {
            alert('Deployment triggered successfully!');
          } else {
            alert('Deployment failed');
          }
        } catch (error) {
          alert('Error: ' + error.message);
        }
      }
    </script>
  </body>
</html>
```

## Method 6: API Endpoint (Vercel Function)

Deploy the webhook handler as a Vercel function:

1. The file `api/deploy-webhook.js` is ready
2. Deploy to Vercel
3. Configure Directus to call: `https://drawday.app/api/deploy-webhook`

## Testing Your Setup

### Test the deploy hook directly:

```bash
curl -X POST YOUR_VERCEL_DEPLOY_HOOK_URL
```

### Test with the script:

```bash
VERCEL_DEPLOY_HOOK="your-hook-url" node scripts/trigger-deploy.js deploy
```

### Check deployment status:

- Vercel Dashboard: https://vercel.com/dashboard/project/prj_REvWjwDl5e0h67CimJLOJuxgdVr3
- Look for deployments triggered by "hook"

## Troubleshooting

### "Webhooks not found in Directus"

- Webhooks might be under Settings → Flows
- Or Settings → Automation
- Or might require Directus Cloud/Enterprise

### "Permission denied"

- Ensure you're logged in as admin
- Check if your Directus plan includes webhooks/flows

### "Too many deployments"

- Vercel has rate limits
- Use debouncing (wait 30 seconds between deploys)
- Consider scheduled deployments instead of real-time

### "Deployment not triggering"

1. Verify the deploy hook URL is correct
2. Check Vercel dashboard for failed deployments
3. Test the hook directly with curl
4. Check GitHub Actions logs if using that method

## Best Practices

1. **Don't deploy on every change** - Batch changes together
2. **Use staging branch** - Test on staging before production
3. **Monitor deployments** - Set up notifications in Vercel
4. **Rate limiting** - Max 1 deployment per minute
5. **Selective triggers** - Only deploy for public content changes

## Summary

The simplest approach if you don't have Directus webhook access:

1. Use GitHub Actions (automatic, every 30 minutes)
2. Use the Node.js script in watch mode (manual setup, runs locally)
3. Manual deployment when needed

Choose the method that best fits your workflow and access level.
