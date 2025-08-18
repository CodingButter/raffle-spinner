/**
 * Custom Test Assertions
 * 
 * Provides domain-specific assertions for testing
 * Chrome extension functionality.
 */

import { expect } from 'vitest';
import type { Competition, Participant, Winner, SpinnerSettings } from '@raffle-spinner/storage';

/**
 * Assert that storage was called with expected data
 */
export const expectStorageSet = (key: string, value: any) => {
  const chrome = global.chrome as any;
  expect(chrome.storage.local.set).toHaveBeenCalledWith(
    expect.objectContaining({ [key]: value }),
    expect.any(Function)
  );
};

/**
 * Assert that storage get was called for specific keys
 */
export const expectStorageGet = (keys: string | string[]) => {
  const chrome = global.chrome as any;
  expect(chrome.storage.local.get).toHaveBeenCalledWith(
    keys,
    expect.any(Function)
  );
};

/**
 * Assert that a runtime message was sent
 */
export const expectMessageSent = (message: any) => {
  const chrome = global.chrome as any;
  expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
    expect.objectContaining(message),
    expect.any(Function)
  );
};

/**
 * Assert competition validity
 */
export const expectValidCompetition = (competition: Competition) => {
  expect(competition).toHaveProperty('id');
  expect(competition).toHaveProperty('name');
  expect(competition).toHaveProperty('participants');
  expect(Array.isArray(competition.participants)).toBe(true);
  expect(competition).toHaveProperty('createdAt');
  expect(competition).toHaveProperty('updatedAt');
};

/**
 * Assert participant validity
 */
export const expectValidParticipant = (participant: Participant) => {
  expect(participant).toHaveProperty('firstName');
  expect(participant).toHaveProperty('lastName');
  expect(participant).toHaveProperty('ticketNumber');
  expect(participant.ticketNumber).toBeTruthy();
};

/**
 * Assert winner validity
 */
export const expectValidWinner = (winner: Winner) => {
  expectValidParticipant(winner);
  expect(winner).toHaveProperty('competitionId');
  expect(winner).toHaveProperty('competitionName');
  expect(winner).toHaveProperty('timestamp');
  expect(winner).toHaveProperty('sessionId');
  expect(winner).toHaveProperty('position');
};

/**
 * Assert settings validity
 */
export const expectValidSettings = (settings: SpinnerSettings) => {
  expect(settings).toHaveProperty('minSpinDuration');
  expect(settings).toHaveProperty('maxSpinDuration');
  expect(settings).toHaveProperty('decelerationRate');
  expect(settings).toHaveProperty('soundEnabled');
  expect(settings).toHaveProperty('confettiEnabled');
  expect(settings).toHaveProperty('wheelColors');
  expect(Array.isArray(settings.wheelColors)).toBe(true);
  expect(settings.wheelColors.length).toBeGreaterThan(0);
};

/**
 * Assert that no duplicate ticket numbers exist
 */
export const expectNoDuplicateTickets = (participants: Participant[]) => {
  const ticketNumbers = participants.map(p => p.ticketNumber);
  const uniqueTickets = new Set(ticketNumbers);
  expect(ticketNumbers.length).toBe(uniqueTickets.size);
};

/**
 * Assert spinner animation properties
 */
export const expectSpinnerAnimation = (element: HTMLElement, isSpinning: boolean) => {
  const transform = element.style.transform;
  
  if (isSpinning) {
    expect(transform).toContain('rotate');
    expect(element).toHaveClass('spinning');
  } else {
    expect(element).not.toHaveClass('spinning');
  }
};

/**
 * Assert Chrome side panel was opened
 */
export const expectSidePanelOpened = (options?: any) => {
  const chrome = global.chrome as any;
  expect(chrome.sidePanel.open).toHaveBeenCalledWith(
    options ? expect.objectContaining(options) : expect.any(Object)
  );
};

/**
 * Assert tab creation
 */
export const expectTabCreated = (url: string) => {
  const chrome = global.chrome as any;
  expect(chrome.tabs.create).toHaveBeenCalledWith(
    expect.objectContaining({ url }),
    expect.any(Function)
  );
};

/**
 * Custom matcher for checking if element is visible
 */
export const toBeVisible = (element: HTMLElement) => {
  const isVisible = 
    element &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    getComputedStyle(element).visibility !== 'hidden' &&
    getComputedStyle(element).display !== 'none';

  return {
    pass: isVisible,
    message: () => 
      isVisible 
        ? `Expected element not to be visible`
        : `Expected element to be visible`,
  };
};

/**
 * Custom matcher for checking spinner state
 */
export const toBeInSpinnerState = (element: HTMLElement, state: 'idle' | 'spinning' | 'decelerating' | 'stopped') => {
  const hasState = element.getAttribute('data-state') === state;
  
  return {
    pass: hasState,
    message: () => 
      hasState 
        ? `Expected spinner not to be in ${state} state`
        : `Expected spinner to be in ${state} state`,
  };
};