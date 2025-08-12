# Extension Architecture & Implementation Guide

## Document Version

- **Version:** 1.0
- **Date:** December 2024
- **Status:** Production Implementation

## Overview

This document provides a comprehensive guide to the Raffle Winner Spinner Chrome Extension architecture, code organization, and implementation details. It serves as the primary reference for understanding the codebase structure and maintaining coding standards.

## Architecture Overview

### Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  React Components + Tailwind CSS v4     │
│         shadcn/ui Components            │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│        Business Logic Layer             │
│    React Contexts + Custom Hooks        │
│      Animation Physics Engine           │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│           Data Layer                    │
│    Chrome Storage API Wrapper           │
│       Local State Management            │
└─────────────────────────────────────────┘
```

## Directory Structure

```
apps/extension/
├── src/
│   ├── pages/                 # Main entry points
│   │   ├── OptionsPage.tsx    # FR-1: Options Page
│   │   └── SidePanel.tsx      # FR-2: Side Panel
│   ├── components/
│   │   ├── options/           # Options page components
│   │   │   ├── CompetitionManagementContent.tsx  # FR-1.2
│   │   │   ├── SpinnerSettings.tsx              # FR-1.6
│   │   │   ├── SpinnerCustomization.tsx         # FR-1.5
│   │   │   ├── ThemeColors.tsx                  # FR-1.5
│   │   │   ├── BrandingSettings.tsx             # FR-1.5
│   │   │   ├── ColumnMapper.tsx                 # FR-1.3
│   │   │   ├── DuplicateHandler.tsx             # FR-1.4
│   │   │   └── SavedMappingsManager.tsx         # FR-1.3
│   │   ├── sidepanel/         # Side panel components
│   │   │   └── SessionWinners.tsx               # FR-2.4
│   │   └── ui/                # Shared UI components
│   ├── contexts/              # State management
│   │   ├── CompetitionContext.tsx               # Competition state
│   │   ├── SettingsContext.tsx                  # Global settings
│   │   ├── ThemeContext.tsx                     # Theme state
│   │   └── CollapsibleStateContext.tsx          # UI state
│   ├── hooks/                 # Business logic
│   │   ├── useCSVImport.ts                      # CSV processing
│   │   └── useColumnDetection.ts                # Smart mapping
│   ├── lib/                   # Utilities
│   │   ├── csv-parser.ts                        # CSV parsing
│   │   ├── utils.ts                             # General utilities
│   │   └── help-content.ts                      # Help system
│   └── background.js          # Service worker
├── public/
│   ├── manifest.json          # Extension manifest
│   └── icons/                 # Extension icons
└── dist/                      # Build output
```

## Component Documentation Standards

### File Header Template

Every TypeScript/JavaScript file must include:

```typescript
/**
 * [Component/Module Name]
 *
 * Purpose: [Brief description of what this component/module does]
 *
 * SRS Reference:
 * - [Reference to Software Requirements.md section]
 *
 * @module [module-name]
 */
```

### Example Implementation

```typescript
/**
 * Competition Management Content Component
 *
 * Purpose: Manages competition list, CSV upload, and column mapping
 * in a collapsible card-less layout for the options page.
 *
 * SRS Reference:
 * - FR-1.2: Advanced Competition Management
 * - FR-1.3: Intelligent CSV Import System
 *
 * @module options/competition-management
 */
```

## Code Organization Principles

### 1. Single Responsibility

Each file should have one clear purpose. If a file exceeds 200 lines, consider splitting it.

**Good Example:**

- `ColumnMapper.tsx` - Only handles column mapping UI
- `DuplicateHandler.tsx` - Only handles duplicate resolution

**Bad Example:**

- A single file handling CSV import, mapping, validation, and display

### 2. Context Separation

Contexts should be focused and not overlap:

```typescript
// ✅ Good - Focused contexts
CompetitionContext - Competition CRUD operations
SettingsContext - Global app settings
ThemeContext - Visual theming

// ❌ Bad - Mixed concerns
AppContext - Everything in one context
```

### 3. Hook Extraction

Business logic should be in custom hooks:

```typescript
// ✅ Good
function CompetitionList() {
  const { competitions, deleteCompetition } = useCompetitions();
  // Simple rendering logic
}

