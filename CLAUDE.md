# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Extension project called "Raffle Winner Spinner" - a client-side browser extension for conducting live raffle draws. The extension operates entirely locally without external network calls.

## Architecture

### Monorepo Structure

- **apps/extension**: Chrome extension application
- **packages/**:
  - `storage`: Chrome storage abstraction layer
  - `csv-parser`: CSV parsing with intelligent column mapping
  - `spinner-physics`: Animation physics calculations
  - `eslint-config`: Shared ESLint configuration
  - `prettier-config`: Shared Prettier configuration
  - `typescript-config`: Shared TypeScript configurations

### Core Components

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

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server for extension
pnpm dev

# Build all packages and extension
pnpm build

# Run specific package in dev mode
pnpm --filter @raffle-spinner/extension dev
```

## Technical Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 (configured via CSS with @theme directive)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Build System**: Vite with @tailwindcss/vite plugin
- **Package Manager**: pnpm with workspaces
- **Storage**: chrome.storage.local API with abstraction layer
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
