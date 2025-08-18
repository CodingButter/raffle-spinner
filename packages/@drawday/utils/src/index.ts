import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Export logger
export { logger, LogLevel, type LogContext, type LoggerConfig } from './logger';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a ticket number by removing leading zeros and trimming whitespace.
 * Ensures single '0' is preserved.
 *
 * @param ticket - The ticket number to normalize
 * @returns The normalized ticket number
 *
 * @example
 * normalizeTicketNumber('0001') // returns '1'
 * normalizeTicketNumber('  042  ') // returns '42'
 * normalizeTicketNumber('0') // returns '0'
 * normalizeTicketNumber('000') // returns '0'
 */
export function normalizeTicketNumber(ticket: string): string {
  const trimmed = ticket.trim();
  // Remove leading zeros but keep single '0'
  return trimmed.replace(/^0+/, '') || '0';
}

/**
 * Extracts numeric portion from a ticket string.
 * Returns only the digits from the ticket, or null if no digits found.
 *
 * @param ticket - The ticket string to extract numbers from
 * @returns The numeric portion as a string, or null if no numbers
 *
 * @example
 * extractNumericTicket('ABC123') // returns '123'
 * extractNumericTicket('T-456-X') // returns '456'
 * extractNumericTicket('789') // returns '789'
 * extractNumericTicket('ABC') // returns null
 */
export function extractNumericTicket(ticket: string): string | null {
  const digits = ticket.replace(/\D/g, '');
  return digits.length > 0 ? digits : null;
}

/**
 * Validates if a ticket is purely numeric (may have leading zeros).
 *
 * @param ticket - The ticket to validate
 * @returns True if ticket contains only digits
 */
export function isNumericTicket(ticket: string): boolean {
  return /^\d+$/.test(ticket.trim());
}

/**
 * Adjusts the brightness of a hex color
 * @param color - Hex color string (e.g., '#ffffff')
 * @param percent - Amount to adjust (-255 to 255)
 * @returns Adjusted hex color string
 */
export function adjustBrightness(color: string, percent: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + percent));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + percent));
    const b = Math.max(0, Math.min(255, (num & 255) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  // For non-hex colors, return with opacity adjustment
  return color;
}
