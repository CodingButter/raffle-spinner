# Deploying to Vercel

This monorepo is fully configured for Vercel deployment. The website app uses shared packages from the monorepo without any issues.

## Quick Deploy

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# From the repository root
vercel

# When prompted:
# - Set up and deploy: Y
# - Which scope: [Your account]
# - Link to existing project: N
# - Project name: raffle-spinner
# - Directory: apps/website
# - Override settings: N
```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure with these settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/website`
   - **Build Command**: `cd ../.. && pnpm --filter @raffle-spinner/website build`
   - **Install Command**: `pnpm install --frozen-lockfile`
   - **Output Directory**: `.next`

## Configuration Files

### `apps/website/vercel.json`

Already configured with:

- Proper monorepo build commands
- pnpm workspace support
- Next.js framework settings

### `.vercelignore`

Excludes unnecessary files:

- Extension app
- Source files from packages
- Test files
- Documentation

## Environment Variables

No environment variables are required for the basic deployment. The website runs entirely client-side.

## Monorepo Package Support

Vercel automatically handles:

- ✅ pnpm workspaces
- ✅ `workspace:*` protocol in package.json
- ✅ Shared packages (`@raffle-spinner/*`)
- ✅ Tailwind CSS v4 with shared config
- ✅ TypeScript path aliases
- ✅ Shared UI components

## Build Performance

The build includes:

- All shared packages from the monorepo
- Slot machine spinner component
- Tailwind CSS with custom theme
- Static generation for optimal performance

## Post-Deployment

After deployment:

1. Your site will be available at `https://[project-name].vercel.app`
2. Configure a custom domain in Vercel dashboard if needed
3. Monitor build times and performance metrics

## Troubleshooting

### If build fails:

1. Ensure all packages build locally: `pnpm build`
2. Check Node version (requires 18+)
3. Verify pnpm version matches locally

### Common issues:

- **Module not found**: Run `pnpm install` locally and commit `pnpm-lock.yaml`
- **Build timeout**: Normal build time is ~30-60 seconds
- **Type errors**: Run `pnpm --filter @raffle-spinner/website build` locally first

## Local Testing

Test the Vercel build locally:

```bash
# From repository root
pnpm --filter @raffle-spinner/website build
pnpm --filter @raffle-spinner/website start
```

## Automatic Deployments

Once connected to GitHub:

- **Production**: Deploys on push to `main` branch
- **Preview**: Deploys on pull requests
- **Rollback**: Available via Vercel dashboard
