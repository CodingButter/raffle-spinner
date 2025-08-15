/**
 * Colors Tab Component
 * Manages color customization settings
 */

import { Label } from '@/components/ui/label';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { SpinnerStyle } from '@raffle-spinner/storage';
import { ColorButton } from './ColorButton';
import { ShadowControls } from './ShadowControls';
import { CanvasBackgroundControl } from './CanvasBackgroundControl';
import { helpContent } from './helpContent';

interface ColorsTabProps {
  theme: any;
  activeColorPicker: string | null;
  setActiveColorPicker: (value: string | null) => void;
  updateSpinnerStyle: (style: Partial<SpinnerStyle>) => void;
  handleColorChange: (field: keyof SpinnerStyle, color: string) => void;
}

export function ColorsTab({
  theme,
  activeColorPicker,
  setActiveColorPicker,
  updateSpinnerStyle,
  handleColorChange,
}: ColorsTabProps) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Label>Color Scheme</Label>
        <InfoTooltip {...helpContent.colors} iconSize="sm" />
      </div>

      <div className="space-y-3">
        {/* Canvas Background */}
        <CanvasBackgroundControl
          theme={theme}
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          updateSpinnerStyle={updateSpinnerStyle}
        />

        {/* Shadow Controls */}
        <ShadowControls
          theme={theme}
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          updateSpinnerStyle={updateSpinnerStyle}
        />

        {/* Panel and Text Colors */}
        <ColorButton
          label="Panel Color"
          color={theme.spinnerStyle.backgroundColor}
          field="backgroundColor"
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          onColorChange={handleColorChange}
        />
        <ColorButton
          label="Name Color"
          color={theme.spinnerStyle.nameColor}
          field="nameColor"
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          onColorChange={handleColorChange}
        />
        <ColorButton
          label="Ticket Color"
          color={theme.spinnerStyle.ticketColor}
          field="ticketColor"
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          onColorChange={handleColorChange}
        />
        <ColorButton
          label="Border"
          color={theme.spinnerStyle.borderColor}
          field="borderColor"
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          onColorChange={handleColorChange}
        />
        <ColorButton
          label="Highlight"
          color={theme.spinnerStyle.highlightColor}
          field="highlightColor"
          activeColorPicker={activeColorPicker}
          setActiveColorPicker={setActiveColorPicker}
          onColorChange={handleColorChange}
        />
      </div>
    </>
  );
}