/**
 * LocalStorage Adapter for Website Extension Pages
 *
 * Provides a consistent API similar to chrome.storage.local
 * but using browser localStorage for the website version
 */

'use client';

export class LocalStorageAdapter {
  private prefix = 'drawday_';

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }

  async remove(key: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

export const storage = new LocalStorageAdapter();
