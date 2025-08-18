/**
 * Slot Machine Spinner Module
 *
 * Exports all components and hooks related to the slot machine spinner
 */

// Export the clean, properly refactored implementation
export { SlotMachineWheel } from './SlotMachineWheel';
export type { SlotMachineWheelProps } from './SlotMachineWheel';

// Keep the simple implementation available for future use
export { SlotMachineSimple } from './SlotMachineSimple';
export type { SlotMachineSimpleProps } from './SlotMachineSimple';

export { useSlotMachineAnimation } from './hooks/useSlotMachineAnimation';

export { drawSlotMachineSegment } from './components/SlotMachineSegment';
export { drawSlotMachineFrame } from './components/SlotMachineFrame';
