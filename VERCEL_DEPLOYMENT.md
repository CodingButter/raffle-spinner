# Vercel Deployment Guide for DrawDay

## Prerequisites

1. Backend deployed at `https://admin.drawday.app`
2. Vercel account with project created
3. GitHub repository connected to Vercel

## Step 1: Set Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables

### Required Variables

Add these for **Production** environment:

```env
NEXT_PUBLIC_DIRECTUS_URL=https://admin.drawday.app
NEXT_PUBLIC_SITE_URL=https://drawday.app
NODE_ENV=production
```

### Optional Variables

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Google Analytics
```

## Step 2: Create Deploy Hook for CMS Updates

1. In Vercel dashboard, go to Settings → Git → Deploy Hooks
2. Create a new hook:
   - **Name**: `Directus Content Update`
   - **Branch**: `main`
3. Copy the webhook URL (looks like: `https://api.vercel.com/v1/integrations/deploy/prj_XXX/XXX`)

## Step 3: Configure Backend Webhook

Add the deploy hook to your backend:

1. Add to `backend/.env`:

   ```env
   VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_XXX/XXX
   ```

2. Run the webhook setup:

   ```bash
   cd backend
   npm run setup:webhooks
   ```

   Or if using the master setup:

   ```bash
   npm run setup
   ```

## Step 4: Verify CORS Configuration

Ensure your Directus backend allows requests from your domains.

In `backend/.env` or `backend/.env.production`:

```env
CORS_ORIGIN=https://drawday.app,https://www.drawday.app,chrome-extension://*
```

## Step 5: Deploy

### Automatic Deployment (Recommended)

Push to your main branch:

```bash
git push origin main
```

Vercel will automatically build and deploy.

### Manual Deployment

In Vercel dashboard, click "Redeploy" → "Redeploy with existing Build Cache"

## Step 6: Verify Deployment

After deployment completes:

1. **Check the website**: https://drawday.app
   - Homepage should show content from CMS
   - Footer should display company info and social links

2. **Test API access** (in browser console):

   ```javascript
   fetch('https://admin.drawday.app/items/homepage')
     .then((r) => r.json())
     .then(console.log);
   ```

3. **Test CMS webhook**:
   - Login to https://admin.drawday.app
   - Edit homepage content
   - Save changes
   - Check Vercel dashboard for new deployment triggered

## Build Settings in Vercel

Vercel should auto-detect Next.js, but verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` or `pnpm build`
- **Output Directory**: `.next` (automatic)
- **Install Command**: `pnpm install` (if using pnpm)
- **Root Directory**: `apps/website` (if monorepo)

## Troubleshooting

### Build Fails

1. Check build logs for missing environment variables
2. Ensure all `NEXT_PUBLIC_` variables are set
3. Verify Node.js version matches local development

### API Requests Fail

1. Check browser console for CORS errors
2. Verify `https://admin.drawday.app` is accessible
3. Check Directus public permissions:
   ```bash
   cd backend
   npm run fix:permissions
   ```

### Content Not Updating

1. Verify webhook is configured:
   - Check Directus admin → Settings → Webhooks
   - Should see "Content Update" webhook

2. Test webhook manually:

   ```bash
   curl -X POST YOUR_VERCEL_DEPLOY_HOOK_URL
   ```

3. Check Vercel deployment logs

### Environment Variables Not Working

- Remember: After adding/changing env vars in Vercel, you must trigger a new deployment
- Variables are baked into the build at compile time
- Use `NEXT_PUBLIC_` prefix for client-side variables

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Deploy hook created in Vercel
- [ ] Webhook configured in Directus
- [ ] CORS configured for production domains
- [ ] Public permissions set in Directus
- [ ] SSL certificates valid for admin.drawday.app
- [ ] DNS configured correctly
- [ ] Content populated in CMS
- [ ] Test deployment successful

## Monitoring

### Vercel Dashboard

Monitor:

- Build times
- Deployment status
- Function logs
- Analytics (if enabled)

### Directus Admin

Monitor:

- Webhook execution logs
- API request logs
- Content changes

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Directus Docs**: https://docs.directus.io
- **Project Repo**: https://github.com/CodingButter/raffle-spinner
