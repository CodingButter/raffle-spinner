# Vercel Deployment Integration

This document explains how to trigger Vercel deployments when content changes in Directus (admin.drawday.app).

## Quick Start

### First: Get Your Deploy Hook from Vercel

1. Go to your Vercel project: https://vercel.com/dashboard/project/prj_REvWjwDl5e0h67CimJLOJuxgdVr3
2. Navigate to **Settings** → **Git** → **Deploy Hooks**
3. Create a new deploy hook:
   - Name: `Directus Content Update`
   - Branch: `main` (or your production branch)
4. Copy the complete webhook URL (it will look like):
   ```
   https://api.vercel.com/v1/integrations/deploy/prj_REvWjwDl5e0h67CimJLOJuxgdVr3/[UNIQUE_HOOK_ID]
   ```
5. Update the `VERCEL_DEPLOY_HOOK` in your environment variables

### Method 1: Direct Deploy Hook (Simplest)

Trigger a deployment immediately:

```bash
# From the project root
node scripts/trigger-deploy.js deploy
```

### Method 2: Check for Updates and Deploy

Check if content has been updated in the last 5 minutes and deploy if needed:

```bash
node scripts/trigger-deploy.js check
```

### Method 3: Watch Mode (Continuous Monitoring)

Monitor for changes every 5 minutes and auto-deploy:

```bash
node scripts/trigger-deploy.js watch
```

## Setting Up Automatic Deployments

### Option 1: Directus Webhooks (Recommended)

1. **Log into Directus** at https://admin.drawday.app

2. **Go to Settings > Webhooks**

3. **Create a new webhook:**
   - Name: `Deploy to Vercel`
   - Method: `POST`
   - URL: Your deploy hook URL
   - Status: `Active`
   - Collections: Select which collections should trigger deploys
     - homepage
     - spinner_page
     - pricing
     - features
     - company_info
     - etc.
   - Actions: Choose when to trigger
     - ✅ Create
     - ✅ Update
     - ✅ Delete

4. **Add Headers (optional):**

   ```
   Content-Type: application/json
   ```

5. **Set Request Body:**
   ```json
   {
     "deploymentMeta": {
       "trigger": "directus-webhook",
       "collection": "{{$trigger.collection}}",
       "event": "{{$trigger.event}}",
       "timestamp": "{{$trigger.timestamp}}"
     }
   }
   ```

### Option 2: Directus Flows

1. **Go to Settings > Flows** in Directus

2. **Create a new Flow:**
   - Name: `Auto Deploy on Content Change`
   - Status: `Active`
   - Trigger: `Event Hook - Items`

3. **Configure the trigger:**
   - Type: `Action (Non-Blocking)`
   - Scope:
     - ✅ Create
     - ✅ Update
     - ✅ Delete
   - Collections: Select your content collections

4. **Add a Webhook operation:**
   - Method: `POST`
   - URL: Your deploy hook
   - Request Body:
   ```json
   {
     "deploymentMeta": {
       "message": "Content updated in {{$trigger.payload.collection}}"
     }
   }
   ```

### Option 3: GitHub Actions (Scheduled)

The GitHub Action is already configured to:

- Check for updates every 30 minutes
- Allow manual deployments
- Support webhook triggers

To enable:

1. **Add secrets to your GitHub repository:**
   - Go to Settings > Secrets and variables > Actions
   - Add:
     - `VERCEL_DEPLOY_HOOK`: Your deploy hook URL
     - `DIRECTUS_ADMIN_EMAIL`: admin@drawday.app
     - `DIRECTUS_ADMIN_PASSWORD`: Your password

2. **The workflow will automatically:**
   - Run every 30 minutes
   - Check for content updates
   - Deploy if changes are found

### Option 4: Custom API Endpoint

Deploy the webhook handler as a Vercel function:

1. The file `api/deploy-webhook.js` is ready to deploy
2. It will be available at: `https://drawday.app/api/deploy-webhook`
3. Configure Directus to call this endpoint

## Manual Deployment Options

### Using cURL

```bash
# Replace [DEPLOY_HOOK_ID] with your actual hook ID from Vercel
curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_REvWjwDl5e0h67CimJLOJuxgdVr3/[DEPLOY_HOOK_ID]
```

### Using the Script

```bash
# Deploy with custom message
node scripts/trigger-deploy.js deploy --message "Updated homepage content"

# Check and deploy if needed
node scripts/trigger-deploy.js check

# Watch mode
node scripts/trigger-deploy.js watch
```

### From Directus Admin Panel

You could create a custom button in Directus:

1. Add a custom panel/widget
2. Include a "Deploy" button
3. Call the deploy hook when clicked

## Monitoring Deployments

### Vercel Dashboard

Check deployment status at:

- https://vercel.com/your-team/raffle-spinner/deployments

### Deployment Notifications

Vercel can send notifications via:

- Email
- Slack
- Discord
- Webhooks

Configure in Vercel project settings.

## Best Practices

1. **Debounce Deployments**
   - Don't deploy on every single change
   - Batch changes together (wait 30 seconds to 5 minutes)

2. **Selective Deployment**
   - Only deploy when public-facing content changes
   - Skip deployment for draft content

3. **Environment-Specific**
   - Different deploy hooks for staging vs production
   - Test content changes in staging first

4. **Rate Limiting**
   - Vercel has rate limits on deployments
   - Avoid triggering more than once per minute

5. **Monitoring**
   - Set up alerts for failed deployments
   - Track deployment frequency
   - Monitor build times

## Troubleshooting

### Deployment Not Triggering

1. Check the deploy hook URL is correct
2. Verify Directus webhook is active
3. Check Vercel dashboard for errors
4. Review GitHub Actions logs

### Too Many Deployments

1. Increase debounce delay
2. Be more selective about which collections trigger deploys
3. Use scheduled deployments instead of real-time

### Authentication Issues

1. Verify Directus credentials
2. Check API access permissions
3. Ensure webhook secrets match

## Security Considerations

1. **Keep deploy hook private**
   - Don't commit it to public repos
   - Use environment variables

2. **Add webhook authentication**
   - Use a secret token
   - Verify requests are from Directus

3. **Limit deployment triggers**
   - Only admin users
   - Specific collections only
   - Rate limiting

## Support

- Vercel Docs: https://vercel.com/docs
- Directus Webhooks: https://docs.directus.io/configuration/webhooks/
- Directus Flows: https://docs.directus.io/configuration/flows/
