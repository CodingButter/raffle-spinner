/**
 * Hybrid Storage Adapter
 *
 * Purpose: Development-friendly storage adapter that uses chrome.storage when available
 * (in extension context) or falls back to localStorage for development browser context.
 *
 * This fixes the critical issue where localStorage works but chrome.storage fails
 * during development, breaking the data flow between extension pages.
 */

import { StorageAdapter } from './storage-adapter';
import {
  Competition,
  SpinnerSettings,
  ColumnMapping,
  SavedMapping,
  UserSubscription,
  SpinnerSession,
  StorageData,
} from './types';

const DEFAULT_SETTINGS: SpinnerSettings = {
  minSpinDuration: 3,
  decelerationRate: 'medium',
};

const DEFAULT_DATA: StorageData = {
  competitions: [],
  settings: DEFAULT_SETTINGS,
  columnMapping: null,
  savedMappings: [],
  defaultMappingId: undefined,
  theme: undefined,
  raffleCount: 0,
  subscription: undefined,
  session: undefined,
};

/**
 * Hybrid Storage Adapter that works in both extension and development contexts
 */
export class HybridStorageAdapter implements StorageAdapter {
  private isExtensionContext(): boolean {
    return (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local &&
      typeof chrome.storage.local.get === 'function'
    );
  }

  private async getDataFromChromeStorage(): Promise<StorageData> {
    const result = await chrome.storage.local.get('data');
    return result.data || DEFAULT_DATA;
  }

  private async setDataToChromeStorage(data: Partial<StorageData>): Promise<void> {
    const current = await this.getDataFromChromeStorage();
    await chrome.storage.local.set({
      data: { ...current, ...data },
    });
  }

  private getDataFromLocalStorage(): StorageData {
    try {
      // Check for legacy 'competitions' key first
      const competitionsOnly = localStorage.getItem('competitions');
      if (competitionsOnly && !localStorage.getItem('spinnerData')) {
        const competitions = JSON.parse(competitionsOnly);
        return { ...DEFAULT_DATA, competitions };
      }

      const stored = localStorage.getItem('spinnerData');
      if (!stored) return DEFAULT_DATA;

      const parsed = JSON.parse(stored);
      return { ...DEFAULT_DATA, ...parsed };
    } catch (error) {
      console.error('Failed to parse localStorage data:', error);
      return DEFAULT_DATA;
    }
  }

  private setDataToLocalStorage(data: Partial<StorageData>): void {
    try {
      const current = this.getDataFromLocalStorage();
      const updated = { ...current, ...data };
      localStorage.setItem('spinnerData', JSON.stringify(updated));

      // Keep legacy key in sync for backward compatibility
      if (data.competitions !== undefined) {
        localStorage.setItem('competitions', JSON.stringify(data.competitions));
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw error;
    }
  }

  private async getData(): Promise<StorageData> {
    if (this.isExtensionContext()) {
      return this.getDataFromChromeStorage();
    } else {
      return this.getDataFromLocalStorage();
    }
  }

  private async setData(data: Partial<StorageData>): Promise<void> {
    if (this.isExtensionContext()) {
      await this.setDataToChromeStorage(data);
    } else {
      this.setDataToLocalStorage(data);
    }
  }

  // Competition methods
  async getCompetitions(): Promise<Competition[]> {
    const data = await this.getData();
    return data.competitions;
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

    await this.setData({ competitions: updatedCompetitions });
  }

  async deleteCompetition(id: string): Promise<void> {
    const competitions = await this.getCompetitions();
    const filtered = competitions.filter((c) => c.id !== id);
    await this.setData({ competitions: filtered });
  }

  // Settings methods
  async getSettings(): Promise<SpinnerSettings> {
    const data = await this.getData();
    return data.settings;
  }

  async saveSettings(settings: SpinnerSettings): Promise<void> {
    await this.setData({ settings });
  }

  // Column mapping methods
  async getColumnMapping(): Promise<ColumnMapping | null> {
    const data = await this.getData();
    return data.columnMapping;
  }

  async saveColumnMapping(mapping: ColumnMapping): Promise<void> {
    await this.setData({ columnMapping: mapping });
  }

  // Saved mappings methods
  async getSavedMappings(): Promise<SavedMapping[]> {
    const data = await this.getData();
    return data.savedMappings || [];
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

    await this.setData({ savedMappings: updatedMappings });
  }

  async deleteSavedMapping(id: string): Promise<void> {
    const mappings = await this.getSavedMappings();
    const filtered = mappings.filter((m) => m.id !== id);

    const data = await this.getData();
    if (data.defaultMappingId === id) {
      await this.setData({
        savedMappings: filtered,
        defaultMappingId: undefined,
      });
    } else {
      await this.setData({ savedMappings: filtered });
    }
  }

  async getDefaultMapping(): Promise<SavedMapping | null> {
    const data = await this.getData();
    if (!data.defaultMappingId) return null;
    return this.getSavedMapping(data.defaultMappingId);
  }

  async setDefaultMapping(id: string | null): Promise<void> {
    await this.setData({ defaultMappingId: id || undefined });
  }

  // Subscription methods
  async getSubscription(): Promise<UserSubscription | null> {
    const data = await this.getData();
    return data.subscription || null;
  }

  async saveSubscription(subscription: UserSubscription): Promise<void> {
    await this.setData({ subscription });
  }

  // Raffle counting methods
  async getRaffleCount(): Promise<number> {
    const data = await this.getData();
    return data.raffleCount || 0;
  }

  async incrementRaffleCount(): Promise<number> {
    const currentCount = await this.getRaffleCount();
    const newCount = currentCount + 1;
    await this.setData({ raffleCount: newCount });
    return newCount;
  }

  async resetRaffleCount(): Promise<void> {
    await this.setData({ raffleCount: 0 });
  }

  // Session persistence methods
  async getSession(): Promise<SpinnerSession | null> {
    try {
      const data = await this.getData();
      return data.session || null;
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
      await this.setData({ session: updatedSession });
    } catch (error) {
      console.error('Failed to save session:', error);
      // Don't throw - session persistence should be non-blocking
    }
  }

  async clearSession(): Promise<void> {
    try {
      await this.setData({ session: undefined });
    } catch (error) {
      console.error('Failed to clear session:', error);
      // Don't throw - session persistence should be non-blocking
    }
  }

  async clear(): Promise<void> {
    if (this.isExtensionContext()) {
      await chrome.storage.local.clear();
    } else {
      localStorage.clear();
    }
  }

  /**
   * Debugging method to check storage context
   */
  getStorageInfo() {
    return {
      isExtensionContext: this.isExtensionContext(),
      chromeExists: typeof chrome !== 'undefined',
      chromeStorageExists: typeof chrome !== 'undefined' && !!chrome.storage,
      localStorageExists: typeof localStorage !== 'undefined',
    };
  }
}
