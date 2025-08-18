/**
 * Chrome Storage API Mock
 * 
 * Provides a complete mock implementation of chrome.storage.local
 * with configurable responses and state management for testing.
 */

import { vi } from 'vitest';

export class ChromeStorageMock {
  private storage: Map<string, any> = new Map();
  private listeners: Set<Function> = new Set();

  constructor(initialData?: Record<string, any>) {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        this.storage.set(key, value);
      });
    }
  }

  get = vi.fn((keys: string | string[] | null, callback?: Function) => {
    const result: Record<string, any> = {};
    
    if (keys === null) {
      // Return all storage
      this.storage.forEach((value, key) => {
        result[key] = value;
      });
    } else if (typeof keys === 'string') {
      const value = this.storage.get(keys);
      if (value !== undefined) {
        result[keys] = value;
      }
    } else if (Array.isArray(keys)) {
      keys.forEach(key => {
        const value = this.storage.get(key);
        if (value !== undefined) {
          result[key] = value;
        }
      });
    }

    if (callback) {
      callback(result);
    }
    return Promise.resolve(result);
  });

  set = vi.fn((items: Record<string, any>, callback?: Function) => {
    const changes: Record<string, any> = {};
    
    Object.entries(items).forEach(([key, value]) => {
      const oldValue = this.storage.get(key);
      this.storage.set(key, value);
      changes[key] = { oldValue, newValue: value };
    });

    // Notify listeners
    this.listeners.forEach(listener => {
      listener(changes, 'local');
    });

    if (callback) {
      callback();
    }
    return Promise.resolve();
  });

  remove = vi.fn((keys: string | string[], callback?: Function) => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    const changes: Record<string, any> = {};
    
    keysArray.forEach(key => {
      const oldValue = this.storage.get(key);
      if (oldValue !== undefined) {
        this.storage.delete(key);
        changes[key] = { oldValue, newValue: undefined };
      }
    });

    // Notify listeners
    this.listeners.forEach(listener => {
      listener(changes, 'local');
    });

    if (callback) {
      callback();
    }
    return Promise.resolve();
  });

  clear = vi.fn((callback?: Function) => {
    const changes: Record<string, any> = {};
    
    this.storage.forEach((value, key) => {
      changes[key] = { oldValue: value, newValue: undefined };
    });
    
    this.storage.clear();

    // Notify listeners
    this.listeners.forEach(listener => {
      listener(changes, 'local');
    });

    if (callback) {
      callback();
    }
    return Promise.resolve();
  });

  onChanged = {
    addListener: vi.fn((listener: Function) => {
      this.listeners.add(listener);
    }),
    removeListener: vi.fn((listener: Function) => {
      this.listeners.delete(listener);
    }),
    hasListener: vi.fn((listener: Function) => {
      return this.listeners.has(listener);
    }),
  };

  // Test utilities
  _getData() {
    return Object.fromEntries(this.storage);
  }

  _setData(data: Record<string, any>) {
    this.storage.clear();
    Object.entries(data).forEach(([key, value]) => {
      this.storage.set(key, value);
    });
  }

  _reset() {
    this.storage.clear();
    this.listeners.clear();
    this.get.mockClear();
    this.set.mockClear();
    this.remove.mockClear();
    this.clear.mockClear();
  }
}

// Default instance
export const chromeStorageMock = new ChromeStorageMock();