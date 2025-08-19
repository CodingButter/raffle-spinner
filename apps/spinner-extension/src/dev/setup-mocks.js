/**
 * Setup script for Chrome API mocks in standalone development
 * This ensures mocks are available before React components initialize
 */

import { setupChromeMocks, chromeStorageMock, chromeRuntimeMock, chromeTabsMock } from './chrome-mocks.js';

// Immediately setup mocks
console.log('[Setup] Initializing Chrome API mocks...');
setupChromeMocks();

// Verify mocks are available
if (!window.chrome) {
  console.error('[Setup] ❌ Failed to setup Chrome API mocks!');
  throw new Error('Chrome API mocks not available');
}

// Verify critical APIs
const requiredAPIs = [
  'chrome.storage',
  'chrome.storage.local',
  'chrome.storage.local.get',
  'chrome.storage.local.set',
  'chrome.storage.local.remove',
  'chrome.storage.local.clear',
  'chrome.storage.onChanged',
  'chrome.runtime',
  'chrome.runtime.getManifest',
  'chrome.runtime.sendMessage',
  'chrome.runtime.onMessage',
  'chrome.tabs',
  'chrome.sidePanel'
];

const missingAPIs = [];
requiredAPIs.forEach(api => {
  const parts = api.split('.');
  let current = window;
  for (const part of parts) {
    if (!current[part]) {
      missingAPIs.push(api);
      break;
    }
    current = current[part];
  }
});

if (missingAPIs.length > 0) {
  console.error('[Setup] ❌ Missing required Chrome APIs:', missingAPIs);
  throw new Error(`Missing Chrome APIs: ${missingAPIs.join(', ')}`);
}

console.log('[Setup] ✅ All required Chrome APIs are available');

// Export mocks for direct access
export { chromeStorageMock, chromeRuntimeMock, chromeTabsMock };

// Add global utilities for development
window.__chromeMocks = {
  storage: chromeStorageMock,
  runtime: chromeRuntimeMock,
  tabs: chromeTabsMock,
  
  // Utility functions
  clearStorage: () => {
    chromeStorageMock._reset();
    console.log('[Setup] Storage cleared');
  },
  
  loadMockData: (data) => {
    const defaultData = data || {
      competitions: [{
        id: 'dev-comp-1',
        name: 'Dev Test Competition',
        participants: [
          { firstName: 'Alice', lastName: 'Developer', ticketNumber: 'DEV001' },
          { firstName: 'Bob', lastName: 'Tester', ticketNumber: 'DEV002' },
          { firstName: 'Charlie', lastName: 'Designer', ticketNumber: 'DEV003' },
          { firstName: 'Diana', lastName: 'Manager', ticketNumber: 'DEV004' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      currentCompetitionId: 'dev-comp-1',
      settings: {
        minSpinDuration: 3,
        maxSpinDuration: 5,
        decelerationRate: 0.98,
        soundEnabled: true,
        confettiEnabled: true,
        wheelColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
        backgroundColor: '#1a1a2e',
        textColor: '#ffffff',
      },
      theme: {
        mode: 'dark',
        colors: {
          primary: '#4ECDC4',
          secondary: '#45B7D1',
          background: '#1a1a2e',
          text: '#ffffff',
        }
      }
    };
    
    chromeStorageMock._setData(defaultData);
    console.log('[Setup] Mock data loaded:', defaultData);
  },
  
  getStorageData: () => {
    const data = chromeStorageMock._getData();
    console.log('[Setup] Current storage data:', data);
    return data;
  },
  
  // Simulate Chrome API events
  simulateStorageChange: (changes) => {
    chromeStorageMock.onChanged.listeners.forEach(listener => {
      listener(changes, 'local');
    });
  },
  
  simulateMessage: (message, sender) => {
    chromeRuntimeMock.messageListeners.forEach(listener => {
      const senderInfo = sender || { id: 'mock-extension-id', tab: null };
      listener(message, senderInfo, (response) => {
        console.log('[Setup] Message response:', response);
      });
    });
  }
};

console.log('[Setup] Development utilities available at window.__chromeMocks');
console.log('[Setup] Available methods:');
console.log('  - __chromeMocks.clearStorage()');
console.log('  - __chromeMocks.loadMockData(data?)');
console.log('  - __chromeMocks.getStorageData()');
console.log('  - __chromeMocks.simulateStorageChange(changes)');
console.log('  - __chromeMocks.simulateMessage(message, sender?)');

// Load initial mock data if in development
if (import.meta.env.DEV) {
  console.log('[Setup] Development mode detected, loading initial mock data...');
  window.__chromeMocks.loadMockData();
}

// Mark mocks as ready
window.__chromeMocksReady = true;
console.log('[Setup] 🚀 Chrome mocks setup complete and ready!');