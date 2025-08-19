/**
 * Vitest Test Setup
 *
 * Purpose: Configure test environment and global mocks for Chrome extension testing.
 * 
 * This setup provides comprehensive Chrome API mocking for testing the extension
 * in a Node.js environment without requiring Chrome installation.
 */

import { vi, beforeEach } from 'vitest';
import { chromeStorageMock } from './mocks/chrome-storage';
import { chromeRuntimeMock } from './mocks/chrome-runtime';
import { chromeTabsMock } from './mocks/chrome-tabs';

// Configure Chrome API mocks
global.chrome = {
  storage: {
    local: chromeStorageMock,
    sync: chromeStorageMock, // Use same mock for sync
    managed: chromeStorageMock, // Use same mock for managed
    session: chromeStorageMock, // Use same mock for session
  },
  runtime: chromeRuntimeMock,
  tabs: chromeTabsMock,
  sidePanel: {
    open: vi.fn(() => Promise.resolve()),
    setOptions: vi.fn(() => Promise.resolve()),
    setPanelBehavior: vi.fn(() => Promise.resolve()),
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    setBadgeText: vi.fn(() => Promise.resolve()),
    setBadgeBackgroundColor: vi.fn(() => Promise.resolve()),
  },
} as unknown as typeof chrome;

// Reset all mocks before each test
beforeEach(() => {
  chromeStorageMock._reset();
  chromeRuntimeMock._reset();
  chromeTabsMock._reset();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof ResizeObserver;
