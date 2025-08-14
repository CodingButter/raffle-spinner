/**
 * Base Directus API Client with caching
 */

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export class BaseDirectusClient {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  protected async fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      const fallback = this.cache.get(key);
      if (fallback) {
        return fallback.data;
      }
      throw error;
    }
  }

  protected async fetchFromDirectus<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await fetch(`${DIRECTUS_URL}/items/${endpoint}`, {
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Error fetching from Directus ${endpoint}:`, error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}
