# Contributing to Raffle Winner Spinner

Thank you for your interest in contributing to the Raffle Winner Spinner Chrome Extension! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels and backgrounds.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Chrome browser for testing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spinner
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up git hooks (for automatic code quality checks):
```bash
./scripts/setup-husky.sh
```

## Project Structure

This is a monorepo organized as follows:

```
spinner/
├── apps/
│   └── extension/        # Chrome extension application
├── packages/
│   ├── csv-parser/       # CSV parsing utilities
│   ├── spinner-physics/  # Spinner wheel physics engine
│   ├── storage/          # Storage abstraction layer
│   ├── eslint-config/    # Shared ESLint configuration
│   ├── prettier-config/  # Shared Prettier configuration
│   └── typescript-config/# Shared TypeScript configuration
└── scripts/              # Build and utility scripts
```

## Development Workflow

### Running the Development Server

```bash
pnpm dev
```

This starts the development server with hot module replacement for all packages.

### Building the Project

```bash
pnpm build
```

This builds all packages and creates the Chrome extension ZIP file.

### Code Quality Commands

```bash
# Run linting
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check

# Type checking
pnpm typecheck

# Run all quality checks
pnpm quality
```

## Code Standards

### General Guidelines

1. **TypeScript**: All code must be written in TypeScript with proper type annotations
2. **Comments**: Each file must include a header comment explaining its purpose and which SRS requirements it implements
3. **File Size**: Keep files focused and under 400 lines when possible
4. **Component Structure**: Use small, focused components with clear separation of concerns
5. **No Console Logs**: Remove all console.log statements before committing
6. **No Commented Code**: Remove commented-out code before committing

### Code Style

We use ESLint and Prettier to maintain consistent code style:

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Trailing Commas**: ES5 style
- **Line Length**: 80 characters for code, 100 for comments

### TypeScript Guidelines

- Use explicit return types for functions
- Avoid `any` type - use `unknown` or proper types instead
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Prefer `const` assertions where appropriate

### React Guidelines

- Use functional components with hooks
- Keep components pure when possible
- Use proper prop types with TypeScript interfaces
- Separate business logic into custom hooks
- Use React.memo for expensive components

### Testing Guidelines

- Write tests for new features
- Maintain existing test coverage
- Test edge cases and error conditions
- Use descriptive test names

## Submitting Changes

### Pre-submission Checklist

Before submitting your changes:

1. ✅ All code follows the style guidelines
2. ✅ No linting errors or warnings (`pnpm lint`)
3. ✅ Code is properly formatted (`pnpm format`)
4. ✅ TypeScript compilation succeeds (`pnpm typecheck`)
5. ✅ Build completes successfully (`pnpm build`)
6. ✅ All tests pass (when applicable)
7. ✅ Documentation is updated if needed
8. ✅ File headers reference relevant SRS requirements

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the guidelines above
3. Commit with clear, descriptive messages
4. Push your branch and create a pull request
5. Ensure all CI checks pass
6. Address review feedback promptly

### Commit Message Format

Use clear, descriptive commit messages:

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Example:
```
feat: add CSV column auto-detection

Implements intelligent column detection for participant data,
automatically identifying name and ticket number columns.

Implements FR-1.4 from SRS
```

## Reporting Issues

When reporting issues, please include:

1. **Description**: Clear description of the problem
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Chrome version, OS, extension version
6. **Screenshots**: If applicable
7. **Console Errors**: Any errors from the developer console

## Package-Specific Guidelines

### Extension Package (`apps/extension`)

- Follow Chrome Extension Manifest V3 best practices
- Ensure all permissions are justified and minimal
- Test in Chrome with developer mode enabled
- Verify the built ZIP file before submission

### Storage Package (`packages/storage`)

- Maintain abstraction from Chrome-specific APIs
- Ensure all methods are properly typed
- Handle errors gracefully
- Document migration strategies

### CSV Parser Package (`packages/csv-parser`)

- Handle various CSV formats and encodings
- Validate data thoroughly
- Provide clear error messages
- Maintain performance with large files

### Spinner Physics Package (`packages/spinner-physics`)

- Ensure smooth 60fps animations
- Test with various participant counts
- Document physics parameters
- Maintain deterministic behavior

## Questions?

If you have questions about contributing, please open an issue with the "question" label.

Thank you for contributing to Raffle Winner Spinner!