/**
 * OptionsPage main content sections
 * Extracted from OptionsPage.tsx to improve file size and separation of concerns
 */

import { CollapsibleCard } from '@drawday/ui';
import { useCollapsibleState } from '@/contexts/CollapsibleStateContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Competition, ColumnMapping } from '@raffle-spinner/storage';
import { CompetitionManagementContent } from './CompetitionManagementContent';
import { SpinnerSettings } from './SpinnerSettings';
import { SpinnerCustomization } from './SpinnerCustomization';
import { ThemeColors } from './ThemeColors';
import { BrandingSettings } from './BrandingSettings';
import { SavedMappingsManager } from './SavedMappingsManager';

interface OptionsPageContentProps {
  competitions: Competition[];
  columnMapping: ColumnMapping | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isPro: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteCompetition: (id: string) => void;
  onOpenMapper: () => void;
  onUpdateBanner: (id: string, banner: string | undefined) => void;
  onUpgradeClick: () => void;
}

export function OptionsPageContent({
  competitions,
  columnMapping,
  fileInputRef,
  isPro,
  onFileSelect,
  onDeleteCompetition,
  onOpenMapper,
  onUpdateBanner,
  onUpgradeClick,
}: OptionsPageContentProps) {
  const { collapsedSections, toggleSection } = useCollapsibleState();
  const { settings, updateSettings } = useSettings();

  return (
    <>
      <CollapsibleCard
        sectionKey="competitions"
        title="Competition Management"
        description="Import and manage raffle competitions"
        isCollapsed={collapsedSections.competitions}
        onToggle={toggleSection}
      >
        <CompetitionManagementContent
          competitions={competitions}
          columnMapping={columnMapping}
          fileInputRef={fileInputRef}
          onFileSelect={onFileSelect}
          onDeleteCompetition={onDeleteCompetition}
          onOpenMapper={onOpenMapper}
          onUpdateBanner={onUpdateBanner}
          onUpgradeClick={onUpgradeClick}
        />
      </CollapsibleCard>

      <CollapsibleCard
        sectionKey="settings"
        title="Spinner Settings"
        description="Configure spin duration and physics"
        isCollapsed={collapsedSections.settings}
        onToggle={toggleSection}
      >
        <SpinnerSettings settings={settings} onUpdate={updateSettings} />
      </CollapsibleCard>

      <CollapsibleCard
        sectionKey="theme"
        title="Spinner Appearance"
        description={isPro ? 'Customize the look of your spinner' : 'Upgrade to Pro to customize appearance'}
        isCollapsed={collapsedSections.theme}
        onToggle={toggleSection}
        disabled={!isPro}
        proBadge={!isPro ? 'PRO' : undefined}
        onDisabledClick={onUpgradeClick}
      >
        <SpinnerCustomization />
        <div className="mt-6">
          <ThemeColors />
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        sectionKey="branding"
        title="Branding"
        description={isPro ? 'Add your logo and company information' : 'Upgrade to Pro to add custom branding'}
        isCollapsed={collapsedSections.branding}
        onToggle={toggleSection}
        disabled={!isPro}
        proBadge={!isPro ? 'PRO' : undefined}
        onDisabledClick={onUpgradeClick}
      >
        <BrandingSettings />
      </CollapsibleCard>

      <CollapsibleCard
        sectionKey="help"
        title="CSV Column Mappings"
        description="Manage saved column mapping templates"
        isCollapsed={collapsedSections.help}
        onToggle={toggleSection}
      >
        <SavedMappingsManager />
      </CollapsibleCard>
    </>
  );
}