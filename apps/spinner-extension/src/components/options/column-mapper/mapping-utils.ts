/**
 * Column Mapping Utilities
 * Helper functions for column mapping logic
 */

import { ColumnMapping, SavedMapping, storage } from '@raffle-spinner/storage';

export async function saveMappingIfNeeded(
  shouldSaveMapping: boolean,
  mappingName: string,
  finalMapping: ColumnMapping,
  selectedSavedMappingId: string,
  savedMappings: SavedMapping[]
): Promise<SavedMapping | undefined> {
  if (shouldSaveMapping && mappingName.trim()) {
    const savedMapping: SavedMapping = {
      id: `mapping-${Date.now()}`,
      name: mappingName.trim(),
      mapping: finalMapping,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 1,
      isDefault: false,
    };
    await storage.saveSavedMapping(savedMapping);
    return savedMapping;
  } else if (selectedSavedMappingId) {
    // Increment usage count of existing mapping
    const existing = savedMappings.find((m) => m.id === selectedSavedMappingId);
    if (existing) {
      await storage.saveSavedMapping({
        ...existing,
        usageCount: existing.usageCount + 1,
      });
    }
  }
  return undefined;
}

export function buildFinalMapping(
  useFullName: boolean,
  mapping: Partial<ColumnMapping>
): ColumnMapping | null {
  if (useFullName) {
    if (mapping.fullName && mapping.ticketNumber) {
      return { fullName: mapping.fullName, ticketNumber: mapping.ticketNumber } as ColumnMapping;
    }
  } else {
    if (mapping.firstName && mapping.lastName && mapping.ticketNumber) {
      return {
        firstName: mapping.firstName,
        lastName: mapping.lastName,
        ticketNumber: mapping.ticketNumber,
      } as ColumnMapping;
    }
  }
  return null;
}

export function isValidMapping(useFullName: boolean, mapping: Partial<ColumnMapping>): boolean {
  return useFullName
    ? !!(mapping.fullName && mapping.ticketNumber)
    : !!(mapping.firstName && mapping.lastName && mapping.ticketNumber);
}
