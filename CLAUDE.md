# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DrawDay is a professional platform for UK raffle companies, featuring multiple applications with the spinner being one of the core apps. The project uses a monorepo structure with shared packages across applications.

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

## Critical Implementation Notes

1. **CSV Column Mapper**: Must intelligently pre-select column mappings based on common header names
2. **Duplicate Handling**: Check for duplicate ticket numbers during import, allow user to cancel or proceed
3. **Performance Optimization**: Only render visible segments for large participant lists
4. **Winner Calculation**: Pre-calculate final position before animation starts
5. **Data Abstraction**: Keep storage layer abstracted for future backend migration
6. **Package Organization**: DrawDay general components go in @drawday packages, spinner-specific in @raffle-spinner
7. **Backend Exclusion**: The backend/ folder is excluded from linting and prettier