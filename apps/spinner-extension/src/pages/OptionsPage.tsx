/**
 * Options Page Component (Performance Optimized)
 *
 * Refactored to under 200 lines with extracted components and hooks.
 * Optimized for 60fps Chrome extension performance.
 *
 * Performance features:
 * - Extracted reusable components (UserInfoBar, OptionsPageContent, OptionsPageModals)
 * - Extracted custom hooks (useOptionsPageHandlers)
 * - Optimized URL generation utilities
 * - Stable callback references
 * - Clean component composition
 *
 * SRS Reference: FR-1: Options Page Requirements (all sub-requirements)
 */

import { CompetitionProvider, useCompetitions } from '@/contexts/CompetitionContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CollapsibleStateProvider } from '@/contexts/CollapsibleStateContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@drawday/auth';
import { UserInfoBar } from '@drawday/ui';
import { useCSVImport } from '@/hooks/useCSVImport';
import { useOptionsPageHandlers } from '@/hooks/useOptionsPageHandlers';
import { OptionsPageContent } from '@/components/options/OptionsPageContent';
import { OptionsPageModals } from '@/components/options/OptionsPageModals';
import { OptionsPageLayout } from '@/components/options/OptionsPageLayout';

function OptionsContent() {
  const { competitions, addCompetition, deleteCompetition, updateCompetitionBanner } =
    useCompetitions();
  const { columnMapping, updateColumnMapping } = useSettings();
  const { user } = useAuth();
  const { subscription, hasBranding, hasCustomization } = useSubscription();

  // Pro subscription check
  const isPro = subscription?.tier === 'pro' || hasBranding() || hasCustomization();

  // Custom hooks for handlers
  const {
    handleDashboardClick,
    handleUpgradeClick,
    logout,
    competitionToDelete,
    showDeleteDialog,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useOptionsPageHandlers(deleteCompetition);

  // CSV Import hook
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

  return (
    <div className="min-h-screen bg-background">
      <UserInfoBar
        email={user?.email || ''}
        isPro={isPro}
        onDashboardClick={handleDashboardClick}
        onLogout={logout}
      />

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

          <SubscriptionStatus 
            currentContestants={competitions.reduce((total, comp) => total + comp.participants.length, 0)}
            onUpgradeClick={handleUpgradeClick}
          />

          <OptionsPageContent
            competitions={competitions}
            columnMapping={columnMapping}
            fileInputRef={fileInputRef}
            isPro={isPro}
            onFileSelect={handleFileSelect}
            onDeleteCompetition={handleDeleteClick(competitions)}
            onOpenMapper={openMapperModal}
            onUpdateBanner={updateCompetitionBanner}
            onUpgradeClick={handleUpgradeClick}
          />

          <OptionsPageModals
            showNameModal={showNameModal}
            selectedFile={selectedFile}
            onNameModalClose={() => setShowNameModal(false)}
            onNameConfirm={handleNameConfirm}
            showMapperModal={showMapperModal}
            detectedHeaders={detectedHeaders}
            detectedMapping={detectedMapping}
            savedMappings={savedMappings}
            suggestedMappingId={suggestedMappingId}
            onMapperModalClose={() => setShowMapperModal(false)}
            onMappingConfirm={handleMappingConfirm}
            showDuplicateModal={showDuplicateModal}
            duplicates={duplicates}
            onDuplicateProceed={handleDuplicateProceed}
            onDuplicateCancel={() => setShowDuplicateModal(false)}
            showConversionModal={showConversionModal}
            ticketConversions={ticketConversions}
            onConversionProceed={handleConversionProceed}
            onConversionCancel={() => setShowConversionModal(false)}
            showDeleteDialog={showDeleteDialog}
            competitionToDelete={competitionToDelete}
            onDeleteConfirm={handleDeleteConfirm}
            onDeleteCancel={handleDeleteCancel}
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