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

  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  }
}
