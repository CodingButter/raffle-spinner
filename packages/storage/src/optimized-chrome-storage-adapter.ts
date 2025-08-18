/**
 * Optimized Chrome Storage Adapter
 *
 * Purpose: High-performance Chrome extension storage implementation with in-memory
 * caching, batched operations, and optimized data structures for <10ms operations.
 *
 * Performance Optimizations:
 * - In-memory caching with intelligent invalidation
 * - Batched write operations to reduce chrome.storage calls
 * - Granular key-based storage to avoid large data transfers
 * - Debounced writes to prevent rapid consecutive saves
 * - Async queue for write operations
 */

/* eslint-disable max-lines */

import { StorageAdapter } from './storage-adapter';
import {
  Competition,
  SpinnerSettings,
  ColumnMapping,
  SavedMapping,
  UserSubscription,
  SpinnerSession,
} from './types';

// Storage key constants for granular access
const STORAGE_KEYS = {
  COMPETITIONS: 'competitions',
  SETTINGS: 'settings',
  COLUMN_MAPPING: 'columnMapping',
  SAVED_MAPPINGS: 'savedMappings',
  DEFAULT_MAPPING_ID: 'defaultMappingId',
  THEME: 'theme',
  RAFFLE_COUNT: 'raffleCount',
  SUBSCRIPTION: 'subscription',
  SESSION: 'session',
} as const;

const DEFAULT_SETTINGS: SpinnerSettings = {
  minSpinDuration: 3,
  decelerationRate: 'medium',
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  dirty: boolean; // Whether the cache is out of sync with storage
}

interface WriteOperation {
  key: string;
  data: unknown;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

/**
 * Optimized Chrome Storage Adapter with caching and batching
 */
export class OptimizedChromeStorageAdapter implements StorageAdapter {
  private cache = new Map<string, CacheEntry<any>>();
  private writeQueue: WriteOperation[] = [];
  private writeTimeout: NodeJS.Timeout | null = null;
  private isProcessingWrites = false;
  
  // Cache TTL in milliseconds (5 minutes)
  private readonly CACHE_TTL = 5 * 60 * 1000;
  
  // Write debounce delay in milliseconds
  private readonly WRITE_DEBOUNCE_DELAY = 50;
  
  // Batch size for write operations
  private readonly BATCH_SIZE = 10;

  /**
   * Get data from cache or storage with automatic cache management
   */
  private async getCachedData<T>(
    key: string,
    defaultValue: T,
    forceRefresh = false
  ): Promise<T> {
    const cacheEntry = this.cache.get(key);
    const now = Date.now();
    
    // Return cached data if valid and not forced to refresh
    if (
      !forceRefresh &&
      cacheEntry &&
      (now - cacheEntry.timestamp) < this.CACHE_TTL &&
      !cacheEntry.dirty
    ) {
      return cacheEntry.data;
    }
    
    try {
      // Fetch from storage
      const result = await chrome.storage.local.get(key);
      const data = result[key] ?? defaultValue;
      
      // Update cache
      this.cache.set(key, {
        data,
        timestamp: now,
        dirty: false,
      });
      
      return data;
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error);
      
      // Return cached data if available, otherwise default
      if (cacheEntry) {
        return cacheEntry.data;
      }
      return defaultValue;
    }
  }

