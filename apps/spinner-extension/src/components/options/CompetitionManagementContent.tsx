/**
 * Competition Management Content Component
 *
 * Card-less version of CompetitionManagement for use in collapsible sections
 */

import { Competition, ColumnMapping } from '@raffle-spinner/storage';
import { logger } from '@drawday/utils';
import { Button } from '@/components/ui/button';
import { Upload, Settings, Play } from 'lucide-react';
import { CompetitionList } from './CompetitionList';

interface CompetitionManagementContentProps {
  competitions: Competition[];
  columnMapping: ColumnMapping | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteCompetition: (id: string) => void;
  onOpenMapper: () => void;
  onUpdateBanner?: (id: string, banner: string | undefined) => void;
}

export function CompetitionManagementContent({
  competitions,
  columnMapping,
  fileInputRef,
  onFileSelect,
  onDeleteCompetition,
  onOpenMapper,
  onUpdateBanner,
}: CompetitionManagementContentProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileSelect}
        />
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV
        </Button>
        <Button variant="outline" onClick={onOpenMapper}>
          <Settings className="w-4 h-4 mr-2" />
          {columnMapping ? 'Edit Column Mapping' : 'Set Column Mapping'}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // Send message to background script to open side panel
            chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
              if (chrome.runtime.lastError) {
                logger.error('Failed to open side panel', {
                  component: 'CompetitionManagementContent',
                  error: chrome.runtime.lastError,
                });
              } else if (response && !response.success) {
                logger.error('Failed to open side panel', {
                  component: 'CompetitionManagementContent',
                  error: response.error,
                });
              } else {
                logger.debug('Side panel opened successfully', {
                  component: 'CompetitionManagementContent',
                });
              }
            });
          }}
          title="Open Side Panel"
        >
          <Play className="w-4 h-4 mr-2" />
          Open Panel
        </Button>
      </div>

      {columnMapping && (
        <div className="text-sm text-muted-foreground">
          Current mapping: {columnMapping.firstName} → First Name, {columnMapping.lastName} → Last
          Name, {columnMapping.ticketNumber} → Ticket
        </div>
      )}

      <CompetitionList
        competitions={competitions}
        onDelete={onDeleteCompetition}
        onUpdateBanner={onUpdateBanner}
      />
    </div>
  );
}
