import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
