# @raffle-spinner/storage

Storage abstraction layer for the Raffle Winner Spinner Chrome Extension.

## Overview

This package provides a unified interface for data persistence, currently implemented using Chrome's storage API. The abstraction allows for easy migration to other storage backends in the future.

## Features

- Type-safe storage operations
- Chrome storage API implementation
- Support for competitions, participants, and settings
- Automatic data validation
- Migration-ready architecture

## Installation

This package is part of the Raffle Winner Spinner monorepo and is not published to npm.

```bash
pnpm add @raffle-spinner/storage
```

## Usage

```typescript
import { ChromeStorageAdapter } from '@raffle-spinner/storage';
import type { Competition, Settings } from '@raffle-spinner/storage';

const storage = new ChromeStorageAdapter();

// Save a competition
await storage.saveCompetition({
  id: 'comp-123',
  name: 'Summer Raffle',
  participants: [...],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Get all competitions
const competitions = await storage.getCompetitions();

// Get active competition
const active = await storage.getActiveCompetition();

// Update settings
await storage.updateSettings({
  spinDuration: 5000,
  soundEnabled: true
});
```

## API Reference

### ChromeStorageAdapter

#### Methods

##### `getCompetitions(): Promise<Competition[]>`
Returns all stored competitions.

##### `getCompetition(id: string): Promise<Competition | null>`
Returns a specific competition by ID.

##### `saveCompetition(competition: Competition): Promise<void>`
Saves or updates a competition.

##### `deleteCompetition(id: string): Promise<void>`
Deletes a competition.

##### `setActiveCompetition(id: string | null): Promise<void>`
Sets the active competition.

##### `getActiveCompetition(): Promise<Competition | null>`
Returns the currently active competition.

##### `getSettings(): Promise<Settings>`
Returns application settings.

##### `updateSettings(settings: Partial<Settings>): Promise<void>`
Updates application settings.

### Types

```typescript
interface Competition {
  id: string;
  name: string;
  participants: Participant[];
  createdAt: Date;
  updatedAt: Date;
  totalTickets?: number;
  uniqueParticipants?: number;
}

interface Participant {
  id: string;
  name: string;
  ticketNumbers: string[];
  email?: string;
  isWinner?: boolean;
  winTimestamp?: Date;
}

interface Settings {
  spinDuration: number;
  soundEnabled: boolean;
  autoRemoveWinners: boolean;
  showTicketNumbers: boolean;
  theme: 'light' | 'dark' | 'system';
}
```

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Type Checking

```bash
pnpm typecheck
```

## Architecture Notes

The storage package is designed with future migrations in mind:

1. **Abstraction Layer**: All storage operations go through the adapter interface
2. **Type Safety**: Full TypeScript support with proper types
3. **Backend Agnostic**: Easy to swap Chrome storage for IndexedDB, localStorage, or a backend API
4. **Data Validation**: Built-in validation for all data operations

## Future Enhancements

- [ ] IndexedDB adapter for larger datasets
- [ ] Backend API adapter for cloud sync
- [ ] Data export/import functionality
- [ ] Compression for large participant lists
- [ ] Encryption for sensitive data

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

Part of the Raffle Winner Spinner project.