# 🎯 DrawDay Spinner - Chrome Extension

[![CI](https://github.com/CodingButter/drawday-spinner/actions/workflows/ci.yml/badge.svg)](https://github.com/CodingButter/drawday-spinner/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/CodingButter/drawday-spinner/blob/main/CONTRIBUTING.md)

A professional Chrome Extension for conducting live draws in competitions - fair, transparent, and engaging winner selection.

## Overview

DrawDay Spinner is a Chrome Extension designed for the UK competition industry, providing a professional, visually engaging way to conduct live draws. Perfect for raffling cars, bikes, trucks, and other prizes with complete transparency. Features include CSV data import, intelligent column mapping, competition management, and an interactive slot machine-style spinner with realistic physics.

## Key Features

- 📊 **CSV Import**: Upload participant data with automatic column detection
- 🎯 **Smart Mapping**: Intelligent identification of name and ticket columns
- 🏆 **Competition Management**: Create and manage multiple raffles
- 🎡 **Interactive Wheel**: Realistic spinning animation with physics
- 📝 **Winner Tracking**: Complete history of selections
- ⚡ **High Performance**: Handles 5000+ participants smoothly
- 🔒 **Privacy First**: All data stored locally, no external connections

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Chrome browser

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd spinner

# Install dependencies
pnpm install

# Build the extension
pnpm build
```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `apps/extension/dist` directory

## Project Structure

This is a monorepo organized with clear separation of concerns:

```
spinner/
├── apps/
│   └── extension/           # Chrome extension application
├── packages/
│   ├── csv-parser/          # CSV parsing and validation
│   ├── spinner-physics/     # Wheel physics engine
│   ├── storage/             # Storage abstraction layer
│   ├── eslint-config/       # Shared ESLint configuration
│   ├── prettier-config/     # Shared Prettier configuration
│   └── typescript-config/   # Shared TypeScript configuration
├── scripts/                 # Build and utility scripts
├── Software Requirements.md # Detailed requirements specification
└── CONTRIBUTING.md          # Contribution guidelines
```

## Development

### Available Commands

```bash
# Development
pnpm dev          # Start development server with HMR
pnpm build        # Build all packages and extension
pnpm clean        # Clean all build artifacts

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format with Prettier
pnpm typecheck    # TypeScript type checking
pnpm quality      # Run all quality checks

# Package-specific commands
pnpm --filter @raffle-spinner/extension dev
pnpm --filter @raffle-spinner/csv-parser test
```

### Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tools**: Vite, tsup
- **Code Quality**: ESLint, Prettier, Husky
- **Package Management**: pnpm workspaces

## Usage Guide

### Preparing Your Data

Create a CSV file with participant information:

```csv
Name,Ticket Number,Email
John Doe,12345,john@example.com
Jane Smith,67890,jane@example.com
Bob Johnson,11111,bob@example.com
```

### Running a Raffle

1. **Upload Data**: Click the extension icon → Options → Upload CSV
2. **Map Columns**: Verify or adjust column mappings
3. **Create Competition**: Name your raffle and save
4. **Open Side Panel**: Click extension icon → Open spinner
5. **Spin to Win**: Click spin and watch the magic happen!

## Features in Detail

### Intelligent CSV Processing

- Automatic delimiter detection
- Smart column identification
- Duplicate ticket detection
- Data validation with clear error messages
- Support for various CSV formats

### Competition Management

- Create multiple competitions
- Switch between active raffles
- Edit and delete competitions
- Persistent storage
- Export results

### Spinner Physics

- Realistic momentum and friction
- Smooth 60fps animations
- Configurable spin parameters
- Fair, random selection
- Visual feedback for winners

## Code Quality

This project maintains high code quality standards:

- ✅ Zero ESLint warnings or errors
- ✅ Consistent Prettier formatting
- ✅ Full TypeScript type safety
- ✅ Comprehensive documentation
- ✅ Clean, modular architecture
- ✅ Small, focused components
- ✅ Clear separation of concerns

## Performance

Optimized for large-scale raffles:

- Handles 5000+ participants
- Sub-second CSV parsing
- 60fps spinner animation
- Efficient memory usage
- Fast winner selection

## Privacy & Security

- 🔒 All data stored locally in Chrome
- 🚫 No external API calls
- 🛡️ No tracking or analytics
- ✅ Input validation and sanitization
- 🔐 Secure Chrome storage API usage

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Install dependencies: `pnpm install`
4. Set up git hooks: `./scripts/setup-husky.sh`
5. Make your changes
6. Ensure all checks pass: `pnpm quality`
7. Submit a pull request

## Package Documentation

Each package has its own README with detailed documentation:

- [Extension](apps/extension/README.md) - Chrome extension application
- [Storage](packages/storage/README.md) - Storage abstraction layer
- [CSV Parser](packages/csv-parser/README.md) - CSV parsing utilities
- [Spinner Physics](packages/spinner-physics/README.md) - Physics engine

## Roadmap

### Version 1.0 (Current)

- ✅ CSV import and parsing
- ✅ Competition management
- ✅ Spinning wheel with physics
- ✅ Winner tracking
- ✅ Chrome extension

### Version 2.0 (Planned)

- [ ] Multiple wheel themes
- [ ] Sound effects and music
- [ ] Prize tier support
- [ ] Bulk winner selection
- [ ] Export to various formats

### Version 3.0 (Future)

- [ ] Cloud sync support
- [ ] Team collaboration
- [ ] Mobile companion app
- [ ] API integrations
- [ ] Advanced analytics

## Support

For issues, questions, or suggestions:

1. Check the [documentation](apps/extension/README.md)
2. Search existing [issues](../../issues)
3. Create a new issue with details

## License

This project is part of the Raffle Winner Spinner suite.

## Acknowledgments

Built with modern web technologies and best practices for a professional, maintainable codebase that teams can confidently build upon.

---

**Ready to make your raffles more exciting?** Install the extension and start spinning!
