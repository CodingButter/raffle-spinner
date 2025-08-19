/**
 * Browser-compatible Chrome API Mocks for Standalone Development
 * 
 * This file provides complete mock implementations of Chrome Extension APIs
 * that work in a regular browser environment without requiring vitest.
 */

import { ChromeStorageMock } from './mocks/storage-mock.js';
import { ChromeRuntimeMock } from './mocks/runtime-mock.js';
import { ChromeTabsMock } from './mocks/tabs-mock.js';

// Initialize mocks
export const chromeStorageMock = new ChromeStorageMock();
export const chromeRuntimeMock = new ChromeRuntimeMock();
export const chromeTabsMock = new ChromeTabsMock();

// Setup Chrome API globally
export function setupChromeMocks() {
  console.log('[Chrome Mock] Setting up Chrome API mocks...');
  
  // Check if chrome already exists
  if (window.chrome) {
    console.warn('[Chrome Mock] window.chrome already exists, overwriting...');
  }

  // Create the full Chrome API mock
  window.chrome = {
    storage: {
      local: chromeStorageMock,
      sync: chromeStorageMock,
      managed: chromeStorageMock,
      session: chromeStorageMock,
      onChanged: chromeStorageMock.onChanged
    },
    runtime: chromeRuntimeMock,
    tabs: chromeTabsMock,
    sidePanel: {
      open: () => {
        console.log('[Chrome Mock] sidePanel.open called');
        return Promise.resolve();
      },
      setOptions: (options) => {
        console.log('[Chrome Mock] sidePanel.setOptions called with:', options);
        return Promise.resolve();
      },
      setPanelBehavior: (behavior) => {
        console.log('[Chrome Mock] sidePanel.setPanelBehavior called with:', behavior);
        return Promise.resolve();
      }
    },
    action: {
      onClicked: {
        addListener: (_listener) => {
          console.log('[Chrome Mock] action.onClicked.addListener called');
        },
        removeListener: (_listener) => {
          console.log('[Chrome Mock] action.onClicked.removeListener called');
        }
      },
      setBadgeText: (details) => {
        console.log('[Chrome Mock] action.setBadgeText called with:', details);
        return Promise.resolve();
      },
      setBadgeBackgroundColor: (details) => {
        console.log('[Chrome Mock] action.setBadgeBackgroundColor called with:', details);
        return Promise.resolve();
      }
    }
  };

  console.log('[Chrome Mock] ✅ Chrome API mocks setup complete!');
  console.log('[Chrome Mock] Available APIs:', Object.keys(window.chrome));
  
  // Return the mocks for direct access if needed
  return {
    storage: chromeStorageMock,
    runtime: chromeRuntimeMock,
    tabs: chromeTabsMock
  };
}

// Auto-setup if this script is loaded directly
if (typeof window !== 'undefined' && !window.chrome) {
  setupChromeMocks();
}