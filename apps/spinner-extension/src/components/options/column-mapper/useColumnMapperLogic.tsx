/**
 * Column Mapper Logic Hook
 * Manages the state and business logic for column mapping
 */

import React from 'react';
import { ColumnMapping, SavedMapping } from '@raffle-spinner/storage';
import { saveMappingIfNeeded, buildFinalMapping, isValidMapping } from './mapping-utils';

interface UseColumnMapperLogicProps {
  detectedMapping: Partial<ColumnMapping>;
  savedMappings: SavedMapping[];
  suggestedMappingId?: string;
  onConfirm: (mapping: ColumnMapping, saveMapping?: SavedMapping) => void;
}

export function useColumnMapperLogic({
  detectedMapping,
  savedMappings,
  suggestedMappingId,
  onConfirm,
}: UseColumnMapperLogicProps) {
  const [mapping, setMapping] = React.useState<Partial<ColumnMapping>>(detectedMapping);
  const [useFullName, setUseFullName] = React.useState<boolean>(
    !!detectedMapping.fullName || (!detectedMapping.firstName && !detectedMapping.lastName)
  );
  const [shouldSaveMapping, setShouldSaveMapping] = React.useState(false);
  const [mappingName, setMappingName] = React.useState('');
  const [selectedSavedMappingId, setSelectedSavedMappingId] = React.useState<string>('');

  React.useEffect(() => {
    // If we have a suggested mapping, use it
    if (suggestedMappingId && savedMappings.length > 0) {
      const suggested = savedMappings.find((m) => m.id === suggestedMappingId);
      if (suggested) {
        setMapping(suggested.mapping);
        setUseFullName(!!suggested.mapping.fullName);
        setSelectedSavedMappingId(suggestedMappingId);
        return;
      }
    }

    // Otherwise use detected mapping
    setMapping(detectedMapping);
    setUseFullName(
      !!detectedMapping.fullName || (!detectedMapping.firstName && !detectedMapping.lastName)
    );
  }, [detectedMapping, suggestedMappingId, savedMappings]);

  const handleConfirm = async () => {
    const finalMapping = buildFinalMapping(useFullName, mapping);
    if (!finalMapping) return;

    const savedMapping = await saveMappingIfNeeded(
      shouldSaveMapping,
      mappingName,
      finalMapping,
      selectedSavedMappingId,
      savedMappings
    );

    onConfirm(finalMapping, savedMapping);
  };

  const handleSelectSavedMapping = (mappingId: string) => {
    if (mappingId === 'manual') {
      // Reset to manual configuration
      setSelectedSavedMappingId('');
      setShouldSaveMapping(false);
      setMapping(detectedMapping);
      setUseFullName(
        !!detectedMapping.fullName || (!detectedMapping.firstName && !detectedMapping.lastName)
      );
    } else {
      const saved = savedMappings.find((m) => m.id === mappingId);
      if (saved) {
        setMapping(saved.mapping);
        setUseFullName(!!saved.mapping.fullName);
        setSelectedSavedMappingId(mappingId);
        setShouldSaveMapping(false);
      }
    }
  };

  const handleFormatChange = (newUseFullName: boolean) => {
    setUseFullName(newUseFullName);
    if (newUseFullName) {
      setMapping({ ...mapping, firstName: undefined, lastName: undefined });
    } else {
      setMapping({ ...mapping, fullName: undefined });
    }
  };

  const isValid = isValidMapping(useFullName, mapping);

  return {
    mapping,
    useFullName,
    shouldSaveMapping,
    mappingName,
    selectedSavedMappingId,
    isValid,
    setMapping,
    setShouldSaveMapping,
    setMappingName,
    handleSelectSavedMapping,
    handleConfirm,
    handleFormatChange,
  };
}
