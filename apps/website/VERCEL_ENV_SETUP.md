# Vercel Environment Variables Setup

## Required Environment Variables for Production

These environment variables must be set in your Vercel project dashboard for the build to work correctly.

### 1. Go to Vercel Dashboard

Navigate to: `Your Project → Settings → Environment Variables`

### 2. Add the Following Variables

| Variable Name              | Value                       | Environment |
| -------------------------- | --------------------------- | ----------- |
| `NEXT_PUBLIC_DIRECTUS_URL` | `https://admin.drawday.app` | Production  |
| `NEXT_PUBLIC_SITE_URL`     | `https://drawday.app`       | Production  |
| `NODE_ENV`                 | `production`                | Production  |

### Optional Variables (if needed)

| Variable Name                   | Value                     | Environment                            |
| ------------------------------- | ------------------------- | -------------------------------------- |
| `BACKEND_API_URL`               | `https://api.drawday.app` | Production (if using separate API)     |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX`            | Production (if using Google Analytics) |

### 3. Important Notes

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- These variables are baked into the build at compile time
- After adding/changing variables, you need to trigger a new deployment

### 4. Verify Environment Variables

After deployment, you can verify the variables are working by:

1. Check the build logs in Vercel
2. Visit your site and open browser console
3. Check network requests to ensure they're going to `https://admin.drawday.app`

### 5. For Development/Preview Environments

If you want different values for preview deployments:

| Variable Name              | Value                   | Environment |
| -------------------------- | ----------------------- | ----------- |
| `NEXT_PUBLIC_DIRECTUS_URL` | `http://localhost:8055` | Development |
| `NEXT_PUBLIC_SITE_URL`     | `http://localhost:3000` | Development |

### Build Command

Vercel should automatically detect Next.js and use:

```bash
npm run build
```

### Troubleshooting

If the build fails:

1. Check build logs for missing environment variables
2. Ensure all `NEXT_PUBLIC_` variables are set
3. Verify the Directus backend is accessible at `https://admin.drawday.app`
4. Check that CORS is configured correctly in Directus to allow `https://drawday.app`

### Testing Locally with Production Variables

To test with production variables locally:

```bash
# Create .env.local with production values
cp .env.production .env.local

# Run the build
npm run build

# Start production server
npm run start
```

### API Routes That Need Backend Access

The frontend fetches content from these Directus endpoints:

- `https://admin.drawday.app/items/homepage`
- `https://admin.drawday.app/items/features_page`
- `https://admin.drawday.app/items/demo_page`
- `https://admin.drawday.app/items/site_settings`
- `https://admin.drawday.app/items/company_info`
- `https://admin.drawday.app/items/social_media`
- `https://admin.drawday.app/items/careers`
- `https://admin.drawday.app/items/team_members`

Make sure these are publicly accessible (which they should be based on our permissions setup).
