/**
 * Competition Management Component
 *
 * Purpose: Manages the competition list, CSV upload, and column mapping configuration
 * in a self-contained component.
 *
 * SRS Reference:
 * - FR-1.6: Competition Management
 * - FR-1.1: CSV File Upload Interface
 */

import { Competition, ColumnMapping } from '@raffle-spinner/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Settings, Play } from 'lucide-react';
import { CompetitionList } from './CompetitionList';

interface CompetitionManagementProps {
  competitions: Competition[];
  columnMapping: ColumnMapping | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteCompetition: (id: string) => void;
  onOpenMapper: () => void;
}

export function CompetitionManagement({
  competitions,
  columnMapping,
  fileInputRef,
  onFileSelect,
  onDeleteCompetition,
  onOpenMapper,
}: CompetitionManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competition Management</CardTitle>
        <CardDescription>Upload CSV files to create competitions for your raffles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileSelect}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload New Competition
          </Button>
          {columnMapping && (
            <Button variant="outline" onClick={onOpenMapper} className="gap-2">
              <Settings className="h-4 w-4" />
              Configure Column Mapping
            </Button>
          )}
          {competitions.length > 0 && (
            <Button
              variant="default"
              onClick={() => chrome.runtime.sendMessage({ action: 'openSidePanel' })}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Open Spinner
            </Button>
          )}
        </div>

        <CompetitionList competitions={competitions} onDelete={onDeleteCompetition} />
      </CardContent>
    </Card>
  );
}
