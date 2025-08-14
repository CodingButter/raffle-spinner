/**
 * Storage Package Entry Point
 *
 * Purpose: Main export file for the storage package, providing access to types,
 * storage adapters, and default storage instance for the application.
 *
 * SRS Reference:
 * - Data Layer: Storage package public API
 * - Package Architecture: Storage layer exports
 */

export * from './types';
export * from './storage-adapter';
export * from './chrome-storage-adapter';

import { ChromeStorageAdapter } from './chrome-storage-adapter';

// Default export for convenience
export const storage = new ChromeStorageAdapter();