// ❌ Bad
function CompetitionList() {
  const [competitions, setCompetitions] = useState([]);
  // 100+ lines of business logic mixed with rendering
}
```

## State Management Patterns

### Context Provider Pattern

```typescript
// Context definition
interface CompetitionContextType {
  competitions: Competition[];
  selectedCompetition: Competition | null;
  addCompetition: (competition: Competition) => Promise<void>;
  selectCompetition: (id: string) => void;
}

// Provider implementation
export function CompetitionProvider({ children }: PropsWithChildren) {
  // State and logic implementation
  return (
    <CompetitionContext.Provider value={contextValue}>
      {children}
    </CompetitionContext.Provider>
  );
}

// Consumer hook
export function useCompetitions() {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('useCompetitions must be used within CompetitionProvider');
  }
  return context;
}
```

## Performance Optimization

### 1. Subset Swapping (FR-2.3)

For handling large participant lists efficiently:

```typescript
// Initial render: Show first 100 entries
const initialSubset = participants.slice(0, 100);

// During spin: Swap to winner's subset at max velocity
const winnerSubset = createWinnerSubset(targetTicket);

// Seamless transition without visible lag
```

### 2. Canvas Rendering

Slot machine uses canvas for 60fps performance:

```typescript
// Optimized rendering loop
const animate = (currentTime: number) => {
  // Calculate position
  // Draw only visible segments
  // Request next frame
  requestAnimationFrame(animate);
};
```

## Testing Requirements

### Unit Test Coverage

- Utility functions: 100%
- Custom hooks: 80%
- Context providers: 70%

### Integration Tests

- CSV import flow
- Competition CRUD operations
- Winner selection accuracy

## Build & Deployment

### Development

```bash
pnpm --filter @raffle-spinner/extension dev
```

### Production Build

```bash
pnpm --filter @raffle-spinner/extension build
# Output: raffle-spinner-extension.zip
```

### Chrome Web Store Deployment

1. Build production bundle
2. Test in Chrome developer mode
3. Upload to Chrome Web Store dashboard
4. Submit for review

## Code Quality Standards

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### ESLint Rules

- No console.log in production
- Consistent naming conventions
- Proper React hooks dependencies
- No unused variables

### Formatting

- Prettier with 2-space indentation
- Single quotes for strings
- Trailing commas in multi-line
- Semicolons required

## Security Considerations

### Data Privacy

- No external API calls
- All data stored locally
- No analytics or tracking
- Secure CSV handling

### Chrome Storage

```typescript
// Always use the abstracted wrapper
import { chromeStorage } from "@raffle-spinner/storage";

// Never access chrome.storage directly
await chromeStorage.set("key", value);
const data = await chromeStorage.get("key");
```

## Maintenance Guidelines

### Adding New Features

1. Update Software Requirements.md
2. Create feature branch
3. Implement with proper documentation
4. Add tests
5. Update this architecture document
6. Submit PR with description

### Bug Fixes

1. Create issue with reproduction steps
2. Add regression test
3. Fix with minimal changes
4. Update patch version

### Refactoring

1. Document current behavior
2. Write tests for current behavior
3. Refactor incrementally
4. Ensure tests still pass
5. Update documentation

## Common Patterns

### Modal Management

```typescript
const [showModal, setShowModal] = useState(false);
const handleOpen = () => setShowModal(true);
const handleClose = () => setShowModal(false);
```

### Form Validation

```typescript
const validateForm = () => {
  const errors: ValidationErrors = {};
  if (!name) errors.name = "Required";
  if (!isValidEmail(email)) errors.email = "Invalid email";
  return errors;
};
```

### Error Handling

```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error("Operation failed:", error);
  setError("User-friendly error message");
}
```

## Future Considerations

### Planned Improvements

- WebAssembly for performance
- Web Workers for CSV processing
- IndexedDB for large datasets
- Service Worker caching

### Technical Debt

- Migrate class components to functional
- Replace any remaining JavaScript with TypeScript
- Improve test coverage to 90%+
- Add E2E tests with Playwright

---

**Related Documents:**

- Software Requirements.md - Functional requirements
- CONTRIBUTING.md - Contribution guidelines
- README.md - Project overview
