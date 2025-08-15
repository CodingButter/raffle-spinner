/**
 * Slot Machine Spinner Module
 *
 * Exports all components and hooks related to the slot machine spinner
 */

// Export the original implementation that looks correct
export { SlotMachineWheel } from './SlotMachineWheelFixed';
export type { SlotMachineWheelProps } from './SlotMachineWheelFixed';

// Export the optimized high-performance version
export { SlotMachineWheelOptimized } from './SlotMachineWheelOptimized';
export type { SlotMachineWheelOptimizedProps } from './SlotMachineWheelOptimized';

// Keep the simple implementation available for future use
export { SlotMachineSimple } from './SlotMachineSimple';
export type { SlotMachineSimpleProps } from './SlotMachineSimple';

export { useSlotMachineAnimation } from './hooks/useSlotMachineAnimation';

export { drawSlotMachineSegment } from './components/SlotMachineSegment';
export { drawSlotMachineFrame } from './components/SlotMachineFrame';
