/**
 * Slot Machine Visual Constants
 * 
 * Shared constants used across all slot machine components for consistency
 * and performance optimization.
 */

// Visual dimensions
export const ITEM_HEIGHT = 80;
export const VISIBLE_ITEMS = 5;
export const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
export const WHEEL_WIDTH = 350;
export const PERSPECTIVE_SCALE = 0.15;
export const FRAME_BORDER_WIDTH = 8;
export const CANVAS_WIDTH = WHEEL_WIDTH + FRAME_BORDER_WIDTH * 2;
export const CANVAS_HEIGHT = VIEWPORT_HEIGHT + FRAME_BORDER_WIDTH * 2;

// Performance configuration
export const SUBSET_SIZE = 100; // Total entries to show in the wheel
export const SUBSET_HALF = 50; // Half of the subset size

// Animation settings
export const DEFAULT_MIN_SPIN_DURATION = 3;
export const DEFAULT_DECELERATION_RATE = 'medium';

// Rendering optimization
export const RENDER_BUFFER_SIZE = 2; // Extra items rendered above/below viewport