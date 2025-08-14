# Project Cleanup Log

## Date: December 2024

### Files Removed

#### Build Artifacts & Archives

- `backend.zip` - Unnecessary backup archive
- `apps/extension/drawday-spinner-extension.zip` - Old extension build
- `apps/extension/DrawDaySpinner/` - Build output folder (gitignored)

#### Redundant Scripts

- `scripts/get-docker.sh` - Duplicate Docker installation script
- `scripts/install_docker.sh` - Duplicate Docker installation script
- `scripts/setup-husky.sh` - Husky already configured
- `apps/website/scripts/compress-video.*` - Unused video compression scripts
- `apps/website/scripts/optimize-video-instructions.md` - Unused documentation

#### Unused Components

- `apps/website/components/HomePage.tsx` - Replaced by DrawDayHomePageServer
- `apps/website/components/DrawDayHomePage.tsx` - Replaced by server component

#### Unused Pages & Routes

- `apps/website/app/dashboard/` - Not using client-side auth
- `apps/website/app/login/` - Using Directus admin instead
- `apps/website/app/signup/` - Using Directus for user management
- `apps/website/app/api/` - All API routes (using Directus API)
- `apps/website/lib/api/` - Unused API client code
- `apps/website/public/data/` - Static JSON data (moved to Directus)

#### Unused Packages

- `packages/auth/` - Authentication handled by Directus

### Backend Consolidation

Created `backend/setup-all.js` to consolidate all setup scripts into one master script.

Updated `backend/package.json` scripts:

- Simplified to use master setup script
- Added production-specific commands
- Added backup commands

### Remaining Individual Scripts (kept for flexibility)

- All individual backend setup scripts retained for debugging
- Can be run individually if needed
- Master script runs them all in correct order

### Result

- Removed ~20 unnecessary files
- Consolidated backend setup process
- Cleaned up unused authentication code
- Removed static data files (now in Directus)
- Simplified project structure

### Next Steps

- All core functionality preserved
- Project is cleaner and more maintainable
- Backend setup is now a single command: `npm run setup`
