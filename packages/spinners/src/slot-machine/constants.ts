/**
 * Shared constants for the slot machine wheel components
 */

// Visual constants
export const ITEM_HEIGHT = 80;
export const VISIBLE_ITEMS = 5;
export const VIEWPORT_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
export const WHEEL_WIDTH = 350;
export const PERSPECTIVE_SCALE = 0.15;
export const FRAME_BORDER_WIDTH = 8; // Frame border thickness
export const CANVAS_WIDTH = WHEEL_WIDTH + FRAME_BORDER_WIDTH * 2; // Viewport width + borders
export const CANVAS_HEIGHT = VIEWPORT_HEIGHT + FRAME_BORDER_WIDTH * 2; // Viewport height + borders

// Subset configuration
export const SUBSET_SIZE = 100; // Total entries to show in the wheel (50 first + 50 last)
export const SUBSET_HALF = 50; // Half of the subset size