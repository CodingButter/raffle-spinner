# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

DrawDay is a professional platform for UK raffle companies with:

- **Spinner Extension**: Chrome extension for live raffle draws
- **Website**: Marketing site with subscription management
- **Backend**: Directus CMS at admin.drawday.app

## Architecture

### Monorepo Structure

- **apps/**:
  - `spinner-extension`: Chrome extension for live draws (previously apps/extension)
  - `website`: Next.js marketing website and demo platform
- **packages/@drawday/** (Platform-wide packages):
  - `auth`: Authentication system with modular hooks and providers
  - `ui`: Shared UI components library
  - `utils`: Common utility functions
  - `types`: TypeScript type definitions
  - `hooks`: Reusable React hooks
  - `eslint-config`: Shared ESLint configuration
  - `prettier-config`: Shared Prettier configuration
  - `typescript-config`: Shared TypeScript configurations
  - `tailwind-config`: Shared Tailwind CSS configuration

- **packages/** (Spinner-specific packages):
  - `@raffle-spinner/storage`: Chrome storage abstraction layer
  - `@raffle-spinner/csv-parser`: CSV parsing with intelligent column mapping
  - `@raffle-spinner/spinner-physics`: Animation physics calculations
  - `@raffle-spinner/spinners`: Spinner components (SlotMachine, etc.)
  - `@raffle-spinner/contexts`: Spinner-specific React contexts

- **backend/**: Directus CMS for content management (Docker-based)

### Package Naming Convention

- `@drawday/*`: Platform-wide packages used across multiple apps
- `@raffle-spinner/*`: Spinner-specific packages

### Core Components (Spinner Extension)

- **Side Panel**: Primary UI for live draws, displays spinner wheel and winner reveal
- **Options Page**: Configuration interface for managing competitions and settings
- **Three-Layer Architecture**:
  1. Presentation Layer: React components with shadcn/ui, styled with Tailwind CSS v4
  2. Business Logic Layer: Contexts for state management, custom hooks for business logic
  3. Data Layer: Abstracted wrapper around chrome.storage.local API

### Key Features

- CSV-based competition import with customizable column mapping
- Performance-optimized spinner wheel (handles 5000+ participants at 60fps)
- Dynamic rendering for large participant lists (>100 entries)
- Local storage using chrome.storage.local
- Session-based winner tracking
- Modular authentication system ready for multiple apps

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server for spinner extension
pnpm --filter @drawday/spinner-extension dev

# Run website in development
pnpm --filter @drawday/website dev

# Build all packages and apps
pnpm build

# Build specific app
pnpm --filter @drawday/spinner-extension build
pnpm --filter @drawday/website build

# Linting and formatting
pnpm lint
pnpm format
pnpm typecheck

# Backend (Directus CMS)
cd backend
docker-compose up -d

# Vercel CLI (for deployment and environment management)
vercel                  # Deploy to Vercel
vercel env ls           # List environment variables
vercel env add          # Add environment variable
vercel logs             # View deployment logs
```

## Technical Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 (configured via CSS with @theme directive)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Build System**: Vite with @tailwindcss/vite plugin
- **Package Manager**: pnpm with workspaces
- **Storage**: chrome.storage.local API with abstraction layer
- **Backend**: Directus CMS (headless CMS)
- **Performance**: Must maintain 60fps animations, <2 second load times

## Data Structure

### Competition Object

- Name (user-defined)
- Participants array:
  - First Name
  - Last Name
  - Ticket Number (unique)

### Settings

- Minimum Spin Duration (seconds)
- Deceleration Rate (slow/medium/fast)

## Code Quality Standards (MANDATORY)

### File Size Limits

- **MAXIMUM file size**: 200 lines (hard limit: 250 lines)
- **Ideal file size**: 50-150 lines
- **Files exceeding 200 lines MUST be refactored immediately**
- **NO EXCEPTIONS** - Large files are technical debt

### Component Organization Rules

1. **Single Responsibility**: Each file should have ONE clear purpose
2. **Component Extraction**: Break large components into:
   - Parent component (orchestration, <100 lines)
   - Sub-components (specific UI sections, <80 lines)
   - Utility functions (separate files, <50 lines each)
   - Custom hooks (separate files, <100 lines)
   - Types/interfaces (separate files)

3. **Folder Structure for Complex Features**:
   ```
   feature/
   ├── index.tsx           (main export, <50 lines)
   ├── FeatureName.tsx     (main component, <150 lines)
   ├── components/         (sub-components, <100 lines each)
   │   ├── Header.tsx
   │   ├── Content.tsx
   │   └── Footer.tsx
   ├── hooks/             (custom hooks, <100 lines each)
   │   └── useFeature.ts
   ├── utils/             (utility functions)
   │   └── helpers.ts
   └── types.ts           (TypeScript types)
   ```

### DRY (Don't Repeat Yourself) Principles

1. **Shared Components**: Any component used in 2+ places goes in `@drawday/ui`
2. **Shared Hooks**: Reusable hooks go in `@drawday/hooks`
3. **Shared Utils**: Common utilities go in `@drawday/utils`
4. **No Duplication**: If you're copying code, extract it to a shared location
5. **Composition over Repetition**: Use component composition to avoid duplication

### Refactoring Requirements

When encountering large files:

1. **STOP IMMEDIATELY** and refactor before any other work
2. **Extract logical sections** into separate components
3. **Create sub-components** for repeated UI patterns
4. **Move business logic** to custom hooks
5. **Extract constants and types** to separate files
6. **Split complex functions** into smaller, testable units

### Current Large Files Requiring Refactoring

- `apps/website/app/dashboard/page.tsx` (996 lines) - NEEDS IMMEDIATE REFACTORING
- `packages/spinners/src/slot-machine/SlotMachineWheel.tsx` (551 lines)
- `apps/website/lib/directus.ts` (519 lines)
- `apps/spinner-extension/src/components/options/SpinnerCustomization.tsx` (453 lines)
- Any file over 200 lines must be added to this list and refactored

## Critical Implementation Notes

1. **CSV Column Mapper**: Must intelligently pre-select column mappings based on common header names
2. **Duplicate Handling**: Check for duplicate ticket numbers during import, allow user to cancel or proceed
3. **Performance Optimization**: Only render visible segments for large participant lists
4. **Winner Calculation**: Pre-calculate final position before animation starts
5. **Data Abstraction**: Keep storage layer abstracted for future backend migration
6. **Package Organization**: DrawDay general components go in @drawday packages, spinner-specific in @raffle-spinner
7. **Backend Exclusion**: The backend/ folder is excluded from linting and prettier

## Quick Reference

### Key Guides

- **Stripe Setup**: `/docs/guides/STRIPE_SETUP_GUIDE.md`
- **Subscription System**: `/docs/guides/SUBSCRIPTION_SYSTEM.md`

### Environment Variables

See `/apps/website/.env.local.example` for required variables

### Current Tasks

- [ ] Create Stripe products and add Price IDs
- [ ] Configure production webhook
- [ ] Test complete subscription flow
