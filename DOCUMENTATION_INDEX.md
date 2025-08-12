# Raffle Spinner Documentation Index

## Project Overview

The Raffle Winner Spinner is a professional Chrome Extension and marketing website for conducting fair, transparent raffle draws. This index provides a comprehensive guide to all project documentation.

## Core Documentation

### 📋 Requirements Documents

- **[Software Requirements.md](./Software%20Requirements.md)** - Complete SRS for the Chrome Extension (v4.0)
  - Functional requirements (FR-1 through FR-3)
  - Non-functional requirements
  - Testing requirements
- **[Website Requirements.md](./Website%20Requirements.md)** - Marketing website specifications
  - Target audience and goals
  - UK competition industry context
  - Site structure and features

### 🏗️ Architecture Guides

- **[EXTENSION_ARCHITECTURE.md](./EXTENSION_ARCHITECTURE.md)** - Extension codebase structure
  - Three-layer architecture
  - Component organization
  - State management patterns
- **[WEBSITE_ARCHITECTURE.md](./WEBSITE_ARCHITECTURE.md)** - Website implementation guide
  - Next.js App Router structure
  - Server/Client component split
  - SEO and performance optimization

### 🔧 Development Guides

- **[README.md](./README.md)** - Project setup and quick start
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[REFACTORING_PLAN.md](./REFACTORING_PLAN.md)** - Code improvement roadmap
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions

### 🚀 Deployment

- **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** - Vercel deployment guide
- **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - GitHub repository configuration

## Component Reference Map

### Extension Components → SRS Sections

| Component                   | Purpose                      | SRS Reference                      |
| --------------------------- | ---------------------------- | ---------------------------------- |
| `OptionsPage.tsx`           | Main configuration interface | FR-1: Enhanced Options Page        |
| `SidePanel.tsx`             | Live draw interface          | FR-2: Enhanced Side Panel          |
| `CompetitionManagement.tsx` | Competition CRUD             | FR-1.2: Competition Management     |
| `ColumnMapper.tsx`          | CSV column mapping           | FR-1.3: Intelligent CSV Import     |
| `SpinnerCustomization.tsx`  | Visual theming               | FR-1.5: Appearance Customization   |
| `SlotMachineWheel.tsx`      | Spinner animation            | FR-2.2: Slot Machine Style Spinner |
| `useCSVImport.ts`           | CSV processing logic         | FR-1.3, FR-1.4: Data Validation    |

### Website Components → Requirements Sections

| Component          | Purpose           | Requirements Reference        |
| ------------------ | ----------------- | ----------------------------- |
| `HomePage.tsx`     | Main landing page | Section 4: Site Structure     |
| `HeroSection.tsx`  | Hero with CTAs    | Section 4.1: Hero Section     |
| `DemoCarousel.tsx` | Media showcase    | Section 4.6: Demo Gallery     |
| `demo/page.tsx`    | Interactive demo  | Section 4.6: Interactive Demo |

## Code Organization Standards

### File Header Format

All source files must include:

```typescript
/**
 * [Component Name]
 *
 * Purpose: [Description]
 *
 * Document Reference:
 * - [Relevant section from requirements]
 *
 * @module [module-path]
 */
```

### File Size Limits

- Components: Maximum 200 lines
- Hooks: Maximum 150 lines
- Utilities: Maximum 100 lines
- Context Providers: Maximum 150 lines

### Import Order Convention

1. React imports
2. Third-party libraries
3. Monorepo packages
4. Local imports
5. Types
6. Styles

## Monorepo Package Structure

```
packages/
├── storage/          # Chrome storage abstraction
├── csv-parser/       # CSV parsing utilities
├── spinner-physics/  # Animation calculations
├── ui/              # Shared UI components
├── hooks/           # Shared React hooks
├── utils/           # General utilities
├── tailwind-config/ # Shared Tailwind configuration
├── eslint-config/   # Shared ESLint rules
├── prettier-config/ # Shared Prettier config
└── typescript-config/ # Shared TypeScript configs
```

## Testing Documentation

### Test Coverage Requirements

- Utility functions: 100%
- Custom hooks: 80%
- Components: 70%
- Integration flows: Critical paths only

### Test File Naming

- Unit tests: `*.test.ts(x)`
- Integration tests: `*.integration.test.ts(x)`
- E2E tests: `*.e2e.test.ts(x)`

## Performance Benchmarks

### Extension Performance

- Side Panel load: <1 second
- Animation: Consistent 60fps
- Memory usage: <50MB for 5000 entries
- Subset swap: <16ms transition

### Website Performance

- Lighthouse Score: 95+
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle size: <500KB

## Version Control

### Branch Naming

- Features: `feature/description`
- Bugs: `fix/issue-description`
- Refactoring: `refactor/component-name`
- Documentation: `docs/section-name`

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: feat, fix, docs, style, refactor, test, chore

## Deployment Checklist

### Extension Release

- [ ] Update version in manifest.json
- [ ] Run full test suite
- [ ] Build production bundle
- [ ] Test in Chrome
- [ ] Update Chrome Web Store listing
- [ ] Tag release in Git

### Website Deployment

- [ ] Run build locally
- [ ] Check Lighthouse scores
- [ ] Test all interactive features
- [ ] Deploy to Vercel
- [ ] Verify production site
- [ ] Monitor analytics

## Support & Maintenance

### Issue Templates

- Bug Report: Include reproduction steps
- Feature Request: Include use case
- Documentation: Specify unclear sections

### Code Review Checklist

- [ ] Follows architecture patterns
- [ ] Has proper documentation
- [ ] Includes tests
- [ ] No console.log statements
- [ ] Passes linting
- [ ] Under file size limits

## Quick Links

### Development

- [Local Setup](./README.md#installation)
- [Development Workflow](./CONTRIBUTING.md#development-workflow)
- [Testing Guide](./CONTRIBUTING.md#testing)

### Architecture

- [Extension Architecture](./EXTENSION_ARCHITECTURE.md)
- [Website Architecture](./WEBSITE_ARCHITECTURE.md)
- [Monorepo Structure](./README.md#project-structure)

### Requirements

- [Extension Features](./Software%20Requirements.md#30-detailed-functional-requirements)
- [Website Features](./Website%20Requirements.md#4-site-structure-and-features)

---

**Last Updated:** December 2024
**Maintained By:** Development Team
**Version:** 1.0.0
