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
export * from './optimized-chrome-storage-adapter';
export * from './storage-benchmark';

import { OptimizedChromeStorageAdapter } from './optimized-chrome-storage-adapter';

// Default export for convenience - now using optimized adapter
export const storage = new OptimizedChromeStorageAdapter();
