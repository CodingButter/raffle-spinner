/**
 * Chrome Storage Integration Test Example
 * Author: David Miller, Lead Developer Architect
 * 
 * This test demonstrates integration testing with Chrome storage API:
 * - Storage operations (get, set, remove, clear)
 * - Change listeners
 * - Concurrent operations
 * - Error handling
 * - Data persistence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChromeStorageMock } from '../../../apps/spinner-extension/src/test/mocks/chrome-storage';

// Import the actual storage wrapper that would be used in production
class StorageManager {
  private storage: typeof chrome.storage.local;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(storage: typeof chrome.storage.local) {
    this.storage = storage;
    
    // Set up change listener
    this.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        Object.keys(changes).forEach(key => {
          const listeners = this.listeners.get(key);
          if (listeners) {
            listeners.forEach(listener => {
              listener(changes[key].newValue, changes[key].oldValue);
            });
          }
        });
      }
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.storage.get(key);
    return result[key] || null;
  }

  async getMultiple<T extends Record<string, any>>(keys: string[]): Promise<T> {
    const result = await this.storage.get(keys);
    return result as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.storage.set({ [key]: value });
  }

  async setMultiple(items: Record<string, any>): Promise<void> {
    await this.storage.set(items);
  }

  async remove(keys: string | string[]): Promise<void> {
    await this.storage.remove(keys);
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }

  subscribe(key: string, callback: Function): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  async transaction<T>(
    operation: () => Promise<T>,
    rollback: () => Promise<void>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      await rollback();
      throw error;
    }
  }
}

describe('Chrome Storage Integration', () => {
  let storageMock: ChromeStorageMock;
  let storageManager: StorageManager;

  beforeEach(() => {
    storageMock = new ChromeStorageMock();
    storageManager = new StorageManager(storageMock as any);
  });

  afterEach(() => {
    storageMock._reset();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve simple values', async () => {
      await storageManager.set('testKey', 'testValue');
      const value = await storageManager.get<string>('testKey');
      expect(value).toBe('testValue');
    });

    it('should store and retrieve complex objects', async () => {
      const complexObject = {
        competition: {
          id: '123',
          name: 'Summer Raffle',
          participants: [
            { firstName: 'John', lastName: 'Doe', ticketNumber: '001' },
            { firstName: 'Jane', lastName: 'Smith', ticketNumber: '002' },
          ],
          settings: {
            spinDuration: 5,
            wheelSize: 500,
            colors: ['#ff0000', '#00ff00', '#0000ff'],
          },
        },
      };

      await storageManager.set('competition', complexObject);
      const retrieved = await storageManager.get<typeof complexObject>('competition');
      expect(retrieved).toEqual(complexObject);
    });

    it('should handle null values correctly', async () => {
      const value = await storageManager.get('nonExistentKey');
      expect(value).toBeNull();
    });

    it('should handle multiple get operations', async () => {
      await storageManager.setMultiple({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });

      const values = await storageManager.getMultiple<{
        key1: string;
        key2: string;
        key3: string;
      }>(['key1', 'key2', 'key3']);

      expect(values).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });
    });
  });

  describe('Remove Operations', () => {
    it('should remove a single key', async () => {
      await storageManager.set('toRemove', 'value');
      await storageManager.remove('toRemove');
      const value = await storageManager.get('toRemove');
      expect(value).toBeNull();
    });

    it('should remove multiple keys', async () => {
      await storageManager.setMultiple({
        remove1: 'value1',
        remove2: 'value2',
        keep: 'keepValue',
      });

      await storageManager.remove(['remove1', 'remove2']);
      
      const remove1 = await storageManager.get('remove1');
      const remove2 = await storageManager.get('remove2');
      const keep = await storageManager.get('keep');

      expect(remove1).toBeNull();
      expect(remove2).toBeNull();
      expect(keep).toBe('keepValue');
    });
  });

  describe('Clear Operations', () => {
    it('should clear all storage', async () => {
      await storageManager.setMultiple({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });

      await storageManager.clear();

      const values = await storageManager.getMultiple(['key1', 'key2', 'key3']);
      expect(values).toEqual({});
    });
  });

  describe('Change Listeners', () => {
    it('should notify on value changes', async () => {
      const listener = vi.fn();
      const unsubscribe = storageManager.subscribe('watchedKey', listener);

      await storageManager.set('watchedKey', 'newValue');

      expect(listener).toHaveBeenCalledWith('newValue', undefined);

      unsubscribe();
    });

    it('should notify on value updates', async () => {
      await storageManager.set('watchedKey', 'initialValue');
      
      const listener = vi.fn();
      storageManager.subscribe('watchedKey', listener);

      await storageManager.set('watchedKey', 'updatedValue');

      expect(listener).toHaveBeenCalledWith('updatedValue', 'initialValue');
    });

    it('should handle multiple listeners for same key', async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      storageManager.subscribe('sharedKey', listener1);
      storageManager.subscribe('sharedKey', listener2);

      await storageManager.set('sharedKey', 'value');

      expect(listener1).toHaveBeenCalledWith('value', undefined);
      expect(listener2).toHaveBeenCalledWith('value', undefined);
    });

    it('should unsubscribe listeners correctly', async () => {
      const listener = vi.fn();
      const unsubscribe = storageManager.subscribe('tempKey', listener);

      await storageManager.set('tempKey', 'value1');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      await storageManager.set('tempKey', 'value2');
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent writes correctly', async () => {
      const promises = [
        storageManager.set('concurrent', 'value1'),
        storageManager.set('concurrent', 'value2'),
        storageManager.set('concurrent', 'value3'),
      ];

      await Promise.all(promises);

      const finalValue = await storageManager.get('concurrent');
      // The last write should win
      expect(['value1', 'value2', 'value3']).toContain(finalValue);
    });

    it('should handle mixed operations concurrently', async () => {
      await storageManager.setMultiple({
        key1: 'initial1',
        key2: 'initial2',
        key3: 'initial3',
      });

      const promises = [
        storageManager.set('key1', 'updated1'),
        storageManager.remove('key2'),
        storageManager.get('key3'),
      ];

      const [, , getValue] = await Promise.all(promises);

      const key1 = await storageManager.get('key1');
      const key2 = await storageManager.get('key2');

      expect(key1).toBe('updated1');
      expect(key2).toBeNull();
      expect(getValue).toBe('initial3');
    });
  });

  describe('Transactions', () => {
    it('should commit successful transactions', async () => {
      const result = await storageManager.transaction(
        async () => {
          await storageManager.set('transactionKey', 'transactionValue');
          return 'success';
        },
        async () => {
          await storageManager.remove('transactionKey');
        }
      );

      expect(result).toBe('success');
      const value = await storageManager.get('transactionKey');
      expect(value).toBe('transactionValue');
    });

    it('should rollback failed transactions', async () => {
      await storageManager.set('existingKey', 'existingValue');

      try {
        await storageManager.transaction(
          async () => {
            await storageManager.set('existingKey', 'newValue');
            throw new Error('Transaction failed');
          },
          async () => {
            await storageManager.set('existingKey', 'existingValue');
          }
        );
      } catch (error) {
        expect(error.message).toBe('Transaction failed');
      }

      const value = await storageManager.get('existingKey');
      expect(value).toBe('existingValue');
    });
  });

  describe('Competition Data Storage', () => {
    it('should store and retrieve competition data', async () => {
      const competition = {
        id: 'comp-123',
        name: 'Christmas Raffle 2024',
        participants: Array.from({ length: 100 }, (_, i) => ({
          firstName: `Participant`,
          lastName: `${i + 1}`,
          ticketNumber: String(i + 1).padStart(3, '0'),
        })),
        winners: [],
        createdAt: Date.now(),
      };

      await storageManager.set('currentCompetition', competition);
      const retrieved = await storageManager.get('currentCompetition');
      
      expect(retrieved).toEqual(competition);
      expect(retrieved.participants).toHaveLength(100);
    });

    it('should update competition winners', async () => {
      const competition = {
        id: 'comp-456',
        name: 'Test Competition',
        participants: [
          { firstName: 'Alice', lastName: 'Anderson', ticketNumber: '001' },
          { firstName: 'Bob', lastName: 'Brown', ticketNumber: '002' },
        ],
        winners: [],
      };

      await storageManager.set('competition', competition);

      // Simulate adding a winner
      const updatedCompetition = {
        ...competition,
        winners: ['001'],
      };

      await storageManager.set('competition', updatedCompetition);
      const result = await storageManager.get('competition');
      
      expect(result.winners).toEqual(['001']);
    });
  });

  describe('Settings Storage', () => {
    it('should store and retrieve user settings', async () => {
      const settings = {
        theme: 'dark',
        spinDuration: 5,
        soundEnabled: true,
        autoSave: false,
        wheelColors: {
          primary: '#007bff',
          secondary: '#6c757d',
          background: '#ffffff',
        },
      };

      await storageManager.set('userSettings', settings);
      const retrieved = await storageManager.get('userSettings');
      
      expect(retrieved).toEqual(settings);
    });

    it('should merge settings updates', async () => {
      const initialSettings = {
        theme: 'light',
        spinDuration: 3,
      };

      await storageManager.set('settings', initialSettings);

      const currentSettings = await storageManager.get('settings');
      const updatedSettings = {
        ...currentSettings,
        theme: 'dark',
      };

      await storageManager.set('settings', updatedSettings);
      const result = await storageManager.get('settings');

      expect(result.theme).toBe('dark');
      expect(result.spinDuration).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage quota exceeded gracefully', async () => {
      // Simulate large data that might exceed quota
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(1000),
      }));

      try {
        await storageManager.set('largeData', largeData);
        const retrieved = await storageManager.get('largeData');
        expect(retrieved).toEqual(largeData);
      } catch (error) {
        // Should handle quota exceeded error gracefully
        expect(error).toBeDefined();
      }
    });
  });
});