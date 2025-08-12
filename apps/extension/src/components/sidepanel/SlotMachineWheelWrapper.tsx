/**
 * SlotMachine Wheel Wrapper
 *
 * Wraps the shared SlotMachineWheel component from the spinner package
 * and adapts it to work with the extension's theme context.
 */

import { SlotMachineWheel } from '@raffle-spinner/spinners';
import { Participant, SpinnerSettings } from '@raffle-spinner/storage';
import { useTheme } from '@/contexts/ThemeContext';

interface SlotMachineWheelWrapperProps {
  participants: Participant[];
  targetTicketNumber: string;
  settings: SpinnerSettings;
  isSpinning: boolean;
  onSpinComplete: (winner: Participant) => void;
  onError?: (error: string) => void;
}

export function SlotMachineWheelWrapper({
  participants,
  targetTicketNumber,
  settings,
  isSpinning,
  onSpinComplete,
  onError,
}: SlotMachineWheelWrapperProps) {
  const { theme } = useTheme();

  // Convert ThemeSettings to SpinnerTheme format
  const spinnerTheme = {
    backgroundColor: theme.spinnerStyle.backgroundColor,
    canvasBackground: theme.spinnerStyle.canvasBackground,
    borderColor: theme.spinnerStyle.borderColor,
    highlightColor: theme.spinnerStyle.highlightColor,
    nameColor: theme.spinnerStyle.nameColor,
    ticketColor: theme.spinnerStyle.ticketColor,
    fontFamily: theme.spinnerStyle.fontFamily,
    nameSize: theme.spinnerStyle.nameSize,
    ticketSize: theme.spinnerStyle.ticketSize,
    topShadowOpacity: theme.spinnerStyle.topShadowOpacity,
    bottomShadowOpacity: theme.spinnerStyle.bottomShadowOpacity,
    shadowSize: theme.spinnerStyle.shadowSize,
    shadowColor: theme.spinnerStyle.shadowColor,
  };

  // Show debug info in development mode
  // @ts-expect-error - import.meta.env is available in Vite
  const showDebug = import.meta.env?.DEV || false;

  return (
    <SlotMachineWheel
      participants={participants}
      targetTicketNumber={targetTicketNumber}
      settings={settings}
      isSpinning={isSpinning}
      onSpinComplete={onSpinComplete}
      onError={onError}
      theme={spinnerTheme}
      showDebug={showDebug}
    />
  );
}
