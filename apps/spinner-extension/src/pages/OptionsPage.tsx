/**
 * Options Page Component (Refactored)
 *
 * Purpose: Simplified main configuration page that delegates functionality
 * to specialized hooks and components.
 *
 * SRS Reference:
 * - FR-1: Options Page Requirements (all sub-requirements)
 */

import { useState } from 'react';
import { CompetitionProvider, useCompetitions } from '@/contexts/CompetitionContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CollapsibleStateProvider, useCollapsibleState } from '@/contexts/CollapsibleStateContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@drawday/auth';
import { useCSVImport } from '@/hooks/useCSVImport';
import { CompetitionManagementContent } from '@/components/options/CompetitionManagementContent';
import { CSVUploadModal } from '@/components/options/CSVUploadModal';
import { ColumnMapper } from '@/components/options/ColumnMapper';
import { DuplicateHandler } from '@/components/options/DuplicateHandler';
import { DeleteConfirmDialog } from '@/components/options/DeleteConfirmDialog';
import { TicketConversionDialog } from '@/components/options/TicketConversionDialog';
import { SpinnerSettings } from '@/components/options/SpinnerSettings';
import { SpinnerCustomization } from '@/components/options/SpinnerCustomization';
import { ThemeColors } from '@/components/options/ThemeColors';
import { BrandingSettings } from '@/components/options/BrandingSettings';
import { SavedMappingsManager } from '@/components/options/SavedMappingsManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Competition } from '@raffle-spinner/storage';

function OptionsContent() {
  const { competitions, addCompetition, deleteCompetition, updateCompetitionBanner } =
    useCompetitions();
  const { settings, columnMapping, updateSettings, updateColumnMapping } = useSettings();
  const { collapsedSections, toggleSection } = useCollapsibleState();
  const { user, logout } = useAuth();

  // Check if user has pro subscription for customization features
  const isPro = user?.role === 'pro' || user?.role === 'admin';

  const [competitionToDelete, setCompetitionToDelete] = useState<Competition | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    fileInputRef,
    selectedFile,
    showNameModal,
    showMapperModal,
    showDuplicateModal,
    showConversionModal,
    detectedHeaders,
    detectedMapping,
    duplicates,
    ticketConversions,
    importSummary,
    savedMappings,
    suggestedMappingId,
    handleFileSelect,
    handleMappingConfirm,
    handleNameConfirm,
    handleDuplicateProceed,
    handleConversionProceed,
    setShowNameModal,
    setShowMapperModal,
    setShowDuplicateModal,
    setShowConversionModal,
    openMapperModal,
  } = useCSVImport({
    addCompetition,
    columnMapping,
    updateColumnMapping,
  });

  const handleDeleteClick = (id: string) => {
    const competition = competitions.find((c) => c.id === id);
    if (competition) {
      setCompetitionToDelete(competition);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (competitionToDelete) {
      await deleteCompetition(competitionToDelete.id);
      setCompetitionToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setCompetitionToDelete(null);
    setShowDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* User Info Bar */}
      <div className="border-b border-border bg-card/50 px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Logged in as:</span>
            <span className="font-medium">{user?.email}</span>
            {isPro ? (
              <span className="px-2 py-0.5 bg-brand-gold/20 text-brand-gold text-xs font-semibold rounded">
                PRO
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded">
                FREE
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Raffle Spinner Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Manage competitions and customize spinner settings
            </p>
          </div>

          {importSummary && (
            <Alert variant={importSummary.success ? 'default' : 'destructive'}>
              {importSummary.success && <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{importSummary.message}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleSection('competitions')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Competition Management</CardTitle>
                  <CardDescription>Import and manage raffle competitions</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  {collapsedSections.competitions ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.competitions && (
              <CardContent>
                <CompetitionManagementContent
                  competitions={competitions}
                  columnMapping={columnMapping}
                  fileInputRef={fileInputRef}
                  onFileSelect={handleFileSelect}
                  onDeleteCompetition={handleDeleteClick}
                  onOpenMapper={openMapperModal}
                  onUpdateBanner={updateCompetitionBanner}
                />
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleSection('settings')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Spinner Settings</CardTitle>
                  <CardDescription>Configure spin duration and physics</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  {collapsedSections.settings ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.settings && (
              <CardContent>
                <SpinnerSettings settings={settings} onUpdate={updateSettings} />
              </CardContent>
            )}
          </Card>

          {/* Spinner Appearance - Pro only */}
          <Card className={!isPro ? 'opacity-60' : ''}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => isPro && toggleSection('theme')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Spinner Appearance
                    {!isPro && (
                      <span className="text-xs px-2 py-0.5 bg-brand-gold/20 text-brand-gold rounded font-normal">
                        PRO
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isPro
                      ? 'Customize the look of your spinner'
                      : 'Upgrade to Pro to customize appearance'}
                  </CardDescription>
                </div>
                {isPro && (
                  <Button variant="ghost" size="icon">
                    {collapsedSections.theme ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            {isPro && !collapsedSections.theme && (
              <CardContent>
                <SpinnerCustomization />
                <div className="mt-6">
                  <ThemeColors />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Branding - Pro only */}
          <Card className={!isPro ? 'opacity-60' : ''}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => isPro && toggleSection('branding')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Branding
                    {!isPro && (
                      <span className="text-xs px-2 py-0.5 bg-brand-gold/20 text-brand-gold rounded font-normal">
                        PRO
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isPro
                      ? 'Add your logo and company information'
                      : 'Upgrade to Pro to add custom branding'}
                  </CardDescription>
                </div>
                {isPro && (
                  <Button variant="ghost" size="icon">
                    {collapsedSections.branding ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            {isPro && !collapsedSections.branding && (
              <CardContent>
                <BrandingSettings />
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleSection('help')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>CSV Column Mappings</CardTitle>
                  <CardDescription>Manage saved column mapping templates</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  {collapsedSections.help ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.help && (
              <CardContent>
                <SavedMappingsManager />
              </CardContent>
            )}
          </Card>

          {/* Modals */}
          <CSVUploadModal
            open={showNameModal}
            onClose={() => setShowNameModal(false)}
            onConfirm={handleNameConfirm}
            fileName={selectedFile?.name || ''}
          />

          <ColumnMapper
            open={showMapperModal}
            onClose={() => setShowMapperModal(false)}
            headers={detectedHeaders}
            detectedMapping={detectedMapping}
            onConfirm={handleMappingConfirm}
            savedMappings={savedMappings}
            suggestedMappingId={suggestedMappingId}
          />

          <DuplicateHandler
            open={showDuplicateModal}
            duplicates={duplicates}
            onProceed={handleDuplicateProceed}
            onCancel={() => setShowDuplicateModal(false)}
          />

          <TicketConversionDialog
            open={showConversionModal}
            conversions={ticketConversions}
            onProceed={handleConversionProceed}
            onCancel={() => setShowConversionModal(false)}
          />

          <DeleteConfirmDialog
            open={showDeleteDialog}
            competition={competitionToDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        </div>
      </div>
    </div>
  );
}

export function OptionsPage() {
  return (
    <ThemeProvider>
      <AuthGuard>
        <CompetitionProvider>
          <SettingsProvider>
            <CollapsibleStateProvider>
              <OptionsContent />
            </CollapsibleStateProvider>
          </SettingsProvider>
        </CompetitionProvider>
      </AuthGuard>
    </ThemeProvider>
  );
}
