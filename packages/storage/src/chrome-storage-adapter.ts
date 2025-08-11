/**
 * Chrome Storage Adapter
 *
 * Purpose: Chrome extension storage implementation providing persistent data storage
 * for competitions, settings, and column mappings using chrome.storage.local API.
 *
 * SRS Reference:
 * - Data Layer: Chrome extension storage implementation
 * - FR-1.6: Competition Management (persistent competition data)
 * - FR-1.7: Spinner Physics Configuration (persistent settings)
 * - FR-1.4: Column Mapping Interface (persistent column mappings)
 */

import { StorageAdapter } from "./storage-adapter";
import {
  Competition,
  SpinnerSettings,
  ColumnMapping,
  SavedMapping,
  StorageData,
} from "./types";

const DEFAULT_SETTINGS: SpinnerSettings = {
  minSpinDuration: 3,
  decelerationRate: "medium",
};

export class ChromeStorageAdapter implements StorageAdapter {
  private async getData(): Promise<StorageData> {
    const result = await chrome.storage.local.get("data");
    return (
      result.data || {
        competitions: [],
        settings: DEFAULT_SETTINGS,
        columnMapping: null,
        savedMappings: [],
        defaultMappingId: undefined,
      }
    );
  }

  private async setData(data: Partial<StorageData>): Promise<void> {
    const current = await this.getData();
    await chrome.storage.local.set({
      data: { ...current, ...data },
    });
  }

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

    if (index >= 0) {
      competitions[index] = competition;
    } else {
      competitions.push(competition);
    }

    await this.setData({ competitions });
  }

  async deleteCompetition(id: string): Promise<void> {
    const competitions = await this.getCompetitions();
    const filtered = competitions.filter((c) => c.id !== id);
    await this.setData({ competitions: filtered });
  }

  async getSettings(): Promise<SpinnerSettings> {
    const data = await this.getData();
    return data.settings;
  }

  async saveSettings(settings: SpinnerSettings): Promise<void> {
    await this.setData({ settings });
  }

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

    if (index >= 0) {
      mappings[index] = {
        ...mapping,
        updatedAt: Date.now(),
      };
    } else {
      mappings.push(mapping);
    }

    await this.setData({ savedMappings: mappings });
  }

  async deleteSavedMapping(id: string): Promise<void> {
    const mappings = await this.getSavedMappings();
    const filtered = mappings.filter((m) => m.id !== id);

    const data = await this.getData();
    // If we're deleting the default mapping, clear the default
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

  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  }
}