  /**
   * Queue a write operation with batching and prioritization
   */
  private queueWrite(key: string, data: unknown, priority: 'high' | 'normal' | 'low' = 'normal') {
    // Update cache immediately for instant UI response
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      dirty: true,
    });
    
    // Remove any existing write for this key to avoid duplicates
    this.writeQueue = this.writeQueue.filter(op => op.key !== key);
    
    // Add new write operation
    this.writeQueue.push({
      key,
      data,
      priority,
      timestamp: Date.now(),
    });
    
    // Schedule batch write
    this.scheduleBatchWrite();
  }

  /**
   * Schedule batched write operations with debouncing
   */
  private scheduleBatchWrite() {
    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
    }
    
    // For high priority writes, process immediately
    const hasHighPriority = this.writeQueue.some(op => op.priority === 'high');
    const delay = hasHighPriority ? 0 : this.WRITE_DEBOUNCE_DELAY;
    
    this.writeTimeout = setTimeout(() => {
      this.processBatchWrites();
    }, delay);
  }

  /**
   * Process queued write operations in batches
   */
  private async processBatchWrites() {
    if (this.isProcessingWrites || this.writeQueue.length === 0) {
      return;
    }
    
    this.isProcessingWrites = true;
    
    try {
      // Sort by priority and timestamp
      this.writeQueue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.timestamp - b.timestamp;
      });
      
      // Process in batches
      while (this.writeQueue.length > 0) {
        const batch = this.writeQueue.splice(0, this.BATCH_SIZE);
        const writeObject: { [key: string]: unknown } = {};
        
        // Prepare batch write object
        batch.forEach(op => {
          writeObject[op.key] = op.data;
        });
        
        try {
          // Perform batched write
          await chrome.storage.local.set(writeObject);
          
          // Mark cache entries as clean
          batch.forEach(op => {
            const cacheEntry = this.cache.get(op.key);
            if (cacheEntry) {
              cacheEntry.dirty = false;
            }
          });
          
        } catch (error) {
          console.error('Batch write failed:', error);
          
          // Re-queue failed operations with lower priority
          batch.forEach(op => {
            this.writeQueue.push({
              ...op,
              priority: 'low',
              timestamp: Date.now(),
            });
          });
        }
        
        // Small delay between batches to prevent blocking
        if (this.writeQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }
      
    } finally {
      this.isProcessingWrites = false;
      
      // If more writes were queued during processing, schedule another batch
      if (this.writeQueue.length > 0) {
        this.scheduleBatchWrite();
      }
    }
  }

  /**
   * Force flush all pending writes immediately
   */
  async flushWrites(): Promise<void> {
    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
      this.writeTimeout = null;
    }
    
    return this.processBatchWrites();
  }

  // Competition methods with optimizations
  async getCompetitions(): Promise<Competition[]> {
    return this.getCachedData(STORAGE_KEYS.COMPETITIONS, []);
  }

  async getCompetition(id: string): Promise<Competition | null> {
    const competitions = await this.getCompetitions();
    return competitions.find((c) => c.id === id) || null;
  }

  async saveCompetition(competition: Competition): Promise<void> {
    const competitions = await this.getCompetitions();
    const index = competitions.findIndex((c) => c.id === competition.id);

    let updatedCompetitions: Competition[];
    if (index >= 0) {
      updatedCompetitions = [...competitions];
      updatedCompetitions[index] = competition;
    } else {
      updatedCompetitions = [...competitions, competition];
    }

    this.queueWrite(STORAGE_KEYS.COMPETITIONS, updatedCompetitions, 'normal');
  }

  async deleteCompetition(id: string): Promise<void> {
    const competitions = await this.getCompetitions();
    const filtered = competitions.filter((c) => c.id !== id);
    this.queueWrite(STORAGE_KEYS.COMPETITIONS, filtered, 'normal');
  }

  // Settings methods with caching
  async getSettings(): Promise<SpinnerSettings> {
    return this.getCachedData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  async saveSettings(settings: SpinnerSettings): Promise<void> {
    this.queueWrite(STORAGE_KEYS.SETTINGS, settings, 'normal');
  }

  // Column mapping methods
  async getColumnMapping(): Promise<ColumnMapping | null> {
    return this.getCachedData(STORAGE_KEYS.COLUMN_MAPPING, null);
  }

  async saveColumnMapping(mapping: ColumnMapping): Promise<void> {
    this.queueWrite(STORAGE_KEYS.COLUMN_MAPPING, mapping, 'normal');
  }

  // Saved mappings methods with optimizations
  async getSavedMappings(): Promise<SavedMapping[]> {
    return this.getCachedData(STORAGE_KEYS.SAVED_MAPPINGS, []);
  }

  async getSavedMapping(id: string): Promise<SavedMapping | null> {
    const mappings = await this.getSavedMappings();
    return mappings.find((m) => m.id === id) || null;
  }

  async saveSavedMapping(mapping: SavedMapping): Promise<void> {
    const mappings = await this.getSavedMappings();
    const index = mappings.findIndex((m) => m.id === mapping.id);

    let updatedMappings: SavedMapping[];
    if (index >= 0) {
      updatedMappings = [...mappings];
      updatedMappings[index] = {
        ...mapping,
        updatedAt: Date.now(),
      };
    } else {
      updatedMappings = [...mappings, mapping];
    }

    this.queueWrite(STORAGE_KEYS.SAVED_MAPPINGS, updatedMappings, 'normal');
  }

  async deleteSavedMapping(id: string): Promise<void> {
    const mappings = await this.getSavedMappings();
    const filtered = mappings.filter((m) => m.id !== id);

    // Check if we're deleting the default mapping
    const defaultMappingId = await this.getCachedData(STORAGE_KEYS.DEFAULT_MAPPING_ID, undefined);
    
    this.queueWrite(STORAGE_KEYS.SAVED_MAPPINGS, filtered, 'normal');
    
    if (defaultMappingId === id) {
      this.queueWrite(STORAGE_KEYS.DEFAULT_MAPPING_ID, undefined, 'normal');
    }
  }

  async getDefaultMapping(): Promise<SavedMapping | null> {
    const defaultId = await this.getCachedData(STORAGE_KEYS.DEFAULT_MAPPING_ID, undefined);
    if (!defaultId) return null;
    return this.getSavedMapping(defaultId);
  }

  async setDefaultMapping(id: string | null): Promise<void> {
    this.queueWrite(STORAGE_KEYS.DEFAULT_MAPPING_ID, id || undefined, 'normal');
  }

  // Subscription methods
  async getSubscription(): Promise<UserSubscription | null> {
    return this.getCachedData(STORAGE_KEYS.SUBSCRIPTION, null);
  }

  async saveSubscription(subscription: UserSubscription): Promise<void> {
    this.queueWrite(STORAGE_KEYS.SUBSCRIPTION, subscription, 'high');
  }

  // Raffle counting methods (high frequency during live sessions)
  async getRaffleCount(): Promise<number> {
    return this.getCachedData(STORAGE_KEYS.RAFFLE_COUNT, 0);
  }

  async incrementRaffleCount(): Promise<number> {
    const currentCount = await this.getRaffleCount();
    const newCount = currentCount + 1;
    
    // High priority for live session operations
    this.queueWrite(STORAGE_KEYS.RAFFLE_COUNT, newCount, 'high');
    
    return newCount;
  }

  async resetRaffleCount(): Promise<void> {
    this.queueWrite(STORAGE_KEYS.RAFFLE_COUNT, 0, 'normal');
  }

  // Session persistence methods (critical for live spinning)
  async getSession(): Promise<SpinnerSession | null> {
    try {
      return await this.getCachedData(STORAGE_KEYS.SESSION, null);
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  async saveSession(session: SpinnerSession): Promise<void> {
    try {
      const updatedSession = {
        ...session,
        lastActivity: Date.now(),
      };
      
      // High priority for live session updates
      this.queueWrite(STORAGE_KEYS.SESSION, updatedSession, 'high');
    } catch (error) {
      console.error('Failed to save session:', error);
      // Don't throw - session persistence should be non-blocking
    }
  }

  async clearSession(): Promise<void> {
    try {
      this.queueWrite(STORAGE_KEYS.SESSION, undefined, 'high');
    } catch (error) {
      console.error('Failed to clear session:', error);
      // Don't throw - session persistence should be non-blocking
    }
  }

  // Clear all data and cache
  async clear(): Promise<void> {
    this.cache.clear();
    this.writeQueue.length = 0;
    
    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
      this.writeTimeout = null;
    }
    
    await chrome.storage.local.clear();
  }

  /**
   * Performance monitoring and cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingWrites: this.writeQueue.length,
      isProcessingWrites: this.isProcessingWrites,
      cacheEntries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        dirty: entry.dirty,
        age: Date.now() - entry.timestamp,
      })),
    };
  }

  /**
   * Manually invalidate cache entries
   */
  invalidateCache(keys?: string[]) {
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}